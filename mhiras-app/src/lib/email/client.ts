import { Resend } from "resend";

let cached: Resend | null = null;

/**
 * Returns a Resend client if RESEND_API_KEY is configured, otherwise null.
 * Email sending is a best-effort side-effect — when the key is missing
 * (e.g. local dev without setup) we no-op rather than crash.
 */
export function getResend(): Resend | null {
  if (cached) return cached;
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  cached = new Resend(key);
  return cached;
}

export const EMAIL_FROM =
  process.env.EMAIL_FROM || "Mhiras Collection <onboarding@resend.dev>";
