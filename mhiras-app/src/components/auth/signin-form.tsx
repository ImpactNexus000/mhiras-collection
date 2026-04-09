"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function SignInForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const formData = new FormData(e.currentTarget);
    const identifier = (formData.get("identifier") as string)?.trim();
    const password = formData.get("password") as string;

    if (!identifier) {
      setError("Email or phone number is required.");
      return;
    }

    if (!password) {
      setError("Password is required.");
      return;
    }

    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email: identifier,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password. Please try again.");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-sm text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="mb-4">
        <label className="text-xs uppercase tracking-wider text-charcoal-soft mb-1 block">
          Email or Phone Number
        </label>
        <input
          className="input-base"
          type="text"
          name="identifier"
          placeholder="amara@email.com or +234 801 234 5678"
        />
      </div>

      <div className="mb-2">
        <div className="flex justify-between items-center mb-1">
          <label className="text-xs uppercase tracking-wider text-charcoal-soft">
            Password
          </label>
          <Link
            href="/auth/forgot-password"
            className="text-xs text-copper hover:text-copper-dark"
          >
            Forgot password?
          </Link>
        </div>
        <input
          className="input-base"
          type="password"
          name="password"
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
