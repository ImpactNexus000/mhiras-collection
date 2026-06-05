"use client";

import { useState } from "react";
import { useCart } from "@/context/cart-context";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { Loader2, Check } from "lucide-react";

interface AddToCartButtonProps {
  productId: string;
  stock: number;
  variant?: "primary" | "card";
}

export function AddToCartButton({
  productId,
  stock,
  variant = "primary",
}: AddToCartButtonProps) {
  const { addItem } = useCart();
  const { success, error: toastError } = useToast();
  const [status, setStatus] = useState<"idle" | "loading" | "added" | "error">(
    "idle"
  );

  const isSoldOut = stock === 0;

  async function handleClick() {
    setStatus("loading");

    const result = await addItem(productId);

    if (result.error) {
      toastError(result.error);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    } else {
      success("Added to cart.");
      setStatus("added");
      setTimeout(() => setStatus("idle"), 2000);
    }
  }

  if (variant === "card") {
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

    return (
      <>
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
              : status === "error"
                ? "Try Again"
                : "Add to Cart"}
        </button>
      </>
    );
  }

  return (
    <div>
      <Button
        variant="primary"
        fullWidth
        size="lg"
        onClick={handleClick}
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
