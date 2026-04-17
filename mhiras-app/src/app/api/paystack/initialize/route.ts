import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { initializeTransaction } from "@/lib/paystack";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { orderId } = body;

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

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;

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
