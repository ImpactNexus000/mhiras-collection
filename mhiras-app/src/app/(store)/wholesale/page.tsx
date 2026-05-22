import { Metadata } from "next";
import { ProductCard } from "@/components/store/product-card";
import { getProducts } from "@/lib/queries/products";
import { getWishlistSet } from "@/lib/queries/wishlist";
import { getRatingSummariesForProducts } from "@/lib/queries/reviews";
import { CategoryKind } from "@/generated/prisma/client";
import { Package, ShieldCheck, Truck } from "lucide-react";

export const metadata: Metadata = {
  title: "Bales — Wholesale",
  description:
    "Buy thrift fashion in bulk. Premium UK ~55kg bales, sorted and graded — ready to resell.",
};

const perks = [
  { icon: Package, label: "UK ~55kg Bales" },
  { icon: ShieldCheck, label: "Sorted & Graded" },
  { icon: Truck, label: "Nationwide Delivery" },
];

export default async function WholesalePage() {
  const [{ products, total }, wishlistSet] = await Promise.all([
    getProducts({ kind: CategoryKind.WHOLESALE }, 1, 48, {
      field: "sellingPrice",
      direction: "desc",
    }),
    getWishlistSet(),
  ]);

  const ratingMap = await getRatingSummariesForProducts(
    products.map((p) => p.id)
  );

  return (
    <>
      {/* Header */}
      <section className="bg-charcoal px-6 py-10 text-center">
        <span className="block text-xs tracking-widest uppercase text-copper mb-2">
          Wholesale
        </span>
        <h1 className="font-display text-4xl md:text-5xl font-light text-cream italic mb-3">
          Bales
        </h1>
        <p className="text-sm text-charcoal-soft max-w-xl mx-auto leading-relaxed">
          Buy thrift fashion in bulk. Premium UK bales — sorted, graded and
          ready to resell. Perfect for boutiques and resellers.
        </p>
      </section>

      {/* Perks strip */}
      <section className="grid grid-cols-3 bg-copper-light">
        {perks.map((perk, i) => (
          <div
            key={perk.label}
            className={`flex items-center justify-center gap-2 py-4 px-2 text-center ${
              i < perks.length - 1 ? "border-r border-copper/15" : ""
            }`}
          >
            <perk.icon size={16} className="text-copper shrink-0" />
            <span className="text-xs md:text-sm font-medium uppercase tracking-wider text-charcoal-mid">
              {perk.label}
            </span>
          </div>
        ))}
      </section>

      {/* Bale grid */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        <div className="flex justify-between items-baseline mb-5">
          <h2 className="font-display text-2xl md:text-3xl font-light italic">
            Available Bales
          </h2>
          <span className="text-sm text-charcoal-soft">
            {total} {total === 1 ? "bale" : "bales"}
          </span>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20">
            <h3 className="font-display text-2xl italic text-charcoal-soft mb-2">
              No bales available right now
            </h3>
            <p className="text-sm text-charcoal-soft">
              Check back soon — new stock lands regularly.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                productId={product.id}
                slug={product.slug}
                name={product.name}
                category={product.category.name}
                price={product.sellingPrice}
                originalPrice={product.originalPrice}
                badge={product.weight ? `${product.weight}kg` : undefined}
                image={product.images[0]?.url ?? null}
                stock={product.stock}
                isSoldOut={product.stock === 0}
                isWishlisted={wishlistSet.has(product.id)}
                ratingAverage={ratingMap.get(product.id)?.average}
                ratingCount={ratingMap.get(product.id)?.count}
              />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
