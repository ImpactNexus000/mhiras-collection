"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { requestPasswordReset } from "@/app/actions/password-reset";

export function ForgotPasswordForm() {
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSending(true);
    const result = await requestPasswordReset(new FormData(e.currentTarget));
    setSending(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    setDone(true);
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
      {error && (
        <div
          role="alert"
          className="mb-4 p-3 bg-red-50 border border-red-200 text-sm text-red-700 rounded"
        >
          {error}
        </div>
      )}

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
          placeholder="you@email.com"
          className="input-base"
        />
      </div>

      <Button variant="primary" fullWidth size="lg" type="submit" disabled={sending}>
        {sending ? "Sending..." : "Send Reset Link"}
      </Button>
    </form>
  );
}
