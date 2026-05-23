import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { chargeAuthorization } from "@/lib/paystack";
import { checkRateLimit, checkoutLimiter } from "@/lib/rate-limit";
import { sendAdminNewOrder, sendPaymentConfirmed } from "@/lib/email";

/**
 * Server-side re-charge using a saved Paystack authorization. The customer
 * never leaves the site — we hit Paystack directly with the stored token.
 *
 * Returns { paid: true } on success so the client can route to the order
 * page; { paid: false, fallback: true } if the charge fails (caller should
 * fall back to the interactive Paystack redirect flow).
 */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limit = await checkRateLimit(
    checkoutLimiter,
    `charge-saved:${session.user.id}`
  );
  if (!limit.success) {
    return NextResponse.json(
      { error: "Too many payment attempts. Try again in a few minutes." },
      { status: 429 }
    );
  }

  const body = await req.json();
  const orderId = (body?.orderId as string | undefined)?.trim();
  const cardId = (body?.cardId as string | undefined)?.trim();
  if (!orderId || !cardId) {
    return NextResponse.json(
      { error: "orderId and cardId are required" },
      { status: 400 }
    );
  }

  const [order, card] = await Promise.all([
    db.order.findUnique({
      where: { id: orderId },
      include: { user: { select: { email: true } } },
    }),
    db.savedCard.findUnique({ where: { id: cardId } }),
  ]);

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  if (order.userId !== session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  if (order.paymentStatus === "PAID") {
    return NextResponse.json(
      { error: "Order is already paid" },
      { status: 400 }
    );
  }
  if (!card || card.userId !== session.user.id) {
    return NextResponse.json(
      { error: "Saved card not found" },
      { status: 404 }
    );
  }

  const reference = `${order.orderNumber}-${Date.now()}`;

  // Best-effort charge — we always tell the client whether it worked so it
  // can fall back to the interactive flow if Paystack declined.
  let chargeResult;
  try {
    chargeResult = await chargeAuthorization({
      email: order.user.email,
      amount: order.total * 100,
      authorization_code: card.authorizationCode,
      reference,
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
      },
    });
  } catch (err) {
    console.error("[charge-saved] paystack call failed:", err);
    return NextResponse.json({ paid: false, fallback: true });
  }

  const status = chargeResult?.data?.status;
  if (status !== "success") {
    // Could be "failed", "send_otp", "send_pin" or similar. The interactive
    // redirect flow handles those better than we can in-page.
    return NextResponse.json({
      paid: false,
      fallback: true,
      reason: chargeResult?.message ?? status ?? "unknown",
    });
  }

  // Charge succeeded — mark the order paid in one transaction.
  const paidStatus =
    order.status === "PENDING"
      ? order.fulfillmentType === "STOCKPILE"
        ? "STOCKPILED"
        : "CONFIRMED"
      : order.status;

  await db.$transaction(async (tx) => {
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
        note: `Charged saved card (${card.cardType} •••• ${card.last4}) — ref: ${reference}`,
      },
    });
  });

  // Mirror the webhook's email fan-out so the customer + admin still get
  // notified when the charge is fully server-side and bypasses the redirect.
  const customer = await db.user.findUnique({
    where: { id: order.userId },
    select: { firstName: true, lastName: true, email: true, phone: true },
  });
  const itemCount = await db.orderItem.count({ where: { orderId: order.id } });
  if (customer) {
    after(() =>
      sendPaymentConfirmed({
        to: customer.email,
        customerName: customer.firstName,
        orderId: order.id,
        orderNumber: order.orderNumber,
        total: order.total,
        channel: chargeResult.data?.channel ?? "card",
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
        paymentChannel: chargeResult.data?.channel ?? "card",
      })
    );
  }

  return NextResponse.json({
    paid: true,
    orderNumber: order.orderNumber,
  });
}
