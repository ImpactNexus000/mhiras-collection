"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { PasswordInput } from "@/components/auth/password-input";
import { resetPassword } from "@/app/actions/password-reset";

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const { error: toastError } = useToast();
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [touched, setTouched] = useState({ password: false, confirm: false });

  const tooShort = password.length > 0 && password.length < 8;
  const passwordsMatch =
    confirmPassword.length > 0 && password === confirmPassword;
  const mismatch = confirmPassword.length > 0 && password !== confirmPassword;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (password.length < 8) {
      setTouched({ password: true, confirm: touched.confirm });
      toastError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setTouched({ password: true, confirm: true });
      toastError("Passwords do not match.");
      return;
    }

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
        <PasswordInput
          id="reset-password"
          name="password"
          autoComplete="new-password"
          placeholder="Min. 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, password: true }))}
          aria-invalid={(touched.password && tooShort) || undefined}
          aria-describedby={
            touched.password && tooShort ? "reset-password-err" : undefined
          }
        />
        {touched.password && tooShort && (
          <p id="reset-password-err" className="text-xs text-red-600 mt-1">
            Password must be at least 8 characters
          </p>
        )}
      </div>

      <div className="mb-5">
        <label
          htmlFor="reset-confirmPassword"
          className="text-xs uppercase tracking-wider text-charcoal-soft mb-1 block"
        >
          Confirm Password
        </label>
        <PasswordInput
          id="reset-confirmPassword"
          name="confirmPassword"
          autoComplete="new-password"
          placeholder="Re-enter password"
          valid={passwordsMatch}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, confirm: true }))}
          aria-invalid={(touched.confirm && mismatch) || undefined}
          aria-describedby={
            touched.confirm && mismatch
              ? "reset-confirmPassword-err"
              : passwordsMatch
                ? "reset-confirmPassword-ok"
                : undefined
          }
        />
        {touched.confirm && mismatch ? (
          <p
            id="reset-confirmPassword-err"
            className="text-xs text-red-600 mt-1"
          >
            Passwords do not match
          </p>
        ) : passwordsMatch ? (
          <p
            id="reset-confirmPassword-ok"
            className="text-xs text-green-600 mt-1 flex items-center gap-1"
          >
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> Passwords match
          </p>
        ) : null}
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
