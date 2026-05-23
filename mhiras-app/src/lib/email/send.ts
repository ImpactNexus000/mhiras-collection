import { render } from "@react-email/render";
import type { ReactElement } from "react";
import { BREVO_API_URL, EMAIL_FROM, getBrevoApiKey } from "./client";

interface SendArgs {
  to: string | string[];
  subject: string;
  template: ReactElement;
  /** Plain-text fallback. If omitted, a stripped version of the HTML is used. */
  text?: string;
}

interface BrevoRecipient {
  email: string;
  name?: string;
}

/**
 * Parse "Mhiras Collection <orders@example.com>" → { name, email }.
 * Falls back to plain email if no name part is present.
 */
function parseSender(from: string): { name?: string; email: string } {
  const match = from.match(/^\s*(.*?)\s*<(.+)>\s*$/);
  if (match) return { name: match[1] || undefined, email: match[2] };
  return { email: from.trim() };
}

function toRecipients(to: string | string[]): BrevoRecipient[] {
  const arr = Array.isArray(to) ? to : [to];
  return arr.map((email) => ({ email }));
}

/**
 * Send a transactional email via Brevo. Best-effort: catches errors and logs
 * them rather than throwing, so a downed mailer never breaks an order.
 *
 * Callers in server actions / route handlers should wrap with `after(() =>
 * sendEmail(...))` so the email doesn't block the response.
 */
export async function sendEmail({ to, subject, template, text }: SendArgs) {
  const apiKey = getBrevoApiKey();
  if (!apiKey) {
    console.warn(`[email] BREVO_API_KEY not set; skipping "${subject}" -> ${to}`);
    return;
  }
  if (!to || (Array.isArray(to) && to.length === 0)) {
    console.warn(`[email] no recipient for "${subject}"; skipping`);
    return;
  }

  try {
    const htmlContent = await render(template);
    const textContent = text ?? (await render(template, { plainText: true }));

    const res = await fetch(BREVO_API_URL, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        sender: parseSender(EMAIL_FROM),
        to: toRecipients(to),
        subject,
        htmlContent,
        textContent,
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "<no body>");
      console.error(
        `[email] brevo ${res.status} for "${subject}":`,
        detail.slice(0, 500)
      );
    }
  } catch (err) {
    console.error(`[email] unexpected error sending "${subject}":`, err);
  }
}
