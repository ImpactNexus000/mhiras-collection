"use client";

import { useState } from "react";
import { useCart } from "@/context/cart-context";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { Loader2, Check } from "lucide-react";
import { SIZE_CHART } from "@/lib/size-guide";

// Full UK range from the size guide — used when a product has no specific
// available sizes configured.
const ALL_SIZES = SIZE_CHART.map((row) => row.size);

/**
 * Size picker + add-to-cart for the product detail page. A size must be chosen
 * before the item can be added — the choice flows through the cart into the
 * order (CartItem.size → OrderItem.size) so Mhira fulfils the right size.
 *
 * Offers the product's configured availableSizes, or the full UK range when
 * none are set.
 */
export function ProductPurchase({
  productId,
  stock,
  availableSizes,
}: {
  productId: string;
  stock: number;
  availableSizes?: string[];
}) {
  const sizes =
    availableSizes && availableSizes.length > 0 ? availableSizes : ALL_SIZES;
  const { addItem } = useCart();
  const { success, error: toastError } = useToast();
  const [size, setSize] = useState("");
  const [sizeError, setSizeError] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "added">("idle");

  const isSoldOut = stock === 0;

  async function handleAdd() {
    if (!size) {
      setSizeError(true);
      return;
    }
    setStatus("loading");
    const result = await addItem(productId, 1, size);
    if (result.error) {
      toastError(result.error);
      setStatus("idle");
      return;
    }
    success(`Added to cart (UK ${size}).`);
    setStatus("added");
    setTimeout(() => setStatus("idle"), 2000);
  }

  return (
    <div className="space-y-4">
      {/* Size selector */}
      <div>
        <span className="text-sm font-medium">
          Select size <span className="text-charcoal-soft">(UK)</span>
        </span>
        <div className="flex flex-wrap gap-2 mt-2">
          {sizes.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setSize(s);
                setSizeError(false);
              }}
              aria-pressed={size === s}
              className={cn(
                "min-w-[44px] px-3 py-2 text-sm border rounded transition-colors cursor-pointer",
                size === s
                  ? "border-copper bg-copper text-white"
                  : "border-border hover:border-copper"
              )}
            >
              {s}
            </button>
          ))}
        </div>
        {sizeError && (
          <p role="alert" className="text-xs text-danger mt-2">
            Please select a size to continue.
          </p>
        )}
      </div>

      <Button
        variant="primary"
        fullWidth
        size="lg"
        onClick={handleAdd}
        disabled={isSoldOut || status === "loading"}
      >
        {isSoldOut ? (
          "Sold Out"
        ) : status === "loading" ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Adding...
          </>
        ) : status === "added" ? (
          <>
            <Check size={16} /> Added to Cart
          </>
        ) : (
          "Add to Cart"
        )}
      </Button>
    </div>
  );
}
