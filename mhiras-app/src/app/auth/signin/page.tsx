import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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

          <form>
            <div className="mb-4">
              <label className="text-xs uppercase tracking-wider text-charcoal-soft mb-1 block">
                Email or Phone Number
              </label>
              <input
                className="input-base"
                type="text"
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
                placeholder="••••••••"
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-charcoal-soft mb-6 cursor-pointer">
              <input type="checkbox" className="accent-copper" />
              Remember me
            </label>

            <Button variant="primary" fullWidth size="lg" type="submit">
              Sign In →
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-charcoal-soft uppercase tracking-wider">
              Or continue with
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Social login */}
          <div className="flex gap-3">
            <button className="flex-1 py-2.5 border border-border text-sm flex items-center justify-center gap-2 cursor-pointer hover:bg-cream-dark transition-colors">
              <span className="font-bold">G</span> Google
            </button>
            <button className="flex-1 py-2.5 border border-border text-sm flex items-center justify-center gap-2 cursor-pointer hover:bg-cream-dark transition-colors">
              📱 Phone OTP
            </button>
          </div>

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
