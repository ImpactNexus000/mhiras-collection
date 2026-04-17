"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { DiscountType } from "@/generated/prisma/client";

export interface ValidatePromoSuccess {
  valid: true;
  promoId: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  discount: number;
  freeDelivery: boolean;
  message: string;
}

export interface ValidatePromoError {
  valid: false;
  error: string;
}

export type ValidatePromoResult = ValidatePromoSuccess | ValidatePromoError;

/**
 * Validate a promo code against the signed-in user's current cart.
 * Returns the discount amount in naira (does NOT increment usage count).
 * Usage count is incremented at order placement time.
 */
export async function validatePromoCode(
  rawCode: string
): Promise<ValidatePromoResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { valid: false, error: "Sign in to apply a promo code." };
  }

  const code = rawCode.trim().toUpperCase();
  if (!code) {
    return { valid: false, error: "Enter a promo code." };
  }

  const promo = await db.promoCode.findUnique({
    where: { code },
  });

  if (!promo || !promo.isActive) {
    return { valid: false, error: "This code is invalid." };
  }

  const now = new Date();
  if (promo.startsAt && promo.startsAt > now) {
    return { valid: false, error: "This code is not active yet." };
  }
  if (promo.expiresAt && promo.expiresAt < now) {
    return { valid: false, error: "This code has expired." };
  }
  if (promo.maxUses !== null && promo.usedCount >= promo.maxUses) {
    return { valid: false, error: "This code has reached its usage limit." };
  }

  // Compute eligible subtotal from the user's cart.
  // If appliesTo is set, only items in that category contribute.
  const cart = await db.cart.findUnique({
    where: { userId: session.user.id },
    include: {
      items: {
        include: {
          product: {
            include: { category: true },
          },
        },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    return { valid: false, error: "Your cart is empty." };
  }

  const eligibleItems = promo.appliesTo
    ? cart.items.filter(
        (item) => item.product.category.slug === promo.appliesTo
      )
    : cart.items;

  if (eligibleItems.length === 0) {
    return {
      valid: false,
      error: "This code doesn't apply to anything in your cart.",
    };
  }

  const eligibleSubtotal = eligibleItems.reduce(
    (sum, item) => sum + item.product.sellingPrice * item.quantity,
    0
  );

  if (promo.minOrder && eligibleSubtotal < promo.minOrder) {
    const shortfall = promo.minOrder - eligibleSubtotal;
    return {
      valid: false,
      error: `Add ₦${shortfall.toLocaleString()} more to use this code (min order ₦${promo.minOrder.toLocaleString()}).`,
    };
  }

  let discount = 0;
  let freeDelivery = false;
  let message = "";

  switch (promo.discountType) {
    case "PERCENTAGE":
      discount = Math.floor((eligibleSubtotal * promo.discountValue) / 100);
      message = `${promo.discountValue}% off applied`;
      break;
    case "FIXED_AMOUNT":
      discount = Math.min(promo.discountValue, eligibleSubtotal);
      message = `₦${discount.toLocaleString()} off applied`;
      break;
    case "FREE_DELIVERY":
      freeDelivery = true;
      message = "Free delivery applied";
      break;
  }

  return {
    valid: true,
    promoId: promo.id,
    code: promo.code,
    discountType: promo.discountType,
    discountValue: promo.discountValue,
    discount,
    freeDelivery,
    message,
  };
}

/**
 * Increment the usage count for a promo code.
 * Called from order placement after a successful order is created.
 */
export async function incrementPromoUsage(promoId: string): Promise<void> {
  await db.promoCode.update({
    where: { id: promoId },
    data: { usedCount: { increment: 1 } },
  });
}
