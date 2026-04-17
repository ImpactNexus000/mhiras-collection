import { db } from "@/lib/db";
import {
  PromotionsClient,
  type PromoListItem,
} from "@/components/admin/promotions-client";

export default async function AdminPromotionsPage() {
  const [promos, redemptionAgg, discountAgg] = await Promise.all([
    db.promoCode.findMany({ orderBy: { createdAt: "desc" } }),
    db.promoCode.aggregate({ _sum: { usedCount: true } }),
    db.order.aggregate({
      _sum: { discount: true },
      where: { promoCodeId: { not: null } },
    }),
  ]);

  const now = new Date();
  const activeCount = promos.filter((p) => {
    if (!p.isActive) return false;
    if (p.startsAt && p.startsAt > now) return false;
    if (p.expiresAt && p.expiresAt < now) return false;
    if (p.maxUses !== null && p.usedCount >= p.maxUses) return false;
    return true;
  }).length;

  const totalRedemptions = redemptionAgg._sum.usedCount ?? 0;
  const totalSaved = discountAgg._sum.discount ?? 0;

  const stats = [
    { label: "Active Promos", value: String(activeCount) },
    { label: "Total Redemptions", value: totalRedemptions.toLocaleString() },
    {
      label: "Discount Given",
      value: `₦${totalSaved.toLocaleString()}`,
    },
  ];

  const items: PromoListItem[] = promos.map((p) => ({
    id: p.id,
    code: p.code,
    discountType: p.discountType,
    discountValue: p.discountValue,
    minOrder: p.minOrder,
    maxUses: p.maxUses,
    startsAt: p.startsAt ? p.startsAt.toISOString() : null,
    expiresAt: p.expiresAt ? p.expiresAt.toISOString() : null,
    isActive: p.isActive,
    appliesTo: p.appliesTo,
    usedCount: p.usedCount,
  }));

  return <PromotionsClient promos={items} stats={stats} />;
}
