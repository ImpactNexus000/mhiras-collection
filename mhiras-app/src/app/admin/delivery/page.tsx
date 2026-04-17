import { db } from "@/lib/db";
import { DeliveryClient } from "@/components/admin/delivery-client";
import type { ZoneData } from "@/components/admin/delivery-form";

export const metadata = {
  title: "Delivery Zones",
};

export default async function AdminDeliveryPage() {
  const zones = await db.deliveryZone.findMany({
    orderBy: [{ sortOrder: "asc" }, { fee: "asc" }],
  });

  const activeZones = zones.filter((z) => z.isActive);
  const totalStates = new Set(
    activeZones.flatMap((z) =>
      z.states
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean)
    )
  ).size;

  const stats = [
    { label: "Active Zones", value: String(activeZones.length) },
    { label: "States Covered", value: String(totalStates) },
    {
      label: "Cheapest Fee",
      value: activeZones.length
        ? `₦${Math.min(...activeZones.map((z) => z.fee)).toLocaleString()}`
        : "—",
    },
  ];

  const items: ZoneData[] = zones.map((z) => ({
    id: z.id,
    name: z.name,
    states: z.states,
    fee: z.fee,
    estimateDays: z.estimateDays,
    isActive: z.isActive,
    sortOrder: z.sortOrder,
  }));

  return <DeliveryClient zones={items} stats={stats} />;
}
