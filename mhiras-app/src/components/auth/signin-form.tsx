"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { PasswordInput } from "@/components/auth/password-input";

/**
 * Only allow internal absolute paths as a return URL, to prevent
 * `?from=https://evil.com` open-redirect attacks.
 */
function safeReturnPath(value: string | null): string {
  if (!value) return "/";
  if (!value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = safeReturnPath(searchParams.get("from"));
  const { success, error: toastError } = useToast();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const identifier = (formData.get("identifier") as string)?.trim();
    const password = formData.get("password") as string;

    if (!identifier) {
      toastError("Email or phone number is required.");
      return;
    }

    if (!password) {
      toastError("Password is required.");
      return;
    }

    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email: identifier,
        password,
        redirect: false,
      });

      if (result?.code === "email_not_verified") {
        router.push(
          `/auth/verify-email?email=${encodeURIComponent(identifier)}`
        );
        return;
      }

      if (result?.code === "admin_otp_required") {
        router.push(
          `/auth/admin-verify?email=${encodeURIComponent(identifier)}`
        );
        return;
      }

      if (result?.error) {
        toastError("Invalid email or password. Please try again.");
      } else {
        success("Welcome back!");
        router.push(returnTo);
        router.refresh();
      }
    } catch {
      toastError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="mb-4">
        <label
          htmlFor="signin-identifier"
          className="text-xs uppercase tracking-wider text-charcoal-soft mb-1 block"
        >
          Email or Phone Number
        </label>
        <input
          id="signin-identifier"
          className="input-base"
          type="text"
          name="identifier"
          autoComplete="username"
          placeholder="amara@email.com or +234 801 234 5678"
        />
      </div>

      <div className="mb-2">
        <div className="flex justify-between items-center mb-1">
          <label
            htmlFor="signin-password"
            className="text-xs uppercase tracking-wider text-charcoal-soft"
          >
            Password
          </label>
          <Link
            href="/auth/forgot-password"
            className="text-xs text-copper hover:text-copper-dark"
          >
            Forgot password?
          </Link>
        </div>
        <PasswordInput
          id="signin-password"
          name="password"
          autoComplete="current-password"
          placeholder="••••••••"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-charcoal-soft mb-6 cursor-pointer">
        <input type="checkbox" name="remember" className="accent-copper" />
        Remember me
      </label>

      <Button
        variant="primary"
        fullWidth
        size="lg"
        type="submit"
        disabled={loading}
      >
        {loading ? "Signing In..." : "Sign In →"}
      </Button>
    </form>
  );
}
