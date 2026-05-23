"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function updateNotificationPreferences(
  formData: FormData
): Promise<{ error: string } | { success: true }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "You must be signed in." };

  const marketingEmails = formData.get("marketingEmails") === "on";

  await db.user.update({
    where: { id: session.user.id },
    data: { marketingEmails },
  });

  revalidatePath("/account/notifications");
  return { success: true };
}
