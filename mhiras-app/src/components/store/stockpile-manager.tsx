"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Package, Loader2, AlertTriangle } from "lucide-react";
import { createDeliveryRequest } from "@/app/actions/stockpile";
import { matchZoneForState, type DeliveryZoneLike } from "@/lib/delivery";
import { getOptimizedUrl } from "@/lib/cloudinary";

export interface StockpileItemView {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  size: string | null;
  price: number;
  quantity: number;
  orderNumber: string;
  expiresLabel: string | null;
  expired: boolean;
}

const states = [
  "Lagos",
  "Abuja (FCT)",
  "Rivers",
  "Oyo",
  "Kano",
  "Ogun",
  "Kaduna",
  "Enugu",
  "Delta",
  "Edo",
];

interface StockpileManagerProps {
  items: StockpileItemView[];
  deliveryZones: DeliveryZoneLike[];
}

export function StockpileManager({
  items,
  deliveryZones,
}: StockpileManagerProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showForm, setShowForm] = useState(false);
  const [selectedState, setSelectedState] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const selectedItems = items.filter((i) => selected.has(i.id));
  const selectedValue = selectedItems.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0
  );
  const zone = matchZoneForState(selectedState, deliveryZones);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (selected.size === 0) {
      setError("Select at least one item to have delivered.");
      return;
    }
    if (!zone) {
      setError("Please choose a state we deliver to.");
      return;
    }

    const formData = new FormData(e.currentTarget);
    formData.set("itemIds", JSON.stringify([...selected]));

    setLoading(true);
    const result = await createDeliveryRequest(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    // Pay the delivery fee via Paystack
    try {
      const res = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deliveryRequestId: result.deliveryRequestId }),
      });
      const data = await res.json();
      if (data.authorization_url) {
        window.location.href = data.authorization_url;
        return;
      }
      setError(
        data.error ||
          "Your delivery request was created but payment could not start. Try again from your delivery requests."
      );
    } catch {
      setError("Something went wrong starting payment. Please try again.");
    }
    setLoading(false);
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-14 border border-border rounded-lg bg-cream-dark">
        <Package size={32} className="mx-auto text-charcoal-soft mb-3" />
        <h2 className="font-display text-xl italic text-charcoal-soft mb-1">
          Your stockpile is empty
        </h2>
        <p className="text-sm text-charcoal-soft">
          Choose &ldquo;Add to Stockpile&rdquo; at checkout and your paid items
          will be held for you here.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Item list */}
      <div className="border border-border rounded-lg overflow-hidden">
        {items.map((item, i) => {
          const isSelected = selected.has(item.id);
          return (
            <label
              key={item.id}
              className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${
                i < items.length - 1 ? "border-b border-border" : ""
              } ${isSelected ? "bg-copper-light/50" : "hover:bg-cream-dark"}`}
            >
              <input
                type="checkbox"
                className="accent-copper w-4 h-4 flex-shrink-0"
                checked={isSelected}
                onChange={() => toggle(item.id)}
              />
              <div className="w-12 h-16 bg-cream-dark border border-border flex-shrink-0 rounded overflow-hidden">
                {item.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={getOptimizedUrl(item.image, {
                      width: 96,
                      height: 128,
                    })}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">
                  {item.name}
                </div>
                <div className="text-xs text-charcoal-soft">
                  {item.size && `Size ${item.size} · `}
                  {formatPrice(item.price)}
                  {item.quantity > 1 && ` × ${item.quantity}`}
                </div>
                <div className="text-xs text-charcoal-soft mt-0.5">
                  From order #{item.orderNumber}
                  {item.expiresLabel && !item.expired && (
                    <> · request by {item.expiresLabel}</>
                  )}
                </div>
                {item.expired && (
                  <div className="text-xs text-danger flex items-center gap-1 mt-0.5">
                    <AlertTriangle size={11} /> Past the request-by date —
                    contact us if you need help
                  </div>
                )}
              </div>
            </label>
          );
        })}
      </div>

      {/* Selection bar */}
      {!showForm && (
        <div className="flex items-center justify-between gap-3 mt-4 flex-wrap">
          <span className="text-sm text-charcoal-soft">
            <strong className="text-charcoal">{selected.size}</strong> selected
            {selected.size > 0 && <> · {formatPrice(selectedValue)}</>}
          </span>
          <Button
            variant="primary"
            disabled={selected.size === 0}
            onClick={() => setShowForm(true)}
          >
            Request Delivery →
          </Button>
        </div>
      )}

      {/* Delivery request form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mt-5 border border-border rounded-lg p-5 bg-cream-dark"
        >
          <h3 className="font-display text-xl italic mb-1">
            Request delivery
          </h3>
          <p className="text-sm text-charcoal-soft mb-4">
            {selected.size} item{selected.size === 1 ? "" : "s"} · where should
            we send them?
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-sm text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-xs uppercase tracking-wider text-charcoal-soft mb-1 block">
                First Name
              </label>
              <input className="input-base" name="firstName" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-charcoal-soft mb-1 block">
                Last Name
              </label>
              <input className="input-base" name="lastName" />
            </div>
          </div>

          <div className="mb-3">
            <label className="text-xs uppercase tracking-wider text-charcoal-soft mb-1 block">
              Phone Number
            </label>
            <input className="input-base" name="phone" type="tel" />
          </div>

          <div className="mb-3">
            <label className="text-xs uppercase tracking-wider text-charcoal-soft mb-1 block">
              Delivery Address
            </label>
            <input className="input-base" name="address" />
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="text-xs uppercase tracking-wider text-charcoal-soft mb-1 block">
                State
              </label>
              <select
                className="input-base"
                name="state"
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
              >
                <option value="">Select state</option>
                {states.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-charcoal-soft mb-1 block">
                LGA
              </label>
              <input className="input-base" name="lga" />
            </div>
          </div>

          {/* Fee summary */}
          <div className="flex justify-between text-sm py-3 border-t border-border">
            <span>Delivery fee</span>
            <span>
              {!selectedState ? (
                <span className="text-charcoal-soft text-xs">
                  Select a state
                </span>
              ) : !zone ? (
                <span className="text-charcoal-soft text-xs">
                  We don&apos;t deliver here yet
                </span>
              ) : (
                <strong className="text-copper">
                  {formatPrice(zone.fee)}
                </strong>
              )}
            </span>
          </div>

          <div className="flex gap-2 mt-3">
            <Button
              variant="primary"
              type="submit"
              disabled={loading || !zone}
              className="flex items-center gap-2"
            >
              {loading && <Loader2 size={15} className="animate-spin" />}
              {loading
                ? "Processing..."
                : zone
                  ? `Pay ${formatPrice(zone.fee)} & Request Delivery →`
                  : "Select a state to continue"}
            </Button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setError("");
              }}
              className="px-4 text-sm text-charcoal-soft hover:text-charcoal cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
