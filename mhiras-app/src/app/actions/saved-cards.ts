"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function deleteSavedCard(
  formData: FormData
): Promise<{ error: string } | { success: true }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "You must be signed in." };

  const cardId = ((formData.get("cardId") as string) ?? "").trim();
  if (!cardId) return { error: "Missing card id." };

  const card = await db.savedCard.findUnique({ where: { id: cardId } });
  if (!card || card.userId !== session.user.id) {
    return { error: "Card not found." };
  }

  await db.savedCard.delete({ where: { id: cardId } });

  // Promote another card to default if we just deleted the default.
  if (card.isDefault) {
    const next = await db.savedCard.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });
    if (next) {
      await db.savedCard.update({
        where: { id: next.id },
        data: { isDefault: true },
      });
    }
  }

  revalidatePath("/account/payments");
  revalidatePath("/checkout");
  return { success: true };
}

export async function setDefaultSavedCard(
  formData: FormData
): Promise<{ error: string } | { success: true }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "You must be signed in." };

  const cardId = ((formData.get("cardId") as string) ?? "").trim();
  if (!cardId) return { error: "Missing card id." };

  const card = await db.savedCard.findUnique({ where: { id: cardId } });
  if (!card || card.userId !== session.user.id) {
    return { error: "Card not found." };
  }

  await db.$transaction([
    db.savedCard.updateMany({
      where: { userId: session.user.id, isDefault: true },
      data: { isDefault: false },
    }),
    db.savedCard.update({
      where: { id: cardId },
      data: { isDefault: true },
    }),
  ]);

  revalidatePath("/account/payments");
  revalidatePath("/checkout");
  return { success: true };
}
