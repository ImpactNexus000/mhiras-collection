import { NextRequest, NextResponse, after } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { sendPaymentConfirmed } from "@/lib/email";

export async function POST(req: NextRequest) {
  const body = await req.text();

  // Verify the webhook signature
  const signature = req.headers.get("x-paystack-signature");
  const secret = process.env.PAYSTACK_SECRET_KEY!;
  const hash = crypto
    .createHmac("sha512", secret)
    .update(body)
    .digest("hex");

  if (signature !== hash) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(body);

  if (event.event === "charge.success") {
    const { reference, amount, channel, metadata } = event.data;

    // Stockpile delivery-request payment (delivery fee)
    const deliveryRequestId = metadata?.deliveryRequestId as string | undefined;
    if (deliveryRequestId) {
      const request = await db.deliveryRequest.findUnique({
        where: { id: deliveryRequestId },
      });
      if (request && request.paymentStatus !== "PAID") {
        await db.deliveryRequest.update({
          where: { id: request.id },
          data: {
            paymentStatus: "PAID",
            status: "PAID",
            paymentRef: reference,
          },
        });
      }
      return NextResponse.json({ received: true });
    }

    const orderId = metadata?.orderId as string | undefined;

    // Find the order by payment reference or metadata orderId
    const order = orderId
      ? await db.order.findUnique({ where: { id: orderId } })
      : await db.order.findFirst({ where: { paymentRef: reference } });

    if (!order) {
      console.error(`Webhook: Order not found for reference ${reference}`);
      // Return 200 so Paystack doesn't retry
      return NextResponse.json({ received: true });
    }

    // Skip if already paid (idempotency)
    if (order.paymentStatus === "PAID") {
      return NextResponse.json({ received: true });
    }

    // Verify the amount matches (in kobo)
    const expectedAmount = order.total * 100;
    if (amount !== expectedAmount) {
      console.error(
        `Webhook: Amount mismatch for order ${order.orderNumber}. Expected ${expectedAmount}, got ${amount}`
      );
      // Still update reference but flag as potential issue
    }

    // Update order: mark as paid and confirmed
    await db.$transaction(async (tx) => {
      // A paid stockpile order becomes STOCKPILED (held); a normal order
      // becomes CONFIRMED.
      const paidStatus =
        order.status === "PENDING"
          ? order.fulfillmentType === "STOCKPILE"
            ? "STOCKPILED"
            : "CONFIRMED"
          : order.status;

      await tx.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: "PAID",
          paymentRef: reference,
          status: paidStatus,
        },
      });

      await tx.orderEvent.create({
        data: {
          orderId: order.id,
          status:
            paidStatus === "STOCKPILED"
              ? "Payment confirmed — added to stockpile"
              : "Payment confirmed",
          note: `Paid via ${channel} — ref: ${reference}`,
        },
      });
    });

    // Send payment-confirmed email — canonical fire point. The order-page
    // callback (verifyPaymentCallback) updates the DB silently to keep the
    // race-window single-email.
    const customer = await db.user.findUnique({
      where: { id: order.userId },
      select: { firstName: true, email: true },
    });
    if (customer) {
      after(() =>
        sendPaymentConfirmed({
          to: customer.email,
          customerName: customer.firstName,
          orderId: order.id,
          orderNumber: order.orderNumber,
          total: order.total,
          channel,
          fulfillmentType: order.fulfillmentType,
        })
      );
    }
  }

  if (event.event === "charge.failed") {
    const { reference, metadata } = event.data;

    const failedDeliveryRequestId = metadata?.deliveryRequestId as
      | string
      | undefined;
    if (failedDeliveryRequestId) {
      const request = await db.deliveryRequest.findUnique({
        where: { id: failedDeliveryRequestId },
      });
      if (request && request.paymentStatus !== "PAID") {
        await db.deliveryRequest.update({
          where: { id: request.id },
          data: { paymentStatus: "FAILED" },
        });
      }
      return NextResponse.json({ received: true });
    }

    const orderId = metadata?.orderId as string | undefined;
    const order = orderId
      ? await db.order.findUnique({ where: { id: orderId } })
      : await db.order.findFirst({ where: { paymentRef: reference } });

    if (order && order.paymentStatus !== "PAID") {
      await db.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: order.id },
          data: { paymentStatus: "FAILED" },
        });

        await tx.orderEvent.create({
          data: {
            orderId: order.id,
            status: "Payment failed",
            note: `Reference: ${reference}`,
          },
        });
      });
    }
  }

  // Always return 200 to acknowledge receipt
  return NextResponse.json({ received: true });
}
