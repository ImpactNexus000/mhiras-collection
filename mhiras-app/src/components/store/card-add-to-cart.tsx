"use client";

import { useState } from "react";
import { useCart } from "@/context/cart-context";
import { useToast } from "@/components/ui/toast";
import { Loader2, Check } from "lucide-react";

/**
 * Quick "Add to Cart" for product cards — adds the item straight away. Size
 * selection lives on the product detail page; cards are a frictionless add.
 */
export function CardAddToCart({
  productId,
  stock,
}: {
  productId: string;
  stock: number;
}) {
  const { addItem } = useCart();
  const { success, error: toastError } = useToast();
  const [status, setStatus] = useState<"idle" | "loading" | "added">("idle");

  if (stock === 0) {
    return (
      <button
        disabled
        className="w-full bg-cream-dark text-charcoal-soft text-xs uppercase tracking-wider py-2.5 cursor-not-allowed"
      >
        Sold Out
      </button>
    );
  }

  async function handleClick() {
    setStatus("loading");
    const result = await addItem(productId, 1, "");
    if (result.error) {
      toastError(result.error);
      setStatus("idle");
      return;
    }
    success("Added to cart.");
    setStatus("added");
    setTimeout(() => setStatus("idle"), 1800);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
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
