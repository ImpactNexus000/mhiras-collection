"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function AdminVerifyForm({ initialEmail }: { initialEmail: string }) {
  const router = useRouter();
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!/^\d{6}$/.test(code.trim())) {
      setError("Enter the 6-digit code we sent.");
      return;
    }

    setVerifying(true);
    try {
      const result = await signIn("admin-otp", {
        email,
        code,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid or expired code. Try again or sign in for a new one.");
        setVerifying(false);
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setVerifying(false);
    }
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

      <div className="mb-4">
        <label
          htmlFor="admin-verify-email"
          className="text-xs uppercase tracking-wider text-charcoal-soft mb-1 block"
        >
          Email
        </label>
        <input
          id="admin-verify-email"
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
          htmlFor="admin-verify-code"
          className="text-xs uppercase tracking-wider text-charcoal-soft mb-1 block"
        >
          Sign-In Code
        </label>
        <input
          id="admin-verify-code"
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
        {verifying ? "Verifying..." : "Verify and sign in"}
      </Button>

      <p className="text-center text-sm text-charcoal-soft mt-5">
        Didn&apos;t get a code?{" "}
        <Link
          href="/auth/signin"
          className="text-copper font-medium hover:text-copper-dark"
        >
          Sign in again
        </Link>{" "}
        to send a new one.
      </p>
    </form>
  );
}
