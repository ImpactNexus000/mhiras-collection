import { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { SignInForm } from "@/components/auth/signin-form";

export const metadata: Metadata = {
  title: "Sign In",
};

export default function SignInPage() {
  return (
    <div className="min-h-screen grid md:grid-cols-2">
      {/* Brand panel */}
      <div className="hidden md:flex bg-charcoal flex-col items-center justify-center p-12 relative overflow-hidden">
        <span className="absolute font-display text-[280px] font-light text-charcoal-mid/30 italic select-none">
          M
        </span>
        <div className="z-10 text-center">
          <h1 className="font-display text-5xl font-light text-cream italic mb-3">
            Welcome Back
          </h1>
          <p className="text-sm text-charcoal-soft leading-relaxed">
            Your curated wardrobe awaits.
            <br />
            Sign in to continue shopping.
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

          <h2 className="font-display text-3xl font-light italic mb-1">
            Sign In
          </h2>
          <p className="text-sm text-charcoal-soft mb-6">
            Enter your details to access your account
          </p>

          <Suspense fallback={null}>
            <SignInForm />
          </Suspense>

          <p className="text-center text-sm text-charcoal-soft mt-6">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/signup"
              className="text-copper font-medium hover:text-copper-dark"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
