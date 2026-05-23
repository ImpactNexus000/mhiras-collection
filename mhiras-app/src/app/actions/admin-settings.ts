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

const MAX_ANNOUNCEMENT_LEN = 200;

export async function updateStoreInfo(formData: FormData) {
  await requireAdmin();

  const storeName = ((formData.get("storeName") as string) ?? "").trim();
  const contactEmail = ((formData.get("contactEmail") as string) ?? "").trim();
  const whatsappNumber =
    ((formData.get("whatsappNumber") as string) ?? "").trim();
  const instagramHandle =
    ((formData.get("instagramHandle") as string) ?? "").trim();

  if (!storeName) return { error: "Store name is required." };
  if (!contactEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
    return { error: "Enter a valid contact email." };
  }
  if (!whatsappNumber) return { error: "WhatsApp number is required." };

  await db.storeSettings.upsert({
    where: { id: "singleton" },
    update: { storeName, contactEmail, whatsappNumber, instagramHandle },
    create: {
      id: "singleton",
      storeName,
      contactEmail,
      whatsappNumber,
      instagramHandle,
    },
  });

  // Footer, navbar, and emails read these — bust caches everywhere they show.
  revalidatePath("/", "layout");
  return { success: true };
}

export async function updateBankDetails(formData: FormData) {
  await requireAdmin();

  const bankName = ((formData.get("bankName") as string) ?? "").trim();
  const bankAccountNumber =
    ((formData.get("bankAccountNumber") as string) ?? "").trim();
  const bankAccountName =
    ((formData.get("bankAccountName") as string) ?? "").trim();

  if (!bankName) return { error: "Bank name is required." };
  if (!/^\d{6,}$/.test(bankAccountNumber)) {
    return { error: "Enter a valid account number (digits only)." };
  }
  if (!bankAccountName) return { error: "Account name is required." };

  await db.storeSettings.upsert({
    where: { id: "singleton" },
    update: { bankName, bankAccountNumber, bankAccountName },
    create: { id: "singleton", bankName, bankAccountNumber, bankAccountName },
  });

  // Checkout + order page read these — bust caches.
  revalidatePath("/", "layout");
  return { success: true };
}

export async function updateAnnouncement(formData: FormData) {
  await requireAdmin();

  const text = ((formData.get("announcementText") as string) ?? "").trim();
  const visible = formData.get("announcementVisible") === "on";

  if (visible && !text) {
    return { error: "Add a message before showing the announcement bar." };
  }
  if (text.length > MAX_ANNOUNCEMENT_LEN) {
    return {
      error: `Announcement must be ${MAX_ANNOUNCEMENT_LEN} characters or fewer.`,
    };
  }

  await db.storeSettings.upsert({
    where: { id: "singleton" },
    update: { announcementText: text, announcementVisible: visible },
    create: {
      id: "singleton",
      announcementText: text,
      announcementVisible: visible,
    },
  });

  revalidatePath("/", "layout");
  return { success: true };
}
