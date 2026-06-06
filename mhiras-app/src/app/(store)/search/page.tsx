import { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { ProductCard } from "@/components/store/product-card";
import { SearchBar } from "@/components/store/search-bar";
import { getCategories, getProducts } from "@/lib/queries/products";
import { getWishlistSet } from "@/lib/queries/wishlist";
import { getRatingSummariesForProducts } from "@/lib/queries/reviews";
import { CategoryKind } from "@/generated/prisma/client";

export const metadata: Metadata = {
  title: "Search",
};

const conditionLabel: Record<string, string> = {
  LIKE_NEW: "Like New",
  GOOD: "Good",
  FAIR: "Fair",
};

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  const [{ products, total }, wishlistSet, categories] = await Promise.all([
    query
      ? getProducts({ search: query }, 1, 20)
      : Promise.resolve({ products: [], total: 0 }),
    query ? getWishlistSet() : Promise.resolve(new Set<string>()),
    getCategories(CategoryKind.RETAIL),
  ]);

  const ratingMap = await getRatingSummariesForProducts(
    products.map((p) => p.id)
  );

  // Trending tags: real, live categories + a couple of generic price filters.
  // Beats hardcoded slugs that drift out of sync with the catalogue.
  const trendingTags = [
    ...categories
      .filter((c) => c._count.products > 0)
      .slice(0, 5)
      .map((c) => ({ label: c.name, href: `/shop?category=${c.slug}` })),
    { label: "Under ₦10,000", href: "/shop?maxPrice=10000" },
    { label: "Bales", href: "/wholesale" },
  ];

  return (
    <>
      {/* Search header */}
      <div className="bg-charcoal px-4 md:px-6 py-6">
        <Suspense fallback={null}>
          <SearchBar />
        </Suspense>
        <div className="flex flex-wrap gap-2 justify-center mt-3">
          {trendingTags.map((tag) => (
            <Link
              key={tag.label}
              href={tag.href}
              className="text-xs text-charcoal-soft px-3 py-1 border border-charcoal-mid cursor-pointer hover:text-cream hover:border-cream/30 transition-colors"
            >
              {tag.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
        {!query ? (
          <div className="text-center py-16">
            <h2 className="font-display text-2xl italic text-charcoal-soft mb-2">
              What are you looking for?
            </h2>
            <p className="text-sm text-charcoal-soft">
              Type a keyword above or tap a trending tag to get started.
            </p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-5">
              <span className="text-sm text-charcoal-soft">
                Showing{" "}
                <strong className="text-charcoal">{total} results</strong> for
                &ldquo;
                <strong className="text-charcoal">{query}</strong>&rdquo;
              </span>
            </div>

            {products.length === 0 ? (
              <div className="text-center py-16">
                <h2 className="font-display text-2xl italic text-charcoal-soft mb-2">
                  No results found
                </h2>
                <p className="text-sm text-charcoal-soft mb-4">
                  We couldn&apos;t find anything matching &ldquo;{query}&rdquo;.
                  Try a different search.
                </p>
                <Link
                  href="/shop"
                  className="text-copper font-medium hover:text-copper-dark text-sm"
                >
                  Browse all items &rarr;
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    productId={product.id}
                    slug={product.slug}
                    name={product.name}
                    category={product.category.name}
                    size={product.size}
                    price={product.sellingPrice}
                    originalPrice={product.originalPrice}
                    badge={conditionLabel[product.condition]}
                    image={product.images[0]?.url ?? null}
                    stock={product.stock}
                    availableSizes={product.availableSizes}
                    isSoldOut={product.stock === 0}
                    isWishlisted={wishlistSet.has(product.id)}
                    ratingAverage={ratingMap.get(product.id)?.average}
                    ratingCount={ratingMap.get(product.id)?.count}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
