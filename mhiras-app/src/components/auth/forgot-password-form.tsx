"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { requestPasswordReset } from "@/app/actions/password-reset";

export function ForgotPasswordForm() {
  const { error: toastError } = useToast();
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSending(true);

    // Read the form before the first await — React pools the event and
    // `currentTarget` is null by the time the action resolves.
    const formData = new FormData(e.currentTarget);

    try {
      const result = await requestPasswordReset(formData);
      if (result?.error) {
        toastError(result.error);
        return;
      }
      setDone(true);
    } catch (error) {
      // Without this the button sat on "Sending..." forever: a rejected
      // action skipped setSending(false) and showed the user nothing at all.
      console.error("[forgot-password] request failed", error);
      toastError("Couldn't send the reset link. Please try again.");
    } finally {
      setSending(false);
    }
  }

  if (done) {
    return (
      <div
        role="status"
        className="p-4 bg-green-50 border border-green-200 rounded text-sm text-green-800 leading-relaxed"
      >
        If an account with that email exists, we&apos;ve sent a reset link.
        Check your inbox (and spam folder) — the link expires in 60 minutes.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="mb-5">
        <label
          htmlFor="forgot-email"
          className="text-xs uppercase tracking-wider text-charcoal-soft mb-1 block"
        >
          Email
        </label>
        <input
          id="forgot-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="youremail@gmail.com"
          className="input-base"
        />
      </div>

      <Button variant="primary" fullWidth size="lg" type="submit" disabled={sending}>
        {sending ? "Sending..." : "Send Reset Link"}
      </Button>
    </form>
  );
}
