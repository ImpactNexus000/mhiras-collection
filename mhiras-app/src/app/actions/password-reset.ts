"use server";

import { after } from "next/server";
import { headers } from "next/headers";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { sendPasswordReset } from "@/lib/email";
import { authLimiter, checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { SITE_URL } from "@/lib/site";
import { normalizeEmail } from "@/lib/utils";

const RESET_TTL_MINUTES = 60;
const TOKEN_BYTES = 32;

function generateToken(): string {
  return crypto.randomBytes(TOKEN_BYTES).toString("hex");
}

/**
 * Build the absolute base URL from the incoming request headers, so the
 * reset link points back to whichever host the user actually used (localhost
 * in dev, the real domain in prod). Falls back to SITE_URL if we can't
 * piece one together.
 */
function originFromHeaders(h: Headers): string {
  const host =
    h.get("x-forwarded-host") ?? h.get("host") ?? new URL(SITE_URL).host;
  const proto =
    h.get("x-forwarded-proto") ??
    (host.startsWith("localhost") || host.startsWith("127.0.0.1")
      ? "http"
      : "https");
  return `${proto}://${host}`;
}

/**
 * Start a password reset. Generates a random token, stores its bcrypt hash
 * with a 60-minute expiry, and emails the plain token in a reset link.
 *
 * Returns success even for unknown emails so we don't leak which addresses
 * have accounts.
 */
export async function requestPasswordReset(formData: FormData) {
  const reqHeaders = await headers();
  const ip = getClientIp(reqHeaders);
  const limit = await checkRateLimit(authLimiter, `forgot:${ip}`);
  if (!limit.success) {
    return { error: "Too many requests. Try again in a few minutes." };
  }

  const email = normalizeEmail((formData.get("email") as string) ?? "");
  if (!email) return { error: "Enter the email on your account." };

  const user = await db.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      firstName: true,
      passwordHash: true,
      emailVerified: true,
    },
  });

  // Don't disclose. Anyone with no account, no password (e.g. Google-only),
  // or unverified email gets the same response as a happy-path send.
  if (user && user.passwordHash && user.emailVerified) {
    const token = generateToken();
    const tokenHash = await bcrypt.hash(token, 10);

    await db.$transaction([
      db.passwordResetToken.updateMany({
        where: { userId: user.id, consumed: false },
        data: { consumed: true },
      }),
      db.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt: new Date(Date.now() + RESET_TTL_MINUTES * 60_000),
        },
      }),
    ]);

    const baseUrl = originFromHeaders(reqHeaders);
    const resetUrl = `${baseUrl}/auth/reset-password?token=${encodeURIComponent(
      token
    )}`;

    after(() =>
      sendPasswordReset({
        to: user.email,
        customerName: user.firstName,
        resetUrl,
        expiresMinutes: RESET_TTL_MINUTES,
      })
    );
  }

  return { success: true };
}

/**
 * Complete a password reset. Validates the token (must match an open,
 * unexpired hash), updates the user's passwordHash, marks the token
 * consumed, and invalidates all existing sessions so other devices are
 * signed out.
 */
export async function resetPassword(formData: FormData) {
  const ip = getClientIp(await headers());
  const limit = await checkRateLimit(authLimiter, `reset:${ip}`);
  if (!limit.success) {
    return { error: "Too many attempts. Try again in a few minutes." };
  }

  const token = ((formData.get("token") as string) ?? "").trim();
  const password = (formData.get("password") as string) ?? "";
  const confirm = (formData.get("confirmPassword") as string) ?? "";

  if (!token) return { error: "Reset link is missing or malformed." };
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }
  if (password !== confirm) {
    return { error: "Passwords do not match." };
  }

  // Look up unconsumed unexpired tokens; bcrypt-compare the plain token
  // against each candidate's hash. In practice there's usually only one.
  const candidates = await db.passwordResetToken.findMany({
    where: {
      consumed: false,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  let match: (typeof candidates)[number] | null = null;
  for (const candidate of candidates) {
    if (await bcrypt.compare(token, candidate.tokenHash)) {
      match = candidate;
      break;
    }
  }

  if (!match) {
    return { error: "This reset link is invalid or has expired." };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await db.$transaction([
    db.user.update({
      where: { id: match.userId },
      data: { passwordHash },
    }),
    db.passwordResetToken.update({
      where: { id: match.id },
      data: { consumed: true },
    }),
    // Invalidate every existing session for this user — anyone signed in on
    // another device has to sign in again with the new password.
    db.session.deleteMany({ where: { userId: match.userId } }),
  ]);

  return { success: true };
}
