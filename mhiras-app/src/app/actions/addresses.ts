"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

interface AddressInput {
  label: string | null;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  lga: string | null;
  isDefault: boolean;
}

async function requireUserId(): Promise<string | { error: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "You must be signed in." };
  return session.user.id;
}

function parseAddressForm(formData: FormData):
  | AddressInput
  | { error: string } {
  const label = ((formData.get("label") as string) ?? "").trim() || null;
  const firstName = ((formData.get("firstName") as string) ?? "").trim();
  const lastName = ((formData.get("lastName") as string) ?? "").trim();
  const phone = ((formData.get("phone") as string) ?? "").trim();
  const address = ((formData.get("address") as string) ?? "").trim();
  const city = ((formData.get("city") as string) ?? "").trim();
  const state = ((formData.get("state") as string) ?? "").trim();
  const lga = ((formData.get("lga") as string) ?? "").trim() || null;
  const isDefault = formData.get("isDefault") === "on";

  if (!firstName) return { error: "First name is required." };
  if (!lastName) return { error: "Last name is required." };
  if (!phone) return { error: "Phone number is required." };
  if (!address) return { error: "Street address is required." };
  if (!city) return { error: "City is required." };
  if (!state) return { error: "State is required." };

  return { label, firstName, lastName, phone, address, city, state, lga, isDefault };
}

export async function createAddress(formData: FormData) {
  const auth = await requireUserId();
  if (typeof auth !== "string") return auth;
  const userId = auth;

  const parsed = parseAddressForm(formData);
  if ("error" in parsed) return parsed;

  // If this is the user's first address, make it the default no matter what
  // the checkbox said. Otherwise honour the form.
  const count = await db.address.count({ where: { userId } });
  const makeDefault = count === 0 ? true : parsed.isDefault;

  await db.$transaction(async (tx) => {
    if (makeDefault) {
      await tx.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }
    await tx.address.create({
      data: {
        userId,
        label: parsed.label,
        firstName: parsed.firstName,
        lastName: parsed.lastName,
        phone: parsed.phone,
        address: parsed.address,
        city: parsed.city,
        state: parsed.state,
        lga: parsed.lga,
        isDefault: makeDefault,
      },
    });
  });

  revalidatePath("/account/addresses");
  revalidatePath("/checkout");
  return { success: true };
}

export async function updateAddress(addressId: string, formData: FormData) {
  const auth = await requireUserId();
  if (typeof auth !== "string") return auth;
  const userId = auth;

  const existing = await db.address.findUnique({ where: { id: addressId } });
  if (!existing || existing.userId !== userId) {
    return { error: "Address not found." };
  }

  const parsed = parseAddressForm(formData);
  if ("error" in parsed) return parsed;

  await db.$transaction(async (tx) => {
    if (parsed.isDefault) {
      await tx.address.updateMany({
        where: { userId, isDefault: true, NOT: { id: addressId } },
        data: { isDefault: false },
      });
    }
    await tx.address.update({
      where: { id: addressId },
      data: {
        label: parsed.label,
        firstName: parsed.firstName,
        lastName: parsed.lastName,
        phone: parsed.phone,
        address: parsed.address,
        city: parsed.city,
        state: parsed.state,
        lga: parsed.lga,
        isDefault: parsed.isDefault,
      },
    });
  });

  revalidatePath("/account/addresses");
  revalidatePath("/checkout");
  return { success: true };
}

export async function deleteAddress(formData: FormData) {
  const auth = await requireUserId();
  if (typeof auth !== "string") return auth;
  const userId = auth;

  const addressId = (formData.get("addressId") as string)?.trim();
  if (!addressId) return { error: "Missing address id." };

  const existing = await db.address.findUnique({
    where: { id: addressId },
    include: { _count: { select: { orders: true, deliveryRequests: true } } },
  });
  if (!existing || existing.userId !== userId) {
    return { error: "Address not found." };
  }

  // Address is referenced by orders + delivery requests. We can't hard-delete
  // without orphaning that history. Anonymizing here would be overkill — for
  // the customer flow, refuse the delete and tell them why. They can edit it
  // to keep it useful, or it stays as a record on past orders.
  if (existing._count.orders > 0 || existing._count.deliveryRequests > 0) {
    return {
      error:
        "This address is attached to an existing order — edit it instead, or leave it as-is.",
    };
  }

  await db.address.delete({ where: { id: addressId } });

  // If we just deleted the default, promote the most recent remaining one.
  if (existing.isDefault) {
    const next = await db.address.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    if (next) {
      await db.address.update({
        where: { id: next.id },
        data: { isDefault: true },
      });
    }
  }

  revalidatePath("/account/addresses");
  revalidatePath("/checkout");
  return { success: true };
}

export async function setDefaultAddress(formData: FormData) {
  const auth = await requireUserId();
  if (typeof auth !== "string") return auth;
  const userId = auth;

  const addressId = (formData.get("addressId") as string)?.trim();
  if (!addressId) return { error: "Missing address id." };

  const existing = await db.address.findUnique({ where: { id: addressId } });
  if (!existing || existing.userId !== userId) {
    return { error: "Address not found." };
  }

  await db.$transaction([
    db.address.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    }),
    db.address.update({
      where: { id: addressId },
      data: { isDefault: true },
    }),
  ]);

  revalidatePath("/account/addresses");
  revalidatePath("/checkout");
  return { success: true };
}
