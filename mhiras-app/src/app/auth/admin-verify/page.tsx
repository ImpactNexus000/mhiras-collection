import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { AdminVerifyForm } from "@/components/auth/admin-verify-form";

export const metadata: Metadata = {
  title: "Admin Verification",
};

interface AdminVerifyPageProps {
  searchParams: Promise<{ email?: string }>;
}

export default async function AdminVerifyPage({
  searchParams,
}: AdminVerifyPageProps) {
  const { email } = await searchParams;

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      {/* Brand panel */}
      <div className="hidden md:flex bg-charcoal flex-col items-center justify-center p-12 relative overflow-hidden">
        <span className="absolute font-display text-[280px] font-light text-charcoal-mid/30 italic select-none">
          M
        </span>
        <div className="z-10 text-center">
          <ShieldCheck
            size={56}
            className="text-copper mx-auto mb-4"
            aria-hidden="true"
          />
          <h1 className="font-display text-5xl font-light text-cream italic mb-3">
            Admin Sign-In
          </h1>
          <p className="text-sm text-charcoal-soft leading-relaxed">
            Two-step verification keeps the
            <br />
            store admin secure.
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
            Enter sign-in code
          </h2>
          <p className="text-sm text-charcoal-soft mb-6">
            We sent a 6-digit code{email ? ` to ${email}` : ""}. It expires in
            10 minutes.
          </p>

          <AdminVerifyForm initialEmail={email ?? ""} />
        </div>
      </div>
    </div>
  );
}
