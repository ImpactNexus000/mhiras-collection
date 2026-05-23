"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { registerUser } from "@/app/actions/auth";

interface FieldErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  terms?: string;
}

export function SignUpForm() {
  const router = useRouter();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  function validate(formData: FormData): FieldErrors {
    const errs: FieldErrors = {};

    const firstName = (formData.get("firstName") as string)?.trim();
    const lastName = (formData.get("lastName") as string)?.trim();
    const email = (formData.get("email") as string)?.trim();
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    const terms = formData.get("terms");

    if (!firstName) errs.firstName = "First name is required";
    if (!lastName) errs.lastName = "Last name is required";

    if (!email) {
      errs.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = "Enter a valid email address";
    }

    if (!password) {
      errs.password = "Password is required";
    } else if (password.length < 8) {
      errs.password = "Password must be at least 8 characters";
    }

    if (!confirmPassword) {
      errs.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      errs.confirmPassword = "Passwords do not match";
    }

    if (!terms) errs.terms = "You must agree to the terms";

    return errs;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError("");

    const formData = new FormData(e.currentTarget);
    const fieldErrors = validate(formData);

    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const result = await registerUser(formData);
      if (result?.error) {
        setServerError(result.error);
        setLoading(false);
        return;
      }
      // Account exists but isn't verified — send the user to the code page.
      router.push(
        `/auth/verify-email?email=${encodeURIComponent(result.email ?? "")}`
      );
    } catch {
      setServerError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {serverError && (
        <div
          role="alert"
          className="mb-4 p-3 bg-red-50 border border-red-200 text-sm text-red-700 rounded"
        >
          {serverError}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label
            htmlFor="signup-firstName"
            className="text-xs uppercase tracking-wider text-charcoal-soft mb-1 block"
          >
            First Name
          </label>
          <input
            id="signup-firstName"
            className="input-base"
            placeholder="Amara"
            name="firstName"
            autoComplete="given-name"
            aria-invalid={!!errors.firstName || undefined}
            aria-describedby={errors.firstName ? "signup-firstName-err" : undefined}
          />
          {errors.firstName && (
            <p id="signup-firstName-err" className="text-xs text-red-600 mt-1">
              {errors.firstName}
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor="signup-lastName"
            className="text-xs uppercase tracking-wider text-charcoal-soft mb-1 block"
          >
            Last Name
          </label>
          <input
            id="signup-lastName"
            className="input-base"
            placeholder="Okonkwo"
            name="lastName"
            autoComplete="family-name"
            aria-invalid={!!errors.lastName || undefined}
            aria-describedby={errors.lastName ? "signup-lastName-err" : undefined}
          />
          {errors.lastName && (
            <p id="signup-lastName-err" className="text-xs text-red-600 mt-1">
              {errors.lastName}
            </p>
          )}
        </div>
      </div>

      <div className="mb-3">
        <label
          htmlFor="signup-email"
          className="text-xs uppercase tracking-wider text-charcoal-soft mb-1 block"
        >
          Email Address
        </label>
        <input
          id="signup-email"
          className="input-base"
          type="email"
          placeholder="amara@email.com"
          name="email"
          autoComplete="email"
          aria-invalid={!!errors.email || undefined}
          aria-describedby={errors.email ? "signup-email-err" : undefined}
        />
        {errors.email && (
          <p id="signup-email-err" className="text-xs text-red-600 mt-1">
            {errors.email}
          </p>
        )}
      </div>

      <div className="mb-3">
        <label
          htmlFor="signup-phone"
          className="text-xs uppercase tracking-wider text-charcoal-soft mb-1 block"
        >
          Phone Number (WhatsApp)
        </label>
        <input
          id="signup-phone"
          className="input-base"
          type="tel"
          placeholder="+234 801 234 5678"
          name="phone"
          autoComplete="tel"
          aria-invalid={!!errors.phone || undefined}
          aria-describedby={errors.phone ? "signup-phone-err" : undefined}
        />
        {errors.phone && (
          <p id="signup-phone-err" className="text-xs text-red-600 mt-1">
            {errors.phone}
          </p>
        )}
      </div>

      <div className="mb-3">
        <label
          htmlFor="signup-password"
          className="text-xs uppercase tracking-wider text-charcoal-soft mb-1 block"
        >
          Password
        </label>
        <input
          id="signup-password"
          className="input-base"
          type="password"
          placeholder="Min. 8 characters"
          name="password"
          autoComplete="new-password"
          aria-invalid={!!errors.password || undefined}
          aria-describedby={errors.password ? "signup-password-err" : undefined}
        />
        {errors.password && (
          <p id="signup-password-err" className="text-xs text-red-600 mt-1">
            {errors.password}
          </p>
        )}
      </div>

      <div className="mb-4">
        <label
          htmlFor="signup-confirmPassword"
          className="text-xs uppercase tracking-wider text-charcoal-soft mb-1 block"
        >
          Confirm Password
        </label>
        <input
          id="signup-confirmPassword"
          className="input-base"
          type="password"
          placeholder="Re-enter password"
          name="confirmPassword"
          autoComplete="new-password"
          aria-invalid={!!errors.confirmPassword || undefined}
          aria-describedby={
            errors.confirmPassword ? "signup-confirmPassword-err" : undefined
          }
        />
        {errors.confirmPassword && (
          <p id="signup-confirmPassword-err" className="text-xs text-red-600 mt-1">
            {errors.confirmPassword}
          </p>
        )}
      </div>

      <label className="flex items-start gap-2 text-xs text-charcoal-soft mb-5 cursor-pointer leading-relaxed">
        <input
          type="checkbox"
          name="terms"
          className="accent-copper mt-0.5"
          aria-invalid={!!errors.terms || undefined}
          aria-describedby={errors.terms ? "signup-terms-err" : undefined}
        />
        <span>
          I agree to the{" "}
          <Link href="/terms" className="text-copper underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-copper underline">
            Privacy Policy
          </Link>
        </span>
      </label>
      {errors.terms && (
        <p id="signup-terms-err" className="text-xs text-red-600 -mt-4 mb-4">
          {errors.terms}
        </p>
      )}

      <Button
        variant="primary"
        fullWidth
        size="lg"
        type="submit"
        disabled={loading}
      >
        {loading ? "Creating Account..." : "Create Account →"}
      </Button>
    </form>
  );
}
