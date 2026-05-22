"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { DeliveryRequestStatus } from "@/generated/prisma/client";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  return session;
}

/**
 * Advance (or cancel) a delivery request. Cancelling releases its items back
 * into the customer's stockpile.
 */
export async function updateDeliveryRequestStatus(
  deliveryRequestId: string,
  newStatus: DeliveryRequestStatus,
  trackingNumber?: string
) {
  await requireAdmin();

  const request = await db.deliveryRequest.findUnique({
    where: { id: deliveryRequestId },
  });
  if (!request) {
    return { error: "Delivery request not found." };
  }

  if (newStatus === "CANCELLED") {
    // Release the items back into the customer's stockpile.
    await db.$transaction(async (tx) => {
      await tx.orderItem.updateMany({
        where: { deliveryRequestId },
        data: { deliveryRequestId: null },
      });
      await tx.deliveryRequest.update({
        where: { id: deliveryRequestId },
        data: { status: "CANCELLED" },
      });
    });
  } else {
    await db.deliveryRequest.update({
      where: { id: deliveryRequestId },
      data: {
        status: newStatus,
        ...(trackingNumber?.trim()
          ? { trackingNumber: trackingNumber.trim() }
          : {}),
      },
    });
  }

  revalidatePath("/admin/stockpile");
  return { success: true };
}

/**
 * Update the admin-configurable stockpile holding period (days).
 */
export async function updateStockpileSettings(formData: FormData) {
  await requireAdmin();

  const days = parseInt(
    (formData.get("stockpileExpiryDays") as string) ?? "",
    10
  );
  if (!Number.isFinite(days) || days < 1 || days > 365) {
    return { error: "Enter a holding period between 1 and 365 days." };
  }

  await db.storeSettings.upsert({
    where: { id: "singleton" },
    update: { stockpileExpiryDays: days },
    create: { id: "singleton", stockpileExpiryDays: days },
  });

  revalidatePath("/admin/settings");
  return { success: true };
}
