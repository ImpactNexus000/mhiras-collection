"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
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
  const { status } = useSession();
  const pathname = usePathname();
  const [wishlisted, setWishlisted] = useState(initialWishlisted ?? false);
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(initialWishlisted !== undefined);
  const isAuthed = status === "authenticated";

  // Check wishlist status on mount if not provided. Guests can't have a
  // wishlist, so skip the lookup entirely.
  useEffect(() => {
    if (initialWishlisted !== undefined) return;
    if (!isAuthed) {
      setChecked(true);
      return;
    }
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
  }, [productId, initialWishlisted, isAuthed]);

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

  // Wishlist is account-only — guests get a link to sign in that returns
  // them to the page they were browsing.
  const signinHref = `/auth/signin?from=${encodeURIComponent(pathname)}`;

  if (variant === "icon") {
    if (!isAuthed) {
      return (
        <Link
          href={signinHref}
          aria-label="Sign in to save items to your wishlist"
          className="absolute top-2 right-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors"
        >
          <Heart
            size={16}
            aria-hidden="true"
            className="text-charcoal-soft hover:text-copper transition-colors"
          />
        </Link>
      );
    }
    return (
      <button
        type="button"
        onClick={handleToggle}
        disabled={loading || !checked}
        aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        aria-pressed={wishlisted}
        className="absolute top-2 right-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors disabled:opacity-50"
      >
        {loading ? (
          <Loader2 size={14} aria-hidden="true" className="animate-spin text-copper" />
        ) : (
          <Heart
            size={16}
            aria-hidden="true"
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

  if (!isAuthed) {
    return (
      <Link href={signinHref} className="block">
        <Button
          variant="outline"
          fullWidth
          size="lg"
          className="text-charcoal border-charcoal hover:bg-cream-dark"
        >
          <Heart size={16} aria-hidden="true" />
          Sign in to save
        </Button>
      </Link>
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
