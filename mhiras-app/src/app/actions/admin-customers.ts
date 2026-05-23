"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

const ANON_DOMAIN = "anon.local";

/**
 * Strip PII from a customer's user + address rows, and drop everything
 * that has no business value after the account is dead (sessions, cart,
 * wishlist, OAuth accounts, admin OTPs). Orders, order_items, reviews,
 * and delivery_requests stay — they're the store's records, not the
 * customer's, and we need them for accounting + dispute resolution.
 *
 * This is the GDPR-friendly alternative to cascading deletes: the row is
 * still there for FK integrity, but every identifying field is wiped.
 *
 * Refuses to anonymize admins (call site is also expected to hide the
 * control), and refuses self-anonymize so an admin can't accidentally
 * lock themselves out.
 */
export async function anonymizeCustomer(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  const targetId = (formData.get("userId") as string)?.trim();
  if (!targetId) return { error: "Missing user id." };
  if (targetId === session.user.id) {
    return { error: "You can't anonymize your own account." };
  }

  const target = await db.user.findUnique({
    where: { id: targetId },
    select: { id: true, role: true, email: true },
  });
  if (!target) return { error: "User not found." };
  if (target.role === "ADMIN") {
    return { error: "Admin accounts can't be anonymized from here." };
  }
  if (target.email.endsWith(`@${ANON_DOMAIN}`)) {
    return { error: "This user is already anonymized." };
  }

  const anonEmail = `deleted-${target.id}@${ANON_DOMAIN}`;

  await db.$transaction([
    // Wipe addresses' PII but keep the rows — orders + delivery_requests
    // reference them. Keep city/state since that's order metadata
    // ("shipped to Lagos"), not personal data.
    db.address.updateMany({
      where: { userId: target.id },
      data: {
        label: null,
        firstName: "Deleted",
        lastName: "Customer",
        phone: "",
        address: "[anonymized]",
        lga: null,
        isDefault: false,
      },
    }),

    // Things with no value after deletion.
    db.session.deleteMany({ where: { userId: target.id } }),
    db.account.deleteMany({ where: { userId: target.id } }),
    db.cart.deleteMany({ where: { userId: target.id } }),
    db.wishlistItem.deleteMany({ where: { userId: target.id } }),
    db.adminOtp.deleteMany({ where: { userId: target.id } }),

    // Finally the user record itself — kept so orders + reviews still
    // resolve via FK, but every identifier is stripped. passwordHash is
    // nulled so future signin is impossible.
    db.user.update({
      where: { id: target.id },
      data: {
        email: anonEmail,
        firstName: "Deleted",
        lastName: "Customer",
        phone: null,
        passwordHash: null,
        image: null,
        emailVerified: null,
        verificationCode: null,
        verificationCodeExpires: null,
      },
    }),
  ]);

  revalidatePath("/admin/customers");
  return { success: true };
}
