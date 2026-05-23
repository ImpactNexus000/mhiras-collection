import { render } from "@react-email/render";
import type { ReactElement } from "react";
import { EMAIL_FROM, getResend } from "./client";

interface SendArgs {
  to: string | string[];
  subject: string;
  template: ReactElement;
  /** Plain-text fallback. If omitted, a stripped version of the HTML is used. */
  text?: string;
}

/**
 * Send a transactional email. Best-effort: catches errors and logs them
 * rather than throwing, so a downed mailer never breaks an order.
 *
 * Callers in server actions / route handlers should wrap with `after(() =>
 * sendEmail(...))` so the email doesn't block the response.
 */
export async function sendEmail({ to, subject, template, text }: SendArgs) {
  const resend = getResend();
  if (!resend) {
    console.warn(`[email] RESEND_API_KEY not set; skipping "${subject}" -> ${to}`);
    return;
  }
  if (!to || (Array.isArray(to) && to.length === 0)) {
    console.warn(`[email] no recipient for "${subject}"; skipping`);
    return;
  }
  try {
    const html = await render(template);
    const plain = text ?? (await render(template, { plainText: true }));
    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject,
      html,
      text: plain,
    });
    if (error) {
      console.error(`[email] resend error for "${subject}":`, error);
    }
  } catch (err) {
    console.error(`[email] unexpected error sending "${subject}":`, err);
  }
}
