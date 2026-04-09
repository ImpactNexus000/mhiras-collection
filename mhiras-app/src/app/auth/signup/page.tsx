import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

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

          <form>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-xs uppercase tracking-wider text-charcoal-soft mb-1 block">
                  First Name
                </label>
                <input className="input-base" placeholder="Amara" name="firstName" />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-charcoal-soft mb-1 block">
                  Last Name
                </label>
                <input className="input-base" placeholder="Okonkwo" name="lastName" />
              </div>
            </div>

            <div className="mb-3">
              <label className="text-xs uppercase tracking-wider text-charcoal-soft mb-1 block">
                Email Address
              </label>
              <input className="input-base" type="email" placeholder="amara@email.com" name="email" />
            </div>

            <div className="mb-3">
              <label className="text-xs uppercase tracking-wider text-charcoal-soft mb-1 block">
                Phone Number (WhatsApp)
              </label>
              <input className="input-base" type="tel" placeholder="+234 801 234 5678" name="phone" />
            </div>

            <div className="mb-3">
              <label className="text-xs uppercase tracking-wider text-charcoal-soft mb-1 block">
                Password
              </label>
              <input className="input-base" type="password" placeholder="Min. 8 characters" name="password" />
            </div>

            <div className="mb-4">
              <label className="text-xs uppercase tracking-wider text-charcoal-soft mb-1 block">
                Confirm Password
              </label>
              <input className="input-base" type="password" placeholder="Re-enter password" name="confirmPassword" />
            </div>

            <label className="flex items-start gap-2 text-xs text-charcoal-soft mb-5 cursor-pointer leading-relaxed">
              <input type="checkbox" className="accent-copper mt-0.5" />
              <span>
                I agree to the{" "}
                <Link href="/terms" className="text-copper underline">Terms of Service</Link>
                {" "}and{" "}
                <Link href="/privacy" className="text-copper underline">Privacy Policy</Link>
              </span>
            </label>

            <Button variant="primary" fullWidth size="lg" type="submit">
              Create Account →
            </Button>
          </form>

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
