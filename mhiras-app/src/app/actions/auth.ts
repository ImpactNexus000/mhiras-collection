"use server";

import { after } from "next/server";
import { headers } from "next/headers";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { signIn } from "@/lib/auth";
import { sendVerificationCode, sendWelcomeEmail } from "@/lib/email";
import { authLimiter, checkRateLimit, getClientIp } from "@/lib/rate-limit";

const CODE_TTL_MINUTES = 15;

function generateCode(): string {
  // 6 digits, zero-padded — Math.random is fine here: codespace is 1M and the
  // authLimiter caps verification attempts to 5 per IP per 15 min.
  return String(Math.floor(Math.random() * 1_000_000)).padStart(6, "0");
}

function freshCodeExpiry(): Date {
  return new Date(Date.now() + CODE_TTL_MINUTES * 60_000);
}

export async function registerUser(formData: FormData) {
  const ip = getClientIp(await headers());
  const limit = await checkRateLimit(authLimiter, `signup:${ip}`);
  if (!limit.success) {
    return { error: "Too many sign-up attempts. Try again in a few minutes." };
  }

  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const email = formData.get("email") as string;
  const phone = (formData.get("phone") as string) || null;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  // Validation
  if (!firstName || !lastName || !email || !password) {
    return { error: "All fields are required." };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  // Check if user already exists
  const existingUser = await db.user.findUnique({ where: { email } });
  if (existingUser) {
    return { error: "An account with this email already exists." };
  }

  if (phone) {
    const existingPhone = await db.user.findUnique({ where: { phone } });
    if (existingPhone) {
      return { error: "An account with this phone number already exists." };
    }
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const code = generateCode();

  await db.user.create({
    data: {
      firstName,
      lastName,
      email,
      phone,
      passwordHash,
      verificationCode: code,
      verificationCodeExpires: freshCodeExpiry(),
    },
  });

  // Send the verification code (and a welcome) — best-effort.
  after(() =>
    sendVerificationCode({
      to: email,
      customerName: firstName,
      code,
      expiresMinutes: CODE_TTL_MINUTES,
    })
  );

  // No auto-signin — the user must verify first. Hand the email back so the
  // verify page can show it and use it for resends.
  return { success: true, email };
}

export async function verifyEmail(formData: FormData) {
  const ip = getClientIp(await headers());
  const limit = await checkRateLimit(authLimiter, `verify:${ip}`);
  if (!limit.success) {
    return {
      error: "Too many verification attempts. Try again in a few minutes.",
    };
  }

  const email = ((formData.get("email") as string) ?? "").trim().toLowerCase();
  const code = ((formData.get("code") as string) ?? "").trim();
  const password = (formData.get("password") as string) ?? "";

  if (!email || !code) {
    return { error: "Enter the code from your email." };
  }
  if (!/^\d{6}$/.test(code)) {
    return { error: "Verification codes are 6 digits." };
  }

  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    // Don't disclose whether the email exists — same message either way.
    return { error: "Invalid or expired verification code." };
  }
  if (user.emailVerified) {
    return { error: "This email is already verified. Try signing in." };
  }
  if (
    !user.verificationCode ||
    !user.verificationCodeExpires ||
    user.verificationCodeExpires < new Date() ||
    user.verificationCode !== code
  ) {
    return { error: "Invalid or expired verification code." };
  }

  await db.user.update({
    where: { id: user.id },
    data: {
      emailVerified: new Date(),
      verificationCode: null,
      verificationCodeExpires: null,
    },
  });

  // Fire the welcome email now that the account is real.
  after(() =>
    sendWelcomeEmail({ to: user.email, customerName: user.firstName })
  );

  // If the verify-email page hands us the password (set right after signup),
  // sign the user in automatically. Otherwise the form sends them to /auth/signin.
  if (password) {
    await signIn("credentials", { email, password, redirectTo: "/" });
  }

  return { success: true };
}

export async function resendVerificationCode(email: string) {
  const ip = getClientIp(await headers());
  const limit = await checkRateLimit(authLimiter, `resend:${ip}`);
  if (!limit.success) {
    return { error: "Too many requests. Try again in a few minutes." };
  }

  const normalized = email.trim().toLowerCase();
  if (!normalized) return { error: "Enter the email you signed up with." };

  const user = await db.user.findUnique({ where: { email: normalized } });
  // Don't disclose whether the email is registered.
  if (!user || user.emailVerified) return { success: true };

  const code = generateCode();
  await db.user.update({
    where: { id: user.id },
    data: {
      verificationCode: code,
      verificationCodeExpires: freshCodeExpiry(),
    },
  });

  after(() =>
    sendVerificationCode({
      to: user.email,
      customerName: user.firstName,
      code,
      expiresMinutes: CODE_TTL_MINUTES,
    })
  );

  return { success: true };
}
