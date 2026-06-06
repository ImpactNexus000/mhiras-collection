"use server";

import { after } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { generateOrderNumber } from "@/lib/queries/orders";
import { PaymentMethod, type Order } from "@/generated/prisma/client";
import { validatePromoCode } from "@/app/actions/promo-codes";
import { getDeliveryFeeByState } from "@/lib/queries/delivery";
import { getStoreSettings } from "@/lib/queries/settings";
import { sendOrderConfirmation } from "@/lib/email";
import { checkoutLimiter, checkRateLimit } from "@/lib/rate-limit";

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

/**
 * Thrown inside the order transaction when a product's stock was claimed by a
 * concurrent checkout between our pre-check and the atomic decrement. Caught
 * below and turned into a friendly message; throwing rolls back the order.
 */
class OutOfStockError extends Error {
  constructor(public readonly productName: string) {
    super(`${productName} is out of stock`);
    this.name = "OutOfStockError";
  }
}

export async function placeOrder(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be signed in to place an order." };
  }

  const userId = session.user.id;

  // Throttle per user — catches a runaway frontend retry and casual abuse
  // without blocking households that share an IP.
  const limit = await checkRateLimit(checkoutLimiter, `order:${userId}`);
  if (!limit.success) {
    return {
      error: "Too many orders in a short time. Please wait a few minutes.",
    };
  }

  // Parse form fields
  const savedAddressId = ((formData.get("savedAddressId") as string) ?? "").trim();
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const phone = formData.get("phone") as string;
  const address = formData.get("address") as string;
  const state = formData.get("state") as string;
  const lga = formData.get("lga") as string;
  const paymentMethodKey = formData.get("paymentMethod") as string;
  const itemsJson = formData.get("items") as string;
  const promoCodeInput = (formData.get("promoCode") as string | null)?.trim();

  // Stockpile orders: paid now, no delivery address or fee — items are held
  // until the customer requests delivery later.
  const isStockpile = formData.get("fulfillmentType") === "stockpile";

  // Resolve the delivery address. Customers with saved addresses can pick
  // one from their account; otherwise the form's free-text fields are used.
  let savedAddress = null;
  if (!isStockpile && savedAddressId) {
    savedAddress = await db.address.findUnique({
      where: { id: savedAddressId },
    });
    if (!savedAddress || savedAddress.userId !== userId) {
      return { error: "That address isn't on your account." };
    }
  }

  // Validation — only require the typed fields when no saved address is in
  // play.
  if (!isStockpile && !savedAddress) {
    if (!firstName || !lastName || !phone || !address || !state) {
      return { error: "Please fill in all delivery details." };
    }
  }

  if (!paymentMethodKey || !paymentMethodMap[paymentMethodKey]) {
    return { error: "Please select a valid payment method." };
  }

  if (isStockpile && paymentMethodKey !== "card") {
    return { error: "Stockpile orders must be paid online by card." };
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

  // Delivery fee — zero for stockpile orders (charged later when the
  // customer requests delivery from their stockpile).
  let deliveryFee = 0;
  if (!isStockpile) {
    const stateForFee = savedAddress?.state ?? state;
    const deliveryZone = await getDeliveryFeeByState(stateForFee);
    if (!deliveryZone) {
      return { error: "We don't deliver to that state yet." };
    }
    deliveryFee = deliveryZone.fee;
  }

  // Re-validate promo code server-side (never trust the client)
  let discount = 0;
  let promoCodeId: string | null = null;
  if (promoCodeInput) {
    const promoResult = await validatePromoCode(promoCodeInput);
    if (!promoResult.valid) {
      return { error: promoResult.error };
    }
    discount = promoResult.discount;
    promoCodeId = promoResult.promoId;
    if (promoResult.freeDelivery && !isStockpile) {
      deliveryFee = 0;
    }
  }

  const total = subtotal + deliveryFee - discount;

  const orderNumber = await generateOrderNumber();
  const paymentMethod = paymentMethodMap[paymentMethodKey];

  // Freeze the stockpile deadline at order time so a later settings change
  // can't shorten an existing customer's window.
  let stockpileExpiresAt: Date | null = null;
  if (isStockpile) {
    const settings = await getStoreSettings();
    stockpileExpiresAt = new Date(
      Date.now() + settings.stockpileExpiryDays * 24 * 60 * 60 * 1000
    );
  }

  // Create address (immediate only), order, items, and decrement stock.
  // Wrapped so an out-of-stock rollback (a race with another checkout) surfaces
  // as a friendly error instead of an unhandled 500.
  let order: Order;
  try {
    order = await db.$transaction(async (tx) => {
    let addressId: string | null = null;

    if (!isStockpile) {
      if (savedAddress) {
        // Reuse the saved address as-is — preserves the customer's address
        // book and links this order to the same row.
        addressId = savedAddress.id;
      } else {
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
        addressId = deliveryAddress.id;
      }
    }

    // Create order
    const newOrder = await tx.order.create({
      data: {
        orderNumber,
        userId,
        addressId,
        fulfillmentType: isStockpile ? "STOCKPILE" : "IMMEDIATE",
        stockpileExpiresAt,
        paymentMethod,
        subtotal,
        deliveryFee,
        discount,
        total,
        promoCodeId,
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
            note: isStockpile
              ? `Stockpile order #${orderNumber} placed — items held until delivery is requested`
              : `Order #${orderNumber} placed via ${paymentMethodKey.replace("_", " ")}`,
          },
        },
      },
    });

    // Decrement stock atomically. The `stock: { gte }` guard means a second
    // checkout racing for the same one-of-a-kind item updates 0 rows; we throw
    // to roll the whole order back rather than let stock go negative.
    for (const item of cartItems) {
      const updated = await tx.product.updateMany({
        where: { id: item.productId, stock: { gte: item.quantity } },
        data: { stock: { decrement: item.quantity } },
      });
      if (updated.count === 0) {
        throw new OutOfStockError(
          productMap.get(item.productId)?.name ?? "An item"
        );
      }
    }

    // Record promo usage
    if (promoCodeId) {
      await tx.promoCode.update({
        where: { id: promoCodeId },
        data: { usedCount: { increment: 1 } },
      });
    }

    return newOrder;
    });
  } catch (err) {
    if (err instanceof OutOfStockError) {
      return {
        error: `${err.productName} just sold out before we could place your order. Please remove it from your cart and try again.`,
      };
    }
    throw err;
  }

  // Clear the user's cart after successful order
  const cart = await db.cart.findUnique({
    where: { userId },
  });
  if (cart) {
    await db.cartItem.deleteMany({ where: { cartId: cart.id } });
  }

  // Fire the confirmation email after the response is sent so a slow mailer
  // never blocks the order placement.
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { firstName: true, email: true },
  });
  if (user) {
    const items = cartItems.map((item) => {
      const product = productMap.get(item.productId)!;
      return {
        name: product.name,
        quantity: item.quantity,
        size: item.size ?? null,
        price: product.sellingPrice,
      };
    });
    after(() =>
      sendOrderConfirmation({
        to: user.email,
        customerName: user.firstName,
        orderId: order.id,
        orderNumber: order.orderNumber,
        items,
        subtotal,
        deliveryFee,
        discount,
        total,
        fulfillmentType: isStockpile ? "STOCKPILE" : "IMMEDIATE",
        stockpileExpiresAt,
      })
    );
  }

  return {
    success: true,
    orderId: order.id,
    orderNumber: order.orderNumber,
    paymentMethod: paymentMethodKey,
    fulfillmentType: isStockpile ? "stockpile" : "immediate",
  };
}
