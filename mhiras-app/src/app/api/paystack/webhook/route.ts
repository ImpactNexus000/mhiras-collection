import { NextRequest, NextResponse, after } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import {
  sendAdminNewOrder,
  sendAdminRefundRequired,
  sendPaymentConfirmed,
} from "@/lib/email";
import {
  reacquireOrderStock,
  releaseOrderStock,
  StockUnavailableError,
} from "@/lib/stock";
import type { PaystackAuthorization } from "@/lib/paystack";

/**
 * Save the tokenized card from a successful charge so the customer can
 * reuse it. Idempotent on authorizationCode (Paystack returns the same
 * token for repeat charges with the same card).
 */
async function maybeSaveAuthorization(
  userId: string,
  authorization: PaystackAuthorization | undefined
) {
  if (!authorization || !authorization.reusable) return;
  const existing = await db.savedCard.findUnique({
    where: { authorizationCode: authorization.authorization_code },
  });
  if (existing) return;

  // First card on the account becomes the default.
  const count = await db.savedCard.count({ where: { userId } });

  await db.savedCard.create({
    data: {
      userId,
      authorizationCode: authorization.authorization_code,
      last4: authorization.last4,
      expMonth: authorization.exp_month,
      expYear: authorization.exp_year,
      cardType: authorization.card_type,
      bank: authorization.bank ?? null,
      isDefault: count === 0,
    },
  });
}

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
    const { reference, amount, channel, metadata, authorization } =
      event.data as {
        reference: string;
        amount: number;
        channel: string;
        metadata: Record<string, unknown> | undefined;
        authorization?: PaystackAuthorization;
      };

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

    // Resolve the payment. Usually the order is still held (stock reserved at
    // placement) and we simply confirm it. But if the stock was already
    // released — a failed/abandoned payment the cron cleaned up — this is a
    // *late* payment: try to re-reserve the items, and if they're gone, flag
    // the order for a manual refund instead of fulfilling it.
    const outcome = await db.$transaction(async (tx) => {
      const fresh = await tx.order.findUnique({ where: { id: order.id } });
      if (!fresh || fresh.paymentStatus === "PAID") return "noop" as const;

      const isLate = fresh.stockReleased || fresh.status === "CANCELLED";

      if (isLate) {
        try {
          await reacquireOrderStock(tx, fresh.id);
        } catch (err) {
          if (err instanceof StockUnavailableError) {
            await tx.order.update({
              where: { id: fresh.id },
              data: { paymentStatus: "PAID", paymentRef: reference },
            });
            await tx.orderEvent.create({
              data: {
                orderId: fresh.id,
                status: "Payment received after cancellation — refund required",
                note: `Item sold out before this late payment landed (ref ${reference}). Manual refund needed.`,
              },
            });
            return "refund" as const;
          }
          throw err;
        }
      }

      // A paid stockpile order becomes STOCKPILED (held); everything else
      // becomes CONFIRMED — reinstated, if this was a late payment.
      const paidStatus =
        fresh.fulfillmentType === "STOCKPILE"
          ? "STOCKPILED"
          : isLate || fresh.status === "PENDING"
            ? "CONFIRMED"
            : fresh.status;

      await tx.order.update({
        where: { id: fresh.id },
        data: {
          paymentStatus: "PAID",
          paymentRef: reference,
          status: paidStatus,
        },
      });

      await tx.orderEvent.create({
        data: {
          orderId: fresh.id,
          status:
            paidStatus === "STOCKPILED"
              ? isLate
                ? "Payment confirmed (late) — added to stockpile"
                : "Payment confirmed — added to stockpile"
              : isLate
                ? "Payment confirmed (late) — order reinstated"
                : "Payment confirmed",
          note: `Paid via ${channel} — ref: ${reference}`,
        },
      });
      return "confirmed" as const;
    });

    if (outcome === "noop") {
      return NextResponse.json({ received: true });
    }

    // A payment did land, so persist the reusable card either way.
    await maybeSaveAuthorization(order.userId, authorization);

    if (outcome === "refund") {
      console.error(
        `Webhook: late payment on cancelled order ${order.orderNumber} — item unavailable, manual refund required (ref ${reference})`
      );
      const refundCustomer = await db.user.findUnique({
        where: { id: order.userId },
        select: { firstName: true, lastName: true, email: true, phone: true },
      });
      if (refundCustomer) {
        after(() =>
          sendAdminRefundRequired({
            orderId: order.id,
            orderNumber: order.orderNumber,
            customerName: `${refundCustomer.firstName} ${refundCustomer.lastName}`,
            customerEmail: refundCustomer.email,
            customerPhone: refundCustomer.phone ?? "",
            total: order.total,
            paymentRef: reference,
            paymentChannel: channel,
          })
        );
      }
      return NextResponse.json({ received: true });
    }

    // Customer payment-confirmed email — canonical fire point. The order
    // page's verifyPaymentCallback updates the DB silently to keep this
    // single-email even when both paths run during the race window.
    const customer = await db.user.findUnique({
      where: { id: order.userId },
      select: { firstName: true, lastName: true, email: true, phone: true },
    });
    const itemCount = await db.orderItem.count({
      where: { orderId: order.id },
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
      after(() =>
        sendAdminNewOrder({
          orderId: order.id,
          orderNumber: order.orderNumber,
          customerName: `${customer.firstName} ${customer.lastName}`,
          customerEmail: customer.email,
          customerPhone: customer.phone ?? "",
          itemCount,
          total: order.total,
          fulfillmentType: order.fulfillmentType,
          paymentChannel: channel,
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

        // Return the reserved items immediately on an explicit failure. The
        // cron handles silent abandonment (no webhook); this covers declines.
        const released = await releaseOrderStock(tx, order.id);

        await tx.orderEvent.create({
          data: {
            orderId: order.id,
            status: "Payment failed",
            note: released
              ? `Reference: ${reference} — items returned to stock.`
              : `Reference: ${reference}`,
          },
        });
      });
    }

  }

  // Always return 200 to acknowledge receipt
  return NextResponse.json({ received: true });
}
