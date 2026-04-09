"use client";

import { useState } from "react";
import Link from "next/link";
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
      }
    } catch {
      setServerError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {serverError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-sm text-red-700 rounded">
          {serverError}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="text-xs uppercase tracking-wider text-charcoal-soft mb-1 block">
            First Name
          </label>
          <input
            className="input-base"
            placeholder="Amara"
            name="firstName"
          />
          {errors.firstName && (
            <p className="text-xs text-red-600 mt-1">{errors.firstName}</p>
          )}
        </div>
        <div>
          <label className="text-xs uppercase tracking-wider text-charcoal-soft mb-1 block">
            Last Name
          </label>
          <input
            className="input-base"
            placeholder="Okonkwo"
            name="lastName"
          />
          {errors.lastName && (
            <p className="text-xs text-red-600 mt-1">{errors.lastName}</p>
          )}
        </div>
      </div>

      <div className="mb-3">
        <label className="text-xs uppercase tracking-wider text-charcoal-soft mb-1 block">
          Email Address
        </label>
        <input
          className="input-base"
          type="email"
          placeholder="amara@email.com"
          name="email"
        />
        {errors.email && (
          <p className="text-xs text-red-600 mt-1">{errors.email}</p>
        )}
      </div>

      <div className="mb-3">
        <label className="text-xs uppercase tracking-wider text-charcoal-soft mb-1 block">
          Phone Number (WhatsApp)
        </label>
        <input
          className="input-base"
          type="tel"
          placeholder="+234 801 234 5678"
          name="phone"
        />
        {errors.phone && (
          <p className="text-xs text-red-600 mt-1">{errors.phone}</p>
        )}
      </div>

      <div className="mb-3">
        <label className="text-xs uppercase tracking-wider text-charcoal-soft mb-1 block">
          Password
        </label>
        <input
          className="input-base"
          type="password"
          placeholder="Min. 8 characters"
          name="password"
        />
        {errors.password && (
          <p className="text-xs text-red-600 mt-1">{errors.password}</p>
        )}
      </div>

      <div className="mb-4">
        <label className="text-xs uppercase tracking-wider text-charcoal-soft mb-1 block">
          Confirm Password
        </label>
        <input
          className="input-base"
          type="password"
          placeholder="Re-enter password"
          name="confirmPassword"
        />
        {errors.confirmPassword && (
          <p className="text-xs text-red-600 mt-1">{errors.confirmPassword}</p>
        )}
      </div>

      <label className="flex items-start gap-2 text-xs text-charcoal-soft mb-5 cursor-pointer leading-relaxed">
        <input type="checkbox" name="terms" className="accent-copper mt-0.5" />
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
        <p className="text-xs text-red-600 -mt-4 mb-4">{errors.terms}</p>
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
