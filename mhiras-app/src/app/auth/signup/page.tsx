import { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import { SignUpForm } from "@/components/auth/signup-form";

export const metadata: Metadata = {
  title: "Create Account",
};

const benefits = [
  "Get notified about new arrivals",
  "Save items to your wishlist",
  "Track your orders in real time",
];

export default function SignUpPage() {
  return (
    <div className="min-h-screen grid md:grid-cols-2">
      {/* Brand panel */}
      <div className="hidden md:flex bg-charcoal flex-col items-center justify-center p-12 relative overflow-hidden">
        <span className="absolute font-display text-[280px] font-light text-charcoal-mid/30 italic select-none">
          M
        </span>
        <div className="z-10 text-center">
          <h1 className="font-display text-5xl font-light text-cream italic mb-3">
            Join the Collection
          </h1>
          <p className="text-sm text-charcoal-soft leading-relaxed mb-8">
            Create your account and never miss
            <br />a drop of curated thrift fashion.
          </p>
          <div className="flex flex-col gap-3 text-left max-w-xs mx-auto">
            {benefits.map((b) => (
              <div key={b} className="flex items-center gap-3 text-sm text-charcoal-soft">
                <div className="w-6 h-6 rounded-full border border-copper flex items-center justify-center flex-shrink-0">
                  <Check size={12} className="text-copper" />
                </div>
                {b}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6 md:p-12 bg-white">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="md:hidden text-center mb-6">
            <div className="font-display text-3xl font-light tracking-widest uppercase text-charcoal">
              Mhiras
            </div>
            <div className="text-xs tracking-widest uppercase text-copper">
              Collection
            </div>
          </div>

          <h2 className="font-display text-3xl font-light italic mb-1">
            Create Account
          </h2>
          <p className="text-sm text-charcoal-soft mb-5">
            It takes less than a minute
          </p>

          <SignUpForm />

          <p className="text-center text-sm text-charcoal-soft mt-6">
            Already have an account?{" "}
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
