"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { generateOrderNumber } from "@/lib/queries/orders";
import { PaymentMethod } from "@/generated/prisma/client";

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size?: string | null;
}

const paymentMethodMap: Record<string, PaymentMethod> = {
  card: "CARD",
  bank_transfer: "BANK_TRANSFER",
  pay_on_delivery: "PAY_ON_DELIVERY",
};

export async function placeOrder(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be signed in to place an order." };
  }

  const userId = session.user.id;

  // Parse form fields
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const phone = formData.get("phone") as string;
  const email = formData.get("email") as string;
  const address = formData.get("address") as string;
  const state = formData.get("state") as string;
  const lga = formData.get("lga") as string;
  const paymentMethodKey = formData.get("paymentMethod") as string;
  const itemsJson = formData.get("items") as string;

  // Validation
  if (!firstName || !lastName || !phone || !address || !state) {
    return { error: "Please fill in all delivery details." };
  }

  if (!paymentMethodKey || !paymentMethodMap[paymentMethodKey]) {
    return { error: "Please select a valid payment method." };
  }

  let cartItems: CartItem[];
  try {
    cartItems = JSON.parse(itemsJson);
  } catch {
    return { error: "Invalid cart data." };
  }

  if (!cartItems || cartItems.length === 0) {
    return { error: "Your cart is empty." };
  }

  // Verify stock and calculate totals from DB (don't trust client prices)
  const productIds = cartItems.map((item) => item.productId);
  const products = await db.product.findMany({
    where: { id: { in: productIds } },
  });

  const productMap = new Map(products.map((p) => [p.id, p]));

  for (const item of cartItems) {
    const product = productMap.get(item.productId);
    if (!product) {
      return { error: `Product "${item.name}" is no longer available.` };
    }
    if (product.stock < item.quantity) {
      return {
        error: `"${product.name}" only has ${product.stock} in stock.`,
      };
    }
  }

  // Calculate totals using server-side prices
  const subtotal = cartItems.reduce((sum, item) => {
    const product = productMap.get(item.productId)!;
    return sum + product.sellingPrice * item.quantity;
  }, 0);

  // TODO: Calculate delivery fee based on delivery zone
  const deliveryFee = 1500;
  const total = subtotal + deliveryFee;

  const orderNumber = await generateOrderNumber();
  const paymentMethod = paymentMethodMap[paymentMethodKey];

  // Create address, order, items, and decrement stock in a transaction
  const order = await db.$transaction(async (tx) => {
    // Create or find address
    const deliveryAddress = await tx.address.create({
      data: {
        userId,
        firstName,
        lastName,
        phone,
        address,
        city: lga || state,
        state,
        lga: lga || null,
      },
    });

    // Create order
    const newOrder = await tx.order.create({
      data: {
        orderNumber,
        userId,
        addressId: deliveryAddress.id,
        paymentMethod,
        subtotal,
        deliveryFee,
        total,
        items: {
          create: cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: productMap.get(item.productId)!.sellingPrice,
            size: item.size || null,
          })),
        },
        timeline: {
          create: {
            status: "Order Placed",
            note: `Order #${orderNumber} placed via ${paymentMethodKey.replace("_", " ")}`,
          },
        },
      },
    });

    // Decrement stock for each product
    for (const item of cartItems) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    return newOrder;
  });

  redirect(`/order/${order.orderNumber}`);
}
