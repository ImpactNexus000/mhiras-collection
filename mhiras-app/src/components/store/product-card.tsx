import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/utils";
import { AddToCartButton } from "@/components/store/add-to-cart-button";
import { WishlistButton } from "@/components/store/wishlist-button";
import { getOptimizedUrl } from "@/lib/cloudinary";

export interface ProductCardProps {
  productId?: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number | null;
  size?: string | null;
  condition?: string;
  badge?: string | null;
  image?: string | null;
  stock?: number;
  isSoldOut?: boolean;
  isWishlisted?: boolean;
  showAddToCart?: boolean;
  className?: string;
}

export function ProductCard({
  productId,
  slug,
  name,
  category,
  price,
  originalPrice,
  size,
  badge,
  image,
  stock = 0,
  isSoldOut = false,
  isWishlisted,
  showAddToCart = true,
  className,
}: ProductCardProps) {
  const discount =
    originalPrice && originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : null;

  return (
    <div
      className={cn(
        "bg-white group border border-border rounded overflow-hidden",
        isSoldOut && "opacity-70",
        className
      )}
    >
      <Link href={`/shop/${slug}`}>
        {/* Image */}
        <div className="h-48 md:h-60 bg-gradient-to-br from-cream-dark to-gold/30 flex items-center justify-center relative">
          {image ? (
            <img
              src={getOptimizedUrl(image, { width: 400, height: 500 })}
              alt={name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-[70px] h-[100px] bg-gradient-to-br from-gold to-copper-dark/40 opacity-50" />
          )}
          {badge && (
            <span className="absolute top-2 left-2 bg-copper text-white text-[10px] uppercase tracking-wider px-2.5 py-1">
              {badge}
            </span>
          )}
          {isSoldOut && (
            <span className="absolute bottom-2 left-2 bg-danger text-white text-[10px] uppercase tracking-wider px-2.5 py-1">
              Sold Out
            </span>
          )}
          {stock === 1 && !isSoldOut && (
            <span className="absolute bottom-2 left-2 bg-warning/90 text-white text-[10px] uppercase tracking-wider px-2.5 py-1">
              1 left!
            </span>
          )}
          {/* Wishlist button */}
          {productId ? (
            <WishlistButton
              productId={productId}
              variant="icon"
              initialWishlisted={isWishlisted}
            />
          ) : null}
        </div>

        {/* Info */}
        <div className="p-4">
          <div className="text-xs text-charcoal-soft uppercase tracking-wider">
            {category}
            {size && ` · ${size}`}
          </div>
          <div className="text-base font-medium mt-1 truncate">{name}</div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span
              className={cn(
                "text-lg font-medium",
                isSoldOut ? "text-charcoal-soft" : "text-copper"
              )}
            >
              {formatPrice(price)}
            </span>
            {originalPrice && originalPrice > price && (
              <span className="text-xs text-charcoal-soft line-through">
                {formatPrice(originalPrice)}
              </span>
            )}
            {discount && !isSoldOut && (
              <span className="text-[10px] bg-success/10 text-success px-1.5 py-0.5">
                {discount}% off
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Actions */}
      {showAddToCart && productId && (
        <div className="px-4 pb-4">
          <AddToCartButton
            productId={productId}
            stock={stock}
            variant="card"
          />
        </div>
      )}
    </div>
  );
}
