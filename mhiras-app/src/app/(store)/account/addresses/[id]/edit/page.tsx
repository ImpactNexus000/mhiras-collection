import { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { AddressForm } from "@/components/store/address-form";
import { ChevronLeft } from "lucide-react";

export const metadata: Metadata = { title: "Edit Address" };

interface EditAddressPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditAddressPage({ params }: EditAddressPageProps) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/auth/signin?from=/account/addresses/${id}/edit`);
  }

  const address = await db.address.findUnique({ where: { id } });
  if (!address || address.userId !== session.user.id) notFound();

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
        Edit address
      </h1>

      <div className="bg-white border border-border rounded-lg p-5 md:p-6">
        <AddressForm
          initial={{
            id: address.id,
            label: address.label,
            firstName: address.firstName,
            lastName: address.lastName,
            phone: address.phone,
            address: address.address,
            city: address.city,
            state: address.state,
            lga: address.lga,
            isDefault: address.isDefault,
          }}
        />
      </div>
    </div>
  );
}
