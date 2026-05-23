"use server";

import { headers } from "next/headers";
import { db } from "@/lib/db";
import { checkRateLimit, generalLimiter, getClientIp } from "@/lib/rate-limit";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Add an email to the newsletter subscribers list. Re-subscribing an
 * already-known address quietly succeeds (so we don't leak existence) and
 * also clears any prior unsubscribe so the user comes back into the list.
 */
export async function subscribeToNewsletter(formData: FormData) {
  const ip = getClientIp(await headers());
  const limit = await checkRateLimit(generalLimiter, `subscribe:${ip}`);
  if (!limit.success) {
    return { error: "Too many requests. Try again in a few minutes." };
  }

  const email = ((formData.get("email") as string) ?? "").trim().toLowerCase();
  const source = ((formData.get("source") as string) ?? "footer").trim() || "footer";

  if (!email || !EMAIL_RE.test(email)) {
    return { error: "Enter a valid email address." };
  }

  await db.subscriber.upsert({
    where: { email },
    create: { email, source },
    update: { unsubscribedAt: null }, // re-subscribe if they'd opted out
  });

  return { success: true };
}
