import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Reset Password",
};

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen grid md:grid-cols-2">
      {/* Brand panel */}
      <div className="hidden md:flex bg-charcoal flex-col items-center justify-center p-12 relative overflow-hidden">
        <span className="absolute font-display text-[280px] font-light text-charcoal-mid/30 italic select-none">
          M
        </span>
        <div className="z-10 text-center">
          <h1 className="font-display text-5xl font-light text-cream italic mb-3">
            Don&apos;t Worry
          </h1>
          <p className="text-sm text-charcoal-soft leading-relaxed">
            It happens to the best of us.
            <br />
            We&apos;ll help you get back in.
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6 md:p-12 bg-white">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="md:hidden text-center mb-8">
            <div className="font-display text-3xl font-light tracking-widest uppercase text-charcoal">
              Mhiras
            </div>
            <div className="text-xs tracking-widest uppercase text-copper">
              Collection
            </div>
          </div>

          <Link
            href="/auth/signin"
            className="inline-flex items-center gap-1 text-sm text-charcoal-soft hover:text-charcoal transition-colors mb-6"
          >
            <ArrowLeft size={14} />
            Back to Sign In
          </Link>

          <h2 className="font-display text-3xl font-light italic mb-1">
            Reset Password
          </h2>
          <p className="text-sm text-charcoal-soft mb-6">
            Enter the email or phone number linked to your account and
            we&apos;ll send you a reset link.
          </p>

          <form>
            <div className="mb-5">
              <label className="text-xs uppercase tracking-wider text-charcoal-soft mb-1 block">
                Email or Phone Number
              </label>
              <input
                className="input-base"
                type="text"
                placeholder="amara@email.com or +234 801 234 5678"
                name="identifier"
              />
            </div>

            <Button variant="primary" fullWidth size="lg" type="submit">
              Send Reset Link
            </Button>
          </form>

          <p className="text-center text-sm text-charcoal-soft mt-6">
            Remember your password?{" "}
            <Link
              href="/auth/signin"
              className="text-copper font-medium hover:text-copper-dark"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
