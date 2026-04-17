"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PromoForm, type PromoData } from "@/components/admin/promo-form";
import {
  togglePromoCode,
  deletePromoCode,
} from "@/app/actions/promo-codes";
import { Button } from "@/components/ui/button";
import { Plus, Copy, Check } from "lucide-react";

type PromoStatus = "active" | "inactive" | "expired" | "scheduled" | "used_up";

const promoStatusStyles: Record<PromoStatus, string> = {
  active: "bg-green-100 text-green-700",
  inactive: "bg-gray-100 text-gray-600",
  expired: "bg-gray-100 text-gray-600",
  scheduled: "bg-blue-100 text-blue-700",
  used_up: "bg-amber-100 text-amber-700",
};

const promoStatusLabel: Record<PromoStatus, string> = {
  active: "active",
  inactive: "inactive",
  expired: "expired",
  scheduled: "scheduled",
  used_up: "used up",
};

export interface PromoListItem extends PromoData {
  usedCount: number;
}

interface PromotionsClientProps {
  promos: PromoListItem[];
  stats: { label: string; value: string }[];
}

function getStatus(p: PromoListItem): PromoStatus {
  if (!p.isActive) return "inactive";
  const now = Date.now();
  if (p.startsAt && new Date(p.startsAt).getTime() > now) return "scheduled";
  if (p.expiresAt && new Date(p.expiresAt).getTime() < now) return "expired";
  if (p.maxUses !== null && p.usedCount >= p.maxUses) return "used_up";
  return "active";
}

function formatDiscount(p: PromoListItem): string {
  if (p.discountType === "PERCENTAGE") return `${p.discountValue}%`;
  if (p.discountType === "FIXED_AMOUNT")
    return `₦${p.discountValue.toLocaleString()}`;
  return "Free shipping";
}

function formatType(p: PromoListItem): string {
  if (p.discountType === "PERCENTAGE") return "Percentage";
  if (p.discountType === "FIXED_AMOUNT") return "Fixed amount";
  return "Free delivery";
}

function formatDate(iso: string | null): string {
  if (!iso) return "Never";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function PromotionsClient({ promos, stats }: PromotionsClientProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<PromoData | undefined>(undefined);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function handleNew() {
    setEditing(undefined);
    setShowForm(true);
  }

  function handleEdit(promo: PromoListItem) {
    setEditing(promo);
    setShowForm(true);
  }

  function handleClose() {
    setShowForm(false);
    setEditing(undefined);
  }

  async function handleCopy(id: string, code: string) {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedId(id);
      setTimeout(() => setCopiedId((cur) => (cur === id ? null : cur)), 1500);
    } catch {
      // ignore — clipboard may be blocked
    }
  }

  function handleToggle(id: string) {
    setPendingId(id);
    startTransition(async () => {
      await togglePromoCode(id);
      router.refresh();
      setPendingId(null);
    });
  }

  function handleDelete(id: string, code: string) {
    if (!confirm(`Delete promo code "${code}"? This cannot be undone.`)) return;
    setPendingId(id);
    startTransition(async () => {
      const result = await deletePromoCode(id);
      if ("message" in result && result.message) {
        alert(result.message);
      }
      router.refresh();
      setPendingId(null);
    });
  }

  return (
    <>
      <div className="flex justify-between items-center mb-5">
        <h1 className="font-display text-3xl md:text-4xl font-light italic">
          Promotions
        </h1>
        <Button size="sm" onClick={handleNew}>
          <Plus size={14} className="mr-1.5" />
          Create Promo
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-white border border-border rounded-lg p-4"
          >
            <div className="text-xs uppercase tracking-wider text-charcoal-soft mb-1.5">
              {s.label}
            </div>
            <div className="text-3xl font-medium">{s.value}</div>
          </div>
        ))}
      </div>

      {promos.length === 0 ? (
        <div className="bg-white border border-border rounded-lg p-10 text-center">
          <p className="text-charcoal-soft mb-4">No promo codes yet.</p>
          <Button size="sm" onClick={handleNew}>
            <Plus size={14} className="mr-1.5" />
            Create your first promo
          </Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {promos.map((promo) => {
            const status = getStatus(promo);
            const isPending = pendingId === promo.id;
            return (
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
                      <button
                        type="button"
                        onClick={() => handleCopy(promo.id, promo.code)}
                        className="text-charcoal-soft hover:text-copper cursor-pointer"
                        title="Copy code"
                      >
                        {copiedId === promo.id ? (
                          <Check size={14} className="text-green-600" />
                        ) : (
                          <Copy size={14} />
                        )}
                      </button>
                    </div>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${promoStatusStyles[status]}`}
                    >
                      {promoStatusLabel[status]}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-medium text-copper">
                      {formatDiscount(promo)}
                    </div>
                    <div className="text-xs text-charcoal-soft">
                      {formatType(promo)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 text-sm pt-3 border-t border-border">
                  <div>
                    <div className="text-xs text-charcoal-soft mb-0.5">
                      Min. Order
                    </div>
                    <div>
                      {promo.minOrder
                        ? `₦${promo.minOrder.toLocaleString()}`
                        : "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-charcoal-soft mb-0.5">
                      Used
                    </div>
                    <div>
                      {promo.usedCount}
                      {promo.maxUses !== null ? `/${promo.maxUses}` : ""}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-charcoal-soft mb-0.5">
                      Expires
                    </div>
                    <div>{formatDate(promo.expiresAt)}</div>
                  </div>
                </div>

                <div className="flex gap-2 mt-4 items-center">
                  <button
                    type="button"
                    onClick={() => handleEdit(promo)}
                    disabled={isPending}
                    className="text-xs text-copper hover:text-copper-dark cursor-pointer disabled:opacity-50"
                  >
                    Edit
                  </button>
                  <span className="text-border">|</span>
                  <button
                    type="button"
                    onClick={() => handleToggle(promo.id)}
                    disabled={isPending}
                    className="text-xs text-charcoal-soft hover:text-charcoal cursor-pointer disabled:opacity-50"
                  >
                    {promo.isActive ? "Deactivate" : "Activate"}
                  </button>
                  <span className="text-border">|</span>
                  <button
                    type="button"
                    onClick={() => handleDelete(promo.id, promo.code)}
                    disabled={isPending}
                    className="text-xs text-charcoal-soft hover:text-danger cursor-pointer disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && <PromoForm promo={editing} onClose={handleClose} />}
    </>
  );
}
