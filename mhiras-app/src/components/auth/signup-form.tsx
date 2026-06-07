"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { PasswordInput } from "@/components/auth/password-input";
import { registerUser } from "@/app/actions/auth";
import { isValidEmail } from "@/lib/utils";

interface FieldErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  terms?: string;
}

interface Values {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
}

const EMPTY: Values = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  terms: false,
};

/** Pure validation — derived from the current values on every render. */
function computeErrors(v: Values): FieldErrors {
  const errs: FieldErrors = {};

  if (!v.firstName.trim()) errs.firstName = "First name is required";
  if (!v.lastName.trim()) errs.lastName = "Last name is required";

  if (!v.email.trim()) {
    errs.email = "Email is required";
  } else if (!isValidEmail(v.email.trim())) {
    errs.email = "Enter a valid email address";
  }

  if (!v.password) {
    errs.password = "Password is required";
  } else if (v.password.length < 8) {
    errs.password = "Password must be at least 8 characters";
  }

  if (!v.confirmPassword) {
    errs.confirmPassword = "Please confirm your password";
  } else if (v.password !== v.confirmPassword) {
    errs.confirmPassword = "Passwords do not match";
  }

  if (!v.terms) errs.terms = "You must agree to the terms";

  return errs;
}

export function SignUpForm() {
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const [values, setValues] = useState<Values>(EMPTY);
  const [touched, setTouched] = useState<Partial<Record<keyof Values, boolean>>>(
    {}
  );
  const [loading, setLoading] = useState(false);

  const errors = computeErrors(values);
  // Only surface a field's error once the user has interacted with it.
  const errFor = (f: keyof FieldErrors) => (touched[f] ? errors[f] : undefined);

  const emailValid = !!values.email.trim() && isValidEmail(values.email.trim());
  const passwordsMatch =
    values.confirmPassword.length > 0 &&
    values.password === values.confirmPassword;

  const set = (field: keyof Values, value: string | boolean) =>
    setValues((prev) => ({ ...prev, [field]: value }));
  const touch = (field: keyof Values) =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (Object.keys(errors).length > 0) {
      // Reveal every error at once.
      setTouched({
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        password: true,
        confirmPassword: true,
        terms: true,
      });
      toastError("Please fix the highlighted fields and try again.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const result = await registerUser(formData);
      if (result?.error) {
        toastError(result.error);
        setLoading(false);
        return;
      }
      // Account exists but isn't verified — send the user to the code page.
      success("Account created — check your email for a verification code.");
      router.push(
        `/auth/verify-email?email=${encodeURIComponent(result.email ?? "")}`
      );
    } catch {
      toastError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
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
            value={values.firstName}
            onChange={(e) => set("firstName", e.target.value)}
            onBlur={() => touch("firstName")}
            aria-invalid={!!errFor("firstName") || undefined}
            aria-describedby={
              errFor("firstName") ? "signup-firstName-err" : undefined
            }
          />
          {errFor("firstName") && (
            <p id="signup-firstName-err" className="text-xs text-red-600 mt-1">
              {errFor("firstName")}
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
            value={values.lastName}
            onChange={(e) => set("lastName", e.target.value)}
            onBlur={() => touch("lastName")}
            aria-invalid={!!errFor("lastName") || undefined}
            aria-describedby={
              errFor("lastName") ? "signup-lastName-err" : undefined
            }
          />
          {errFor("lastName") && (
            <p id="signup-lastName-err" className="text-xs text-red-600 mt-1">
              {errFor("lastName")}
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
        <div className="relative">
          <input
            id="signup-email"
            className="input-base pr-10"
            type="email"
            placeholder="amara@email.com"
            name="email"
            autoComplete="email"
            value={values.email}
            onChange={(e) => set("email", e.target.value)}
            onBlur={() => touch("email")}
            aria-invalid={!!errFor("email") || undefined}
            aria-describedby={errFor("email") ? "signup-email-err" : undefined}
          />
          {emailValid && (
            <CheckCircle2
              className="absolute right-3 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-green-600"
              aria-label="Email looks valid"
            />
          )}
        </div>
        {errFor("email") && (
          <p id="signup-email-err" className="text-xs text-red-600 mt-1">
            {errFor("email")}
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
          value={values.phone}
          onChange={(e) => set("phone", e.target.value)}
          onBlur={() => touch("phone")}
          aria-invalid={!!errFor("phone") || undefined}
          aria-describedby={errFor("phone") ? "signup-phone-err" : undefined}
        />
        {errFor("phone") && (
          <p id="signup-phone-err" className="text-xs text-red-600 mt-1">
            {errFor("phone")}
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
        <PasswordInput
          id="signup-password"
          placeholder="Min. 8 characters"
          name="password"
          autoComplete="new-password"
          value={values.password}
          onChange={(e) => set("password", e.target.value)}
          onBlur={() => touch("password")}
          aria-invalid={!!errFor("password") || undefined}
          aria-describedby={
            errFor("password") ? "signup-password-err" : undefined
          }
        />
        {errFor("password") && (
          <p id="signup-password-err" className="text-xs text-red-600 mt-1">
            {errFor("password")}
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
        <PasswordInput
          id="signup-confirmPassword"
          placeholder="Re-enter password"
          name="confirmPassword"
          autoComplete="new-password"
          valid={passwordsMatch}
          value={values.confirmPassword}
          onChange={(e) => set("confirmPassword", e.target.value)}
          onBlur={() => touch("confirmPassword")}
          aria-invalid={!!errFor("confirmPassword") || undefined}
          aria-describedby={
            errFor("confirmPassword")
              ? "signup-confirmPassword-err"
              : passwordsMatch
                ? "signup-confirmPassword-ok"
                : undefined
          }
        />
        {errFor("confirmPassword") ? (
          <p
            id="signup-confirmPassword-err"
            className="text-xs text-red-600 mt-1"
          >
            {errFor("confirmPassword")}
          </p>
        ) : passwordsMatch ? (
          <p
            id="signup-confirmPassword-ok"
            className="text-xs text-green-600 mt-1 flex items-center gap-1"
          >
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> Passwords match
          </p>
        ) : null}
      </div>

      <label className="flex items-start gap-2 text-xs text-charcoal-soft mb-5 cursor-pointer leading-relaxed">
        <input
          type="checkbox"
          name="terms"
          className="accent-copper mt-0.5"
          checked={values.terms}
          onChange={(e) => {
            set("terms", e.target.checked);
            touch("terms");
          }}
          aria-invalid={!!errFor("terms") || undefined}
          aria-describedby={errFor("terms") ? "signup-terms-err" : undefined}
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
      {errFor("terms") && (
        <p id="signup-terms-err" className="text-xs text-red-600 -mt-4 mb-4">
          {errFor("terms")}
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
