"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { DiscountType } from "@/generated/prisma/client";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  return session;
}

function parseDateTime(value: FormDataEntryValue | null): Date | null {
  if (!value || typeof value !== "string" || !value.trim()) return null;
  const date = new Date(value);
  return isNaN(date.getTime()) ? null : date;
}

function parseOptionalInt(value: FormDataEntryValue | null): number | null {
  if (!value || typeof value !== "string" || !value.trim()) return null;
  const n = parseInt(value, 10);
  return isNaN(n) ? null : n;
}

interface PromoFormData {
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minOrder: number | null;
  maxUses: number | null;
  startsAt: Date | null;
  expiresAt: Date | null;
  isActive: boolean;
  appliesTo: string | null;
}

function parsePromoForm(formData: FormData): PromoFormData | { error: string } {
  const code = (formData.get("code") as string)?.trim().toUpperCase();
  const discountType = formData.get("discountType") as DiscountType;
  const discountValueRaw = formData.get("discountValue") as string;
  const discountValue =
    discountType === "FREE_DELIVERY" ? 0 : parseInt(discountValueRaw, 10);

  if (!code) return { error: "Code is required." };
  if (!discountType) return { error: "Discount type is required." };
  if (discountType !== "FREE_DELIVERY" && (isNaN(discountValue) || discountValue <= 0)) {
    return { error: "Discount value must be greater than 0." };
  }
  if (discountType === "PERCENTAGE" && discountValue > 100) {
    return { error: "Percentage discount cannot exceed 100." };
  }

  return {
    code,
    discountType,
    discountValue,
    minOrder: parseOptionalInt(formData.get("minOrder")),
    maxUses: parseOptionalInt(formData.get("maxUses")),
    startsAt: parseDateTime(formData.get("startsAt")),
    expiresAt: parseDateTime(formData.get("expiresAt")),
    isActive: formData.get("isActive") === "on",
    appliesTo: ((formData.get("appliesTo") as string) || "").trim() || null,
  };
}

export async function createPromoCode(formData: FormData) {
  await requireAdmin();

  const parsed = parsePromoForm(formData);
  if ("error" in parsed) return parsed;

  const existing = await db.promoCode.findUnique({
    where: { code: parsed.code },
  });
  if (existing) {
    return { error: `Code "${parsed.code}" already exists.` };
  }

  await db.promoCode.create({ data: parsed });

  revalidatePath("/admin/promotions");
  return { success: true };
}

export async function updatePromoCode(promoId: string, formData: FormData) {
  await requireAdmin();

  const parsed = parsePromoForm(formData);
  if ("error" in parsed) return parsed;

  // If code changed, make sure the new code isn't already taken
  const existing = await db.promoCode.findUnique({
    where: { code: parsed.code },
  });
  if (existing && existing.id !== promoId) {
    return { error: `Code "${parsed.code}" is already in use.` };
  }

  await db.promoCode.update({
    where: { id: promoId },
    data: parsed,
  });

  revalidatePath("/admin/promotions");
  return { success: true };
}

export async function togglePromoCode(promoId: string) {
  await requireAdmin();

  const promo = await db.promoCode.findUnique({ where: { id: promoId } });
  if (!promo) return { error: "Promo code not found." };

  await db.promoCode.update({
    where: { id: promoId },
    data: { isActive: !promo.isActive },
  });

  revalidatePath("/admin/promotions");
  return { success: true, isActive: !promo.isActive };
}

export async function deletePromoCode(promoId: string) {
  await requireAdmin();

  // Check if the promo has been used on any order — we can't hard-delete those
  const orderCount = await db.order.count({ where: { promoCodeId: promoId } });
  if (orderCount > 0) {
    // Soft-delete by deactivating
    await db.promoCode.update({
      where: { id: promoId },
      data: { isActive: false },
    });
    revalidatePath("/admin/promotions");
    return {
      success: true,
      softDeleted: true,
      message: `Deactivated — used on ${orderCount} order${orderCount === 1 ? "" : "s"}, can't be hard-deleted.`,
    };
  }

  await db.promoCode.delete({ where: { id: promoId } });

  revalidatePath("/admin/promotions");
  return { success: true };
}

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
