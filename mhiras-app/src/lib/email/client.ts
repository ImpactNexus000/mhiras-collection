/**
 * Brevo (formerly Sendinblue) email config. We POST directly to their REST
 * API rather than pull in the @getbrevo/brevo SDK — it's auto-generated, big,
 * and one fetch call is all we need.
 *
 * Required env vars in production:
 *   BREVO_API_KEY  — from https://app.brevo.com/settings/keys/api
 *   EMAIL_FROM     — "Mhiras Collection <orders@yourdomain.com>" (the
 *                    sender domain must be verified in Brevo first)
 */
export const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

export const EMAIL_FROM =
  process.env.EMAIL_FROM ||
  "Mhiras Collection <no-reply@example.com>"; // overridden in prod

export function getBrevoApiKey(): string | null {
  return process.env.BREVO_API_KEY || null;
}
