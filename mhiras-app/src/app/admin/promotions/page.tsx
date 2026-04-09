import { Button } from "@/components/ui/button";
import { Plus, Copy } from "lucide-react";

type PromoStatus = "active" | "expired" | "scheduled";

const promoStatusStyles: Record<PromoStatus, string> = {
  active: "bg-green-100 text-green-700",
  expired: "bg-gray-100 text-gray-600",
  scheduled: "bg-blue-100 text-blue-700",
};

const promos = [
  { id: 1, code: "WELCOME15", type: "Percentage", discount: "15%", minOrder: "₦10,000", used: 34, limit: 100, status: "active" as PromoStatus, expires: "Apr 30, 2026" },
  { id: 2, code: "THRIFT20", type: "Percentage", discount: "20%", minOrder: "₦20,000", used: 12, limit: 50, status: "active" as PromoStatus, expires: "Apr 15, 2026" },
  { id: 3, code: "FREEDELIVERY", type: "Fixed", discount: "₦1,500", minOrder: "₦8,000", used: 67, limit: null, status: "active" as PromoStatus, expires: "May 31, 2026" },
  { id: 4, code: "EASTER25", type: "Percentage", discount: "25%", minOrder: "₦15,000", used: 89, limit: 100, status: "expired" as PromoStatus, expires: "Apr 1, 2026" },
  { id: 5, code: "RAMADAN10", type: "Percentage", discount: "10%", minOrder: "₦5,000", used: 45, limit: 200, status: "expired" as PromoStatus, expires: "Mar 31, 2026" },
  { id: 6, code: "SUMMER30", type: "Percentage", discount: "30%", minOrder: "₦25,000", used: 0, limit: 50, status: "scheduled" as PromoStatus, expires: "Jun 30, 2026" },
];

const stats = [
  { label: "Active Promos", value: "3" },
  { label: "Total Redemptions", value: "247" },
  { label: "Revenue from Promos", value: "₦142,000" },
];

export default function AdminPromotionsPage() {
  return (
    <>
      <div className="flex justify-between items-center mb-5">
        <h1 className="font-display text-3xl md:text-4xl font-light italic">
          Promotions
        </h1>
        <Button size="sm">
          <Plus size={14} className="mr-1.5" />
          Create Promo
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {stats.map((s) => (
          <div key={s.label} className="bg-white border border-border rounded-lg p-4">
            <div className="text-xs uppercase tracking-wider text-charcoal-soft mb-1.5">
              {s.label}
            </div>
            <div className="text-3xl font-medium">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Promo cards */}
      <div className="grid md:grid-cols-2 gap-4">
        {promos.map((promo) => (
          <div
            key={promo.id}
            className="bg-white border border-border rounded-lg p-5 hover:border-copper/40 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-lg font-medium tracking-wide">
                    {promo.code}
                  </span>
                  <Copy
                    size={14}
                    className="text-charcoal-soft cursor-pointer hover:text-copper"
                  />
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${promoStatusStyles[promo.status]}`}>
                  {promo.status}
                </span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-medium text-copper">
                  {promo.discount}
                </div>
                <div className="text-xs text-charcoal-soft">{promo.type}</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-sm pt-3 border-t border-border">
              <div>
                <div className="text-xs text-charcoal-soft mb-0.5">
                  Min. Order
                </div>
                <div>{promo.minOrder}</div>
              </div>
              <div>
                <div className="text-xs text-charcoal-soft mb-0.5">Used</div>
                <div>
                  {promo.used}
                  {promo.limit ? `/${promo.limit}` : ""}
                </div>
              </div>
              <div>
                <div className="text-xs text-charcoal-soft mb-0.5">
                  Expires
                </div>
                <div>{promo.expires}</div>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button className="text-xs text-copper hover:text-copper-dark cursor-pointer">
                Edit
              </button>
              <span className="text-border">|</span>
              <button className="text-xs text-charcoal-soft hover:text-danger cursor-pointer">
                {promo.status === "active" ? "Deactivate" : "Delete"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
