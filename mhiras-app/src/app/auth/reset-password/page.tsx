import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Set New Password",
};

interface ResetPasswordPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const { token } = await searchParams;

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      {/* Brand panel */}
      <div className="hidden md:flex bg-charcoal flex-col items-center justify-center p-12 relative overflow-hidden">
        <span className="absolute font-display text-[280px] font-light text-charcoal-mid/30 italic select-none">
          M
        </span>
        <div className="z-10 text-center">
          <h1 className="font-display text-5xl font-light text-cream italic mb-3">
            New Password
          </h1>
          <p className="text-sm text-charcoal-soft leading-relaxed">
            Pick something strong this time
            <br />
            and we&apos;ll get you back in.
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
            <ArrowLeft size={14} aria-hidden="true" />
            Back to Sign In
          </Link>

          <h2 className="font-display text-3xl font-light italic mb-1">
            Set new password
          </h2>
          <p className="text-sm text-charcoal-soft mb-6">
            Enter and confirm a new password for your account.
          </p>

          <ResetPasswordForm token={token ?? ""} />
        </div>
      </div>
    </div>
  );
}
