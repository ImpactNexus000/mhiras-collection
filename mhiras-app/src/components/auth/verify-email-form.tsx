"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { resendVerificationCode, verifyEmail } from "@/app/actions/auth";

export function VerifyEmailForm({ initialEmail }: { initialEmail: string }) {
  const router = useRouter();
  const { success, error: toastError, info } = useToast();
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resending, startResend] = useTransition();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!/^\d{6}$/.test(code.trim())) {
      toastError("Enter the 6-digit code we sent.");
      return;
    }

    const formData = new FormData(e.currentTarget);
    setVerifying(true);
    const result = await verifyEmail(formData);
    setVerifying(false);

    if (result?.error) {
      toastError(result.error);
      return;
    }

    success("Email verified. Redirecting to sign in...");
    router.push(`/auth/signin?email=${encodeURIComponent(email)}`);
  }

  function handleResend() {
    if (!email.trim()) {
      toastError("Enter the email you signed up with first.");
      return;
    }
    startResend(async () => {
      const result = await resendVerificationCode(email);
      if (result?.error) {
        toastError(result.error);
      } else {
        info("If that email is registered, a fresh code is on its way.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="mb-4">
        <label
          htmlFor="verify-email"
          className="text-xs uppercase tracking-wider text-charcoal-soft mb-1 block"
        >
          Email
        </label>
        <input
          id="verify-email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input-base"
        />
      </div>

      <div className="mb-5">
        <label
          htmlFor="verify-code"
          className="text-xs uppercase tracking-wider text-charcoal-soft mb-1 block"
        >
          Verification Code
        </label>
        <input
          id="verify-code"
          name="code"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          placeholder="123456"
          className="input-base tracking-[0.5em] text-center font-mono text-lg"
        />
      </div>

      <Button
        variant="primary"
        fullWidth
        size="lg"
        type="submit"
        disabled={verifying}
      >
        {verifying ? "Verifying..." : "Verify email"}
      </Button>

      <p className="text-center text-sm text-charcoal-soft mt-5">
        Didn&apos;t get a code?{" "}
        <button
          type="button"
          onClick={handleResend}
          disabled={resending}
          className="text-copper font-medium hover:text-copper-dark cursor-pointer disabled:opacity-50"
        >
          {resending ? "Sending..." : "Resend"}
        </button>
      </p>
    </form>
  );
}
