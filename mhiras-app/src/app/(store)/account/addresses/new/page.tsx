import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { AddressForm } from "@/components/store/address-form";
import { ChevronLeft } from "lucide-react";

export const metadata: Metadata = { title: "Add Address" };

export default async function NewAddressPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/signin?from=/account/addresses/new");
  }

  // First address is always promoted to default — show the checkbox checked
  // and disabled so the customer can't shoot themselves in the foot.
  const count = await db.address.count({
    where: { userId: session.user.id },
  });

  return (
    <div className="max-w-xl mx-auto px-4 py-8 md:py-12">
      <Link
        href="/account/addresses"
        className="inline-flex items-center gap-1 text-sm text-charcoal-soft hover:text-charcoal transition-colors mb-4"
      >
        <ChevronLeft size={16} aria-hidden="true" />
        Addresses
      </Link>

      <h1 className="font-display text-3xl md:text-4xl font-light italic mb-6">
        Add a new address
      </h1>

      <div className="bg-white border border-border rounded-lg p-5 md:p-6">
        <AddressForm forceDefault={count === 0} />
      </div>
    </div>
  );
}
