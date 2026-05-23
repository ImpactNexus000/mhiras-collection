import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { CheckoutForm } from "@/components/store/checkout-form";
import { getDeliveryZones } from "@/lib/queries/delivery";
import { getStoreSettings } from "@/lib/queries/settings";

export const metadata: Metadata = {
  title: "Checkout",
};

export default async function CheckoutPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin?from=/checkout");

  const [zones, settings, savedAddresses] = await Promise.all([
    getDeliveryZones(),
    getStoreSettings(),
    db.address.findMany({
      where: { userId: session.user.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    }),
  ]);

  return (
    <CheckoutForm
      stockpileExpiryDays={settings.stockpileExpiryDays}
      bankName={settings.bankName}
      bankAccountNumber={settings.bankAccountNumber}
      bankAccountName={settings.bankAccountName}
      savedAddresses={savedAddresses.map((a) => ({
        id: a.id,
        label: a.label,
        firstName: a.firstName,
        lastName: a.lastName,
        phone: a.phone,
        address: a.address,
        city: a.city,
        state: a.state,
        lga: a.lga,
        isDefault: a.isDefault,
      }))}
      deliveryZones={zones.map((z) => ({
        id: z.id,
        name: z.name,
        states: z.states,
        fee: z.fee,
        estimateDays: z.estimateDays,
      }))}
    />
  );
}
