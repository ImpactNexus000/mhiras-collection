import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { CheckoutForm } from "@/components/store/checkout-form";
import { getDeliveryZones } from "@/lib/queries/delivery";

export const metadata: Metadata = {
  title: "Checkout",
};

export default async function CheckoutPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");

  const zones = await getDeliveryZones();

  return (
    <CheckoutForm
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
