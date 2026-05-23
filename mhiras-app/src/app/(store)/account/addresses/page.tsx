import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { AddressRowActions } from "@/components/store/address-row-actions";
import { MapPin, Plus, ChevronLeft } from "lucide-react";

export const metadata: Metadata = { title: "Delivery Addresses" };

export default async function AddressesPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/signin?from=/account/addresses");
  }

  const addresses = await db.address.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 md:py-12">
      <Link
        href="/account"
        className="inline-flex items-center gap-1 text-sm text-charcoal-soft hover:text-charcoal transition-colors mb-4"
      >
        <ChevronLeft size={16} aria-hidden="true" />
        Back to account
      </Link>

      <div className="flex justify-between items-start gap-4 mb-6">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-light italic">
            Delivery Addresses
          </h1>
          <p className="text-sm text-charcoal-soft mt-1">
            Save addresses so checkout is one click. Your default address is
            pre-filled at checkout.
          </p>
        </div>
        <Link href="/account/addresses/new">
          <Button size="sm">
            <Plus size={14} className="mr-1.5" aria-hidden="true" />
            Add address
          </Button>
        </Link>
      </div>

      {addresses.length === 0 ? (
        <div className="border border-border rounded-lg p-10 text-center bg-white">
          <MapPin
            size={28}
            aria-hidden="true"
            className="mx-auto mb-3 text-charcoal-soft opacity-60"
          />
          <p className="text-charcoal-soft mb-4">
            You haven&apos;t saved any addresses yet.
          </p>
          <Link href="/account/addresses/new">
            <Button size="sm">Add your first address</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className="border border-border rounded-lg p-5 bg-white"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">
                      {addr.label ?? "Address"}
                    </span>
                    {addr.isDefault && (
                      <span className="text-[10px] uppercase tracking-wider bg-copper-light text-copper-dark px-2 py-0.5 rounded">
                        Default
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-charcoal-soft mt-1.5 leading-relaxed">
                    <div>
                      {addr.firstName} {addr.lastName}
                    </div>
                    <div>{addr.address}</div>
                    <div>
                      {addr.city}
                      {addr.lga ? `, ${addr.lga}` : ""} · {addr.state}
                    </div>
                    <div>{addr.phone}</div>
                  </div>
                </div>
              </div>
              <AddressRowActions
                addressId={addr.id}
                isDefault={addr.isDefault}
                displayName={addr.label ?? addr.address}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
