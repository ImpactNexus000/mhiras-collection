"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPromoCode, updatePromoCode } from "@/app/actions/promo-codes";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export interface PromoData {
  id: string;
  code: string;
  discountType: string;
  discountValue: number;
  minOrder: number | null;
  maxUses: number | null;
  startsAt: string | null;
  expiresAt: string | null;
  isActive: boolean;
  appliesTo: string | null;
}

interface PromoFormProps {
  promo?: PromoData;
  onClose: () => void;
}

// Convert ISO datetime to the value format datetime-local inputs expect
function toDateTimeLocal(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function PromoForm({ promo, onClose }: PromoFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [discountType, setDiscountType] = useState(
    promo?.discountType ?? "PERCENTAGE"
  );
  const isEditing = !!promo;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    const result = isEditing
      ? await updatePromoCode(promo!.id, formData)
      : await createPromoCode(formData);

    if ("error" in result && result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.refresh();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 bg-black/40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-white z-10">
          <h2 className="font-display text-xl font-light italic">
            {isEditing ? "Edit Promo Code" : "New Promo Code"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center hover:bg-cream-dark rounded cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="text-sm text-danger bg-danger/10 px-3 py-2 rounded">
              {error}
            </div>
          )}

          {/* Code */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-charcoal-soft mb-1.5">
              Code *
            </label>
            <input
              name="code"
              type="text"
              required
              defaultValue={promo?.code ?? ""}
              className="w-full border border-border px-3 py-2.5 text-sm rounded outline-none focus:border-copper font-mono uppercase"
              placeholder="e.g. WELCOME10"
            />
          </div>

          {/* Discount type + value */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs uppercase tracking-wider text-charcoal-soft mb-1.5">
                Discount Type *
              </label>
              <select
                name="discountType"
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value)}
                className="w-full border border-border px-3 py-2.5 text-sm rounded outline-none focus:border-copper bg-white"
              >
                <option value="PERCENTAGE">Percentage</option>
                <option value="FIXED_AMOUNT">Fixed amount (₦)</option>
                <option value="FREE_DELIVERY">Free delivery</option>
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-charcoal-soft mb-1.5">
                Value {discountType !== "FREE_DELIVERY" && "*"}
              </label>
              <input
                name="discountValue"
                type="number"
                min={0}
                max={discountType === "PERCENTAGE" ? 100 : undefined}
                disabled={discountType === "FREE_DELIVERY"}
                required={discountType !== "FREE_DELIVERY"}
                defaultValue={
                  discountType === "FREE_DELIVERY"
                    ? ""
                    : promo?.discountValue ?? ""
                }
                className="w-full border border-border px-3 py-2.5 text-sm rounded outline-none focus:border-copper disabled:bg-cream-dark disabled:text-charcoal-soft"
                placeholder={
                  discountType === "PERCENTAGE"
                    ? "10"
                    : discountType === "FIXED_AMOUNT"
                      ? "2000"
                      : "—"
                }
              />
            </div>
          </div>

          {/* Min order + max uses */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs uppercase tracking-wider text-charcoal-soft mb-1.5">
                Min. Order (₦)
              </label>
              <input
                name="minOrder"
                type="number"
                min={0}
                defaultValue={promo?.minOrder ?? ""}
                className="w-full border border-border px-3 py-2.5 text-sm rounded outline-none focus:border-copper"
                placeholder="No minimum"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-charcoal-soft mb-1.5">
                Max. Uses
              </label>
              <input
                name="maxUses"
                type="number"
                min={0}
                defaultValue={promo?.maxUses ?? ""}
                className="w-full border border-border px-3 py-2.5 text-sm rounded outline-none focus:border-copper"
                placeholder="Unlimited"
              />
            </div>
          </div>

          {/* Starts / expires */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs uppercase tracking-wider text-charcoal-soft mb-1.5">
                Starts At
              </label>
              <input
                name="startsAt"
                type="datetime-local"
                defaultValue={toDateTimeLocal(promo?.startsAt ?? null)}
                className="w-full border border-border px-3 py-2.5 text-sm rounded outline-none focus:border-copper"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-charcoal-soft mb-1.5">
                Expires At
              </label>
              <input
                name="expiresAt"
                type="datetime-local"
                defaultValue={toDateTimeLocal(promo?.expiresAt ?? null)}
                className="w-full border border-border px-3 py-2.5 text-sm rounded outline-none focus:border-copper"
              />
            </div>
          </div>

          {/* Applies to */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-charcoal-soft mb-1.5">
              Applies to (category slug)
            </label>
            <input
              name="appliesTo"
              type="text"
              defaultValue={promo?.appliesTo ?? ""}
              className="w-full border border-border px-3 py-2.5 text-sm rounded outline-none focus:border-copper"
              placeholder="Leave empty for all categories"
            />
          </div>

          {/* Active */}
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              name="isActive"
              type="checkbox"
              defaultChecked={promo?.isActive ?? true}
              className="accent-copper"
            />
            Active
          </label>

          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={loading}
              className="flex-1"
            >
              {loading
                ? "Saving..."
                : isEditing
                  ? "Update Code"
                  : "Create Code"}
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
