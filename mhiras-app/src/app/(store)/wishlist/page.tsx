import { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/components/store/product-card";
import { Button } from "@/components/ui/button";
import { getWishlist } from "@/app/actions/wishlist";
import { Heart } from "lucide-react";

export const metadata: Metadata = {
  title: "Wishlist",
};

const conditionLabel: Record<string, string> = {
  LIKE_NEW: "Like New",
  GOOD: "Good",
  FAIR: "Fair",
};

export default async function WishlistPage() {
  const wishlistItems = await getWishlist();

  return (
    <>
      {/* Breadcrumb */}
      <div className="px-6 py-3 text-sm text-charcoal-soft border-b border-border">
        <Link href="/" className="hover:text-charcoal">Home</Link>
        {" / "}
        <span className="text-charcoal">My Wishlist</span>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-baseline gap-4 mb-6">
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-light italic">
              Saved Items
            </h1>
            <p className="text-sm text-charcoal-soft mt-1">
              {wishlistItems.length} item{wishlistItems.length !== 1 ? "s" : ""} in your wishlist
            </p>
          </div>
        </div>

        {wishlistItems.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {wishlistItems.map((item) => (
              <ProductCard
                key={item.id}
                productId={item.product.id}
                slug={item.product.slug}
                name={item.product.name}
                category={item.product.category.name}
                size={item.product.size}
                price={item.product.sellingPrice}
                originalPrice={item.product.originalPrice}
                badge={conditionLabel[item.product.condition]}
                image={item.product.images[0]?.url ?? null}
                stock={item.product.stock}
                isSoldOut={item.product.stock === 0}
                isWishlisted={true}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Heart size={48} className="mx-auto text-charcoal-soft/40 mb-4" />
            <div className="font-display text-2xl italic text-charcoal-soft mb-2">
              Your wishlist is empty
            </div>
            <p className="text-sm text-charcoal-soft mb-6">
              Save items you love and come back to them later.
            </p>
            <Link href="/shop">
              <Button>Start Shopping →</Button>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
