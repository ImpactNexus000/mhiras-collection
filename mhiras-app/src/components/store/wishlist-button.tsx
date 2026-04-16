"use client";

import { useState, useEffect } from "react";
import { toggleWishlist, isInWishlist } from "@/app/actions/wishlist";
import { Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface WishlistButtonProps {
  productId: string;
  variant?: "icon" | "full";
  initialWishlisted?: boolean;
}

export function WishlistButton({
  productId,
  variant = "full",
  initialWishlisted,
}: WishlistButtonProps) {
  const [wishlisted, setWishlisted] = useState(initialWishlisted ?? false);
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(initialWishlisted !== undefined);

  // Check wishlist status on mount if not provided
  useEffect(() => {
    if (initialWishlisted !== undefined) return;
    let cancelled = false;
    isInWishlist(productId).then((result) => {
      if (!cancelled) {
        setWishlisted(result);
        setChecked(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [productId, initialWishlisted]);

  async function handleToggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);

    const result = await toggleWishlist(productId);

    if (result.error) {
      setLoading(false);
      return;
    }

    setWishlisted(result.added ?? false);
    setLoading(false);
  }

  if (variant === "icon") {
    return (
      <button
        onClick={handleToggle}
        disabled={loading || !checked}
        className="absolute top-2 right-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors disabled:opacity-50"
      >
        {loading ? (
          <Loader2 size={14} className="animate-spin text-copper" />
        ) : (
          <Heart
            size={16}
            className={cn(
              "transition-colors",
              wishlisted
                ? "fill-copper text-copper"
                : "text-charcoal-soft hover:text-copper"
            )}
          />
        )}
      </button>
    );
  }

  return (
    <Button
      variant="outline"
      fullWidth
      size="lg"
      className="text-charcoal border-charcoal hover:bg-cream-dark"
      onClick={handleToggle}
      disabled={loading}
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <Heart
          size={16}
          className={cn(wishlisted && "fill-copper text-copper")}
        />
      )}
      {wishlisted ? "Saved to Wishlist" : "Add to Wishlist"}
    </Button>
  );
}
