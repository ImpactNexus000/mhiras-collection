"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { resetPassword } from "@/app/actions/password-reset";

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const { error: toastError } = useToast();
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);

    const formData = new FormData(e.currentTarget);
    formData.set("token", token);
    const result = await resetPassword(formData);
    setSaving(false);

    if (result?.error) {
      toastError(result.error);
      return;
    }
    setDone(true);
    setTimeout(() => router.push("/auth/signin"), 1500);
  }

  if (!token) {
    return (
      <div
        role="alert"
        className="p-3 bg-red-50 border border-red-200 text-sm text-red-700 rounded"
      >
        This reset link is missing its token. Request a new one from the{" "}
        <Link
          href="/auth/forgot-password"
          className="underline text-copper hover:text-copper-dark"
        >
          forgot password page
        </Link>
        .
      </div>
    );
  }

  if (done) {
    return (
      <div
        role="status"
        className="p-4 bg-green-50 border border-green-200 rounded text-sm text-green-800 leading-relaxed"
      >
        Password reset. Redirecting you to sign in...
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="mb-3">
        <label
          htmlFor="reset-password"
          className="text-xs uppercase tracking-wider text-charcoal-soft mb-1 block"
        >
          New Password
        </label>
        <input
          id="reset-password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          placeholder="Min. 8 characters"
          className="input-base"
        />
      </div>

      <div className="mb-5">
        <label
          htmlFor="reset-confirmPassword"
          className="text-xs uppercase tracking-wider text-charcoal-soft mb-1 block"
        >
          Confirm Password
        </label>
        <input
          id="reset-confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          placeholder="Re-enter password"
          className="input-base"
        />
      </div>

      <Button
        variant="primary"
        fullWidth
        size="lg"
        type="submit"
        disabled={saving}
      >
        {saving ? "Updating..." : "Set new password"}
      </Button>
    </form>
  );
}
