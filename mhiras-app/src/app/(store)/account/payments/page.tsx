import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { SavedCardRow } from "@/components/store/saved-card-row";
import { ChevronLeft, CreditCard } from "lucide-react";

export const metadata: Metadata = { title: "Payment Methods" };

export default async function PaymentsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/signin?from=/account/payments");
  }

  const cards = await db.savedCard.findMany({
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

      <h1 className="font-display text-3xl md:text-4xl font-light italic mb-2">
        Payment Methods
      </h1>
      <p className="text-sm text-charcoal-soft mb-6">
        Cards from previous orders are saved here for one-tap checkout. You
        add cards by paying with them — we never store the full card number,
        only the Paystack token.
      </p>

      {cards.length === 0 ? (
        <div className="border border-border rounded-lg p-10 text-center bg-white">
          <CreditCard
            size={28}
            aria-hidden="true"
            className="mx-auto mb-3 text-charcoal-soft opacity-60"
          />
          <p className="text-charcoal-soft mb-4">
            No saved cards yet. Cards used at checkout will appear here
            automatically.
          </p>
          <Link
            href="/shop"
            className="text-copper hover:text-copper-dark text-sm font-medium"
          >
            Continue shopping →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {cards.map((card) => (
            <SavedCardRow
              key={card.id}
              cardId={card.id}
              cardType={card.cardType}
              last4={card.last4}
              expMonth={card.expMonth}
              expYear={card.expYear}
              bank={card.bank}
              isDefault={card.isDefault}
            />
          ))}
        </div>
      )}
    </div>
  );
}
