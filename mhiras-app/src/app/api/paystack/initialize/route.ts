import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { initializeTransaction } from "@/lib/paystack";
import { checkRateLimit, checkoutLimiter } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limit = await checkRateLimit(
    checkoutLimiter,
    `paystack-init:${session.user.id}`
  );
  if (!limit.success) {
    return NextResponse.json(
      { error: "Too many payment attempts. Try again in a few minutes." },
      { status: 429 }
    );
  }

  const body = await req.json();
  const { orderId, deliveryRequestId } = body;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;

  // ── Delivery-request payment (stockpile delivery fee) ──────────────
  if (deliveryRequestId) {
    const request = await db.deliveryRequest.findUnique({
      where: { id: deliveryRequestId },
      include: { user: { select: { email: true } } },
    });

    if (!request) {
      return NextResponse.json(
        { error: "Delivery request not found" },
        { status: 404 }
      );
    }
    if (request.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    if (request.paymentStatus === "PAID") {
      return NextResponse.json(
        { error: "This delivery request is already paid" },
        { status: 400 }
      );
    }

    const reference = `${request.requestNumber}-${Date.now()}`;

    try {
      const response = await initializeTransaction({
        email: request.user.email,
        amount: request.deliveryFee * 100, // kobo
        reference,
        callback_url: `${baseUrl}/account/stockpile?payment=callback`,
        metadata: {
          deliveryRequestId: request.id,
          requestNumber: request.requestNumber,
        },
      });

      await db.deliveryRequest.update({
        where: { id: request.id },
        data: { paymentRef: reference },
      });

      return NextResponse.json({
        authorization_url: response.data.authorization_url,
        reference: response.data.reference,
      });
    } catch (error) {
      console.error("Paystack initialization error:", error);
      return NextResponse.json(
        { error: "Failed to initialize payment" },
        { status: 500 }
      );
    }
  }

  // ── Order payment ──────────────────────────────────────────────────
  if (!orderId) {
    return NextResponse.json(
      { error: "Order ID is required" },
      { status: 400 }
    );
  }

  // Fetch order and verify it belongs to the user
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: {
      user: { select: { email: true } },
    },
  });

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

  // Generate a unique payment reference
  const reference = `${order.orderNumber}-${Date.now()}`;

  try {
    const response = await initializeTransaction({
      email: order.user.email,
      amount: order.total * 100, // Convert to kobo
      reference,
      callback_url: `${baseUrl}/order/${order.orderNumber}?payment=callback`,
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
      },
    });

    // Save the payment reference on the order
    await db.order.update({
      where: { id: orderId },
      data: { paymentRef: reference },
    });

    return NextResponse.json({
      authorization_url: response.data.authorization_url,
      reference: response.data.reference,
    });
  } catch (error) {
    console.error("Paystack initialization error:", error);
    return NextResponse.json(
      { error: "Failed to initialize payment" },
      { status: 500 }
    );
  }
}
