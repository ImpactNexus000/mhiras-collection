"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
}

interface ZoneFormData {
  name: string;
  states: string;
  fee: number;
  estimateDays: string;
  isActive: boolean;
  sortOrder: number;
}

function parseZoneForm(formData: FormData): ZoneFormData | { error: string } {
  const name = (formData.get("name") as string)?.trim();
  const statesRaw = (formData.get("states") as string)?.trim();
  const feeRaw = formData.get("fee") as string;
  const estimateDays = (formData.get("estimateDays") as string)?.trim();
  const sortOrderRaw = formData.get("sortOrder") as string;

  if (!name) return { error: "Zone name is required." };
  if (!statesRaw) return { error: "List at least one state." };
  if (!estimateDays) return { error: "Estimate days is required." };

  const fee = parseInt(feeRaw, 10);
  if (isNaN(fee) || fee < 0) return { error: "Fee must be a positive number." };

  const sortOrder = parseInt(sortOrderRaw, 10);

  // Normalize states: trim each entry, drop empties, join with ", "
  const states = statesRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .join(", ");

  if (!states) return { error: "List at least one state." };

  return {
    name,
    states,
    fee,
    estimateDays,
    isActive: formData.get("isActive") === "on",
    sortOrder: isNaN(sortOrder) ? 0 : sortOrder,
  };
}

export async function createDeliveryZone(formData: FormData) {
  await requireAdmin();

  const parsed = parseZoneForm(formData);
  if ("error" in parsed) return parsed;

  await db.deliveryZone.create({ data: parsed });

  revalidatePath("/admin/delivery");
  revalidatePath("/checkout");
  return { success: true };
}

export async function updateDeliveryZone(zoneId: string, formData: FormData) {
  await requireAdmin();

  const parsed = parseZoneForm(formData);
  if ("error" in parsed) return parsed;

  await db.deliveryZone.update({
    where: { id: zoneId },
    data: parsed,
  });

  revalidatePath("/admin/delivery");
  revalidatePath("/checkout");
  return { success: true };
}

export async function toggleDeliveryZone(zoneId: string) {
  await requireAdmin();

  const zone = await db.deliveryZone.findUnique({ where: { id: zoneId } });
  if (!zone) return { error: "Zone not found." };

  await db.deliveryZone.update({
    where: { id: zoneId },
    data: { isActive: !zone.isActive },
  });

  revalidatePath("/admin/delivery");
  revalidatePath("/checkout");
  return { success: true, isActive: !zone.isActive };
}

export async function deleteDeliveryZone(zoneId: string) {
  await requireAdmin();

  await db.deliveryZone.delete({ where: { id: zoneId } });

  revalidatePath("/admin/delivery");
  revalidatePath("/checkout");
  return { success: true };
}
