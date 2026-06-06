"use client";

import { useState } from "react";
import { useCart } from "@/context/cart-context";
import { useToast } from "@/components/ui/toast";
import { Loader2, Check } from "lucide-react";
import { SIZE_CHART } from "@/lib/size-guide";

const ALL_SIZES = SIZE_CHART.map((row) => row.size);

/**
 * "Add to Cart" for product cards. For sized items (retail), the button reveals
 * a compact size picker first so the choice still rides through to the order;
 * picking a chip adds it. For un-sized items (e.g. bales — `availableSizes`
 * omitted) it adds straight away.
 */
export function CardAddToCart({
  productId,
  stock,
  availableSizes,
}: {
  productId: string;
  stock: number;
  availableSizes?: string[] | null;
}) {
  const { addItem } = useCart();
  const { success, error: toastError } = useToast();
  const [status, setStatus] = useState<"idle" | "loading" | "added">("idle");
  const [picking, setPicking] = useState(false);

  const isSoldOut = stock === 0;
  const sized = availableSizes !== undefined && availableSizes !== null;
  const sizeOptions = !sized
    ? []
    : availableSizes!.length > 0
      ? availableSizes!
      : ALL_SIZES;

  async function add(size: string) {
    setStatus("loading");
    const result = await addItem(productId, 1, size);
    if (result.error) {
      toastError(result.error);
      setStatus("idle");
      return;
    }
    success(size ? `Added to cart (UK ${size}).` : "Added to cart.");
    setPicking(false);
    setStatus("added");
    setTimeout(() => setStatus("idle"), 1800);
  }

  if (isSoldOut) {
    return (
      <button
        disabled
        className="w-full bg-cream-dark text-charcoal-soft text-xs uppercase tracking-wider py-2.5 cursor-not-allowed"
      >
        Sold Out
      </button>
    );
  }

  if (picking) {
    return (
      <div className="space-y-1.5">
        <div className="text-[11px] text-charcoal-soft uppercase tracking-wider">
          Pick a size (UK)
        </div>
        <div className="flex flex-wrap gap-1">
          {sizeOptions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => add(s)}
              disabled={status === "loading"}
              className="min-w-[30px] px-1.5 py-1 text-xs border border-border rounded hover:border-copper hover:bg-copper hover:text-white transition-colors cursor-pointer disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setPicking(false)}
          className="text-[11px] text-charcoal-soft hover:text-charcoal cursor-pointer"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => (sized ? setPicking(true) : add(""))}
      disabled={status === "loading"}
      className="w-full bg-charcoal text-cream text-xs uppercase tracking-wider py-2.5 hover:bg-copper transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
    >
      {status === "loading" && (
        <Loader2 size={12} aria-hidden="true" className="animate-spin" />
      )}
      {status === "added" && <Check size={12} aria-hidden="true" />}
      {status === "loading"
        ? "Adding..."
        : status === "added"
          ? "Added!"
          : "Add to Cart"}
    </button>
  );
}
