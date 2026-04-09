import { Metadata } from "next";
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
    page?: string;
  }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;

  const conditionFilter = params.condition
    ? (params.condition.split(",") as Condition[])
    : undefined;

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
        params.page ? Number(params.page) : 1
      ),
      getCategories(),
    ]
  );

  const conditionLabel: Record<string, string> = {
    LIKE_NEW: "Like New",
    GOOD: "Good",
    FAIR: "Fair",
  };

  return (
    <>
      {/* Page header */}
      <div className="bg-charcoal px-6 py-6 text-center">
        <h1 className="font-display text-3xl md:text-4xl font-light text-cream italic">
          {params.category
            ? categories.find((c) => c.slug === params.category)?.name ??
              "Shop All"
            : "Shop All"}
        </h1>
        <p className="text-sm text-charcoal-soft mt-2">
          Handpicked fashion — every piece is one of a kind
        </p>
      </div>

      {/* Filters bar */}
      <ShopFilters />

      {/* Main content */}
      <div className="flex">
        {/* Sidebar */}
        <div className="hidden md:block w-[220px] p-4 border-r border-border bg-cream flex-shrink-0">
          <div className="text-xs uppercase tracking-widest text-charcoal-soft font-medium mb-4">
            Filter By
          </div>

          {/* Price Range */}
          <div className="mb-5">
            <div className="text-sm font-medium mb-2">Price Range</div>
            <div className="flex gap-2">
              <input
                placeholder="₦ Min"
                className="flex-1 px-2 py-1.5 border border-border text-sm bg-white outline-none focus:border-copper"
              />
              <input
                placeholder="₦ Max"
                className="flex-1 px-2 py-1.5 border border-border text-sm bg-white outline-none focus:border-copper"
              />
            </div>
          </div>

          {/* Category */}
          <div className="mb-5">
            <div className="text-sm font-medium mb-2">Category</div>
            <div className="flex flex-col gap-2">
              {categories.map((c) => (
                <label
                  key={c.id}
                  className="flex items-center gap-2 text-sm cursor-pointer"
                >
                  <input
                    type="checkbox"
                    className="accent-copper"
                    defaultChecked={params.category === c.slug}
                  />{" "}
                  {c.name} ({c._count.products})
                </label>
              ))}
            </div>
          </div>

          {/* Condition */}
          <div className="mb-5">
            <div className="text-sm font-medium mb-2">Condition</div>
            <div className="flex flex-col gap-2">
              {(["LIKE_NEW", "GOOD", "FAIR"] as Condition[]).map((c) => (
                <label
                  key={c}
                  className="flex items-center gap-2 text-sm cursor-pointer"
                >
                  <input type="checkbox" className="accent-copper" />{" "}
                  {conditionLabel[c]}
                </label>
              ))}
            </div>
          </div>

          {/* Size */}
          <div className="mb-5">
            <div className="text-sm font-medium mb-2">Size</div>
            <div className="flex flex-wrap gap-1.5">
              {["XS", "S", "M", "L", "XL"].map((s) => (
                <div
                  key={s}
                  className="w-10 h-10 flex items-center justify-center text-sm border border-border bg-white cursor-pointer hover:border-charcoal-soft"
                >
                  {s}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Products grid */}
        <div className="flex-1">
          <div className="flex justify-between items-center px-4 py-3 bg-cream-dark border-b border-border text-sm text-charcoal-soft">
            <span>
              Showing{" "}
              <strong className="text-charcoal">{total} results</strong> for{" "}
              <strong className="text-charcoal">
                {params.category
                  ? categories.find((c) => c.slug === params.category)?.name
                  : "All Items"}
              </strong>
            </span>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-20 px-4">
              <h2 className="font-display text-2xl italic text-charcoal-soft mb-2">
                No products found
              </h2>
              <p className="text-sm text-charcoal-soft">
                Try adjusting your filters or check back later for new arrivals.
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
                (pageNum) => (
                  <a
                    key={pageNum}
                    href={`/shop?${new URLSearchParams({
                      ...(params.category
                        ? { category: params.category }
                        : {}),
                      ...(params.q ? { q: params.q } : {}),
                      page: String(pageNum),
                    }).toString()}`}
                    className={`px-3 py-1.5 text-sm border rounded transition-colors ${
                      pageNum === page
                        ? "border-copper bg-copper text-white"
                        : "border-border bg-white hover:bg-cream-dark"
                    }`}
                  >
                    {pageNum}
                  </a>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
