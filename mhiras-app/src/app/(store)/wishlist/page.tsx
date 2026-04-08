import { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/components/store/product-card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Wishlist",
};

const wishlistItems = [
  { slug: "vintage-wrap-dress", name: "Vintage Wrap Dress", category: "Dresses", size: "M", price: 8500, originalPrice: 18000, badge: "New", stock: 1, isWishlisted: true },
  { slug: "leather-tote-brown", name: "Leather Tote — Brown", category: "Bags", size: null, price: 14000, originalPrice: 35000, badge: null, stock: 2, isWishlisted: true },
  { slug: "silk-blouse-cream", name: "Silk Blouse — Cream", category: "Tops", size: "S", price: 5200, originalPrice: null, badge: null, stock: 0, isWishlisted: true },
  { slug: "block-heel-mules", name: "Block Heel Mules", category: "Shoes", size: "40", price: 9500, originalPrice: 24000, badge: null, stock: 4, isWishlisted: true },
  { slug: "structured-handbag", name: "Structured Handbag", category: "Bags", size: null, price: 11000, originalPrice: 28000, badge: null, stock: 1, isWishlisted: true },
];

export default function WishlistPage() {
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
              {wishlistItems.length} items in your wishlist
            </p>
          </div>
          <Button variant="outline" className="text-charcoal border-border hover:bg-cream-dark">
            Add All to Cart
          </Button>
        </div>

        {wishlistItems.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {wishlistItems.map((item) => (
              <ProductCard
                key={item.slug}
                slug={item.slug}
                name={item.name}
                category={item.category}
                size={item.size}
                price={item.price}
                originalPrice={item.originalPrice}
                badge={item.badge}
                stock={item.stock}
                isSoldOut={item.stock === 0}
                isWishlisted={item.isWishlisted}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
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
