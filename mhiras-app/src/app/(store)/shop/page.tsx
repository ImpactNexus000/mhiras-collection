import { Metadata } from "next";
import { Suspense } from "react";
import { ShopFilters } from "@/components/store/shop-filters";
import { ProductCard } from "@/components/store/product-card";
import { getProducts, getCategories } from "@/lib/queries/products";
import { Condition } from "@/generated/prisma/client";

export const metadata: Metadata = {
  title: "Shop",
  description: "Browse our curated collection of pre-loved fashion pieces.",
};

interface ShopPageProps {
  searchParams: Promise<{
    category?: string;
    condition?: string;
    minPrice?: string;
    maxPrice?: string;
    size?: string;
    q?: string;
    sort?: string;
    page?: string;
  }>;
}

const conditionLabel: Record<string, string> = {
  LIKE_NEW: "Like New",
  GOOD: "Good",
  FAIR: "Fair",
};

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;

  const conditionFilter = params.condition
    ? (params.condition.split(",") as Condition[])
    : undefined;

  // Map sort param to Prisma orderBy
  const sortMap: Record<string, { field: string; direction: "asc" | "desc" }> = {
    newest: { field: "createdAt", direction: "desc" },
    "price-asc": { field: "sellingPrice", direction: "asc" },
    "price-desc": { field: "sellingPrice", direction: "desc" },
  };

  const [{ products, total, page, totalPages }, categories] = await Promise.all(
    [
      getProducts(
        {
          category: params.category,
          condition: conditionFilter,
          minPrice: params.minPrice ? Number(params.minPrice) : undefined,
          maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
          size: params.size,
          search: params.q,
        },
        params.page ? Number(params.page) : 1,
        12,
        sortMap[params.sort ?? "newest"] ?? sortMap.newest
      ),
      getCategories(),
    ]
  );

  const activeLabel = params.category
    ? categories.find((c) => c.slug === params.category)?.name ?? "Shop All"
    : "Shop All";

  return (
    <>
      {/* Page header */}
      <div className="bg-charcoal px-6 py-6 text-center">
        <h1 className="font-display text-3xl md:text-4xl font-light text-cream italic">
          {activeLabel}
        </h1>
        <p className="text-sm text-charcoal-soft mt-2">
          Handpicked fashion — every piece is one of a kind
        </p>
      </div>

      {/* Filters + Products */}
      <div className="flex flex-col">
        <Suspense fallback={null}>
          <div className="flex">
            <ShopFilters categories={categories} />

            {/* Products grid */}
            <div className="flex-1">
              <div className="flex justify-between items-center px-4 py-3 bg-cream-dark border-b border-border text-sm text-charcoal-soft">
                <span>
                  Showing{" "}
                  <strong className="text-charcoal">{total} results</strong>{" "}
                  for{" "}
                  <strong className="text-charcoal">{activeLabel}</strong>
                  {params.q && (
                    <>
                      {" "}matching &ldquo;
                      <strong className="text-charcoal">{params.q}</strong>
                      &rdquo;
                    </>
                  )}
                </span>
              </div>

              {products.length === 0 ? (
                <div className="text-center py-20 px-4">
                  <h2 className="font-display text-2xl italic text-charcoal-soft mb-2">
                    No products found
                  </h2>
                  <p className="text-sm text-charcoal-soft">
                    Try adjusting your filters or check back later for new
                    arrivals.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-border">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      slug={product.slug}
                      name={product.name}
                      category={product.category.name}
                      size={product.size}
                      price={product.sellingPrice}
                      originalPrice={product.originalPrice}
                      badge={conditionLabel[product.condition]}
                      image={product.images[0]?.url ?? null}
                      stock={product.stock}
                      isSoldOut={product.stock === 0}
                      className="rounded-none border-0"
                    />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 py-6">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (pageNum) => {
                      const linkParams = new URLSearchParams();
                      if (params.category)
                        linkParams.set("category", params.category);
                      if (params.condition)
                        linkParams.set("condition", params.condition);
                      if (params.size) linkParams.set("size", params.size);
                      if (params.minPrice)
                        linkParams.set("minPrice", params.minPrice);
                      if (params.maxPrice)
                        linkParams.set("maxPrice", params.maxPrice);
                      if (params.q) linkParams.set("q", params.q);
                      if (params.sort) linkParams.set("sort", params.sort);
                      linkParams.set("page", String(pageNum));

                      return (
                        <a
                          key={pageNum}
                          href={`/shop?${linkParams.toString()}`}
                          className={`px-3 py-1.5 text-sm border rounded transition-colors ${
                            pageNum === page
                              ? "border-copper bg-copper text-white"
                              : "border-border bg-white hover:bg-cream-dark"
                          }`}
                        >
                          {pageNum}
                        </a>
                      );
                    }
                  )}
                </div>
              )}
            </div>
          </div>
        </Suspense>
      </div>
    </>
  );
}
