"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { SlidersHorizontal, X } from "lucide-react";

interface Category {
  id: string;
  slug: string;
  name: string;
  sizeOptions?: string | null;
  _count: { products: number };
}

interface ShopFiltersProps {
  categories: Category[];
  /** Products column — rendered beside the desktop sidebar, full-width on mobile. */
  children?: ReactNode;
}

const conditionOptions = [
  { value: "LIKE_NEW", label: "Like New" },
  { value: "GOOD", label: "Good" },
  { value: "FAIR", label: "Fair" },
];

const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "price-asc", label: "Price: Low–High" },
  { value: "price-desc", label: "Price: High–Low" },
];

export function ShopFilters({ categories, children }: ShopFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const mobileToggleRef = useRef<HTMLButtonElement>(null);
  const drawerCloseRef = useRef<HTMLButtonElement>(null);

  // Close the mobile filter drawer on Escape, lock body scroll while open,
  // and move focus into the drawer (returning focus to the toggle on close).
  useEffect(() => {
    if (!showMobileFilters) return;
    const toggleNode = mobileToggleRef.current;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowMobileFilters(false);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    drawerCloseRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      toggleNode?.focus();
    };
  }, [showMobileFilters]);

  // Read current filter state from URL
  const activeCategory = searchParams.get("category") ?? "";
  const activeConditions = searchParams.get("condition")?.split(",") ?? [];
  const activeSize = searchParams.get("size") ?? "";
  const activeSort = searchParams.get("sort") ?? "newest";
  const minPrice = searchParams.get("minPrice") ?? "";
  const maxPrice = searchParams.get("maxPrice") ?? "";

  // Derive size options from the real catalog. When a category is selected,
  // narrow to that category's sizes; otherwise show the union across all.
  const sizes = (() => {
    const source = activeCategory
      ? categories.filter((c) => c.slug === activeCategory)
      : categories;
    const all = source.flatMap((c) =>
      (c.sizeOptions ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    );
    return Array.from(new Set(all));
  })();

  // Local state for price inputs (applied on blur/enter)
  const [localMinPrice, setLocalMinPrice] = useState(minPrice);
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice);

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      // Reset to page 1 on any filter change
      params.delete("page");
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      router.push(`/shop?${params.toString()}`);
    },
    [router, searchParams]
  );

  function toggleCategory(slug: string) {
    updateParams({ category: activeCategory === slug ? null : slug });
  }

  function toggleCondition(value: string) {
    const next = activeConditions.includes(value)
      ? activeConditions.filter((c) => c !== value)
      : [...activeConditions, value];
    updateParams({ condition: next.length > 0 ? next.join(",") : null });
  }

  function toggleSize(size: string) {
    updateParams({ size: activeSize === size ? null : size });
  }

  function applyPrice() {
    updateParams({ minPrice: localMinPrice || null, maxPrice: localMaxPrice || null });
  }

  function handleSort(value: string) {
    updateParams({ sort: value === "newest" ? null : value });
  }

  function clearAll() {
    router.push("/shop");
    setLocalMinPrice("");
    setLocalMaxPrice("");
  }

  const hasActiveFilters =
    activeCategory || activeConditions.length > 0 || activeSize || minPrice || maxPrice;

  // Shared filter controls (used in both desktop sidebar and mobile drawer)
  function FilterControls({ isMobile = false }: { isMobile?: boolean }) {
    return (
      <>
        {/* Price Range */}
        <div className="mb-5">
          <div className="text-sm font-medium mb-2">Price Range</div>
          <div className="flex gap-2">
            <input
              placeholder="₦ Min"
              type="number"
              value={localMinPrice}
              onChange={(e) => setLocalMinPrice(e.target.value)}
              onBlur={applyPrice}
              onKeyDown={(e) => e.key === "Enter" && applyPrice()}
              className={cn(
                "flex-1 border border-border text-sm bg-white outline-none focus:border-copper",
                isMobile ? "px-3 py-2" : "px-2 py-1.5"
              )}
            />
            <input
              placeholder="₦ Max"
              type="number"
              value={localMaxPrice}
              onChange={(e) => setLocalMaxPrice(e.target.value)}
              onBlur={applyPrice}
              onKeyDown={(e) => e.key === "Enter" && applyPrice()}
              className={cn(
                "flex-1 border border-border text-sm bg-white outline-none focus:border-copper",
                isMobile ? "px-3 py-2" : "px-2 py-1.5"
              )}
            />
          </div>
        </div>

        {/* Category */}
        <div className="mb-5">
          <div className="text-sm font-medium mb-2">Category</div>
          <div className={cn("flex flex-col", isMobile ? "gap-2.5" : "gap-2")}>
            {categories.map((cat) => (
              <label
                key={cat.id}
                className="flex items-center gap-2 text-sm cursor-pointer"
              >
                <input
                  type="checkbox"
                  className="accent-copper"
                  checked={activeCategory === cat.slug}
                  onChange={() => toggleCategory(cat.slug)}
                />
                {cat.name} ({cat._count.products})
              </label>
            ))}
          </div>
        </div>

        {/* Condition */}
        <div className="mb-5">
          <div className="text-sm font-medium mb-2">Condition</div>
          <div className={cn("flex flex-col", isMobile ? "gap-2.5" : "gap-2")}>
            {conditionOptions.map((c) => (
              <label
                key={c.value}
                className="flex items-center gap-2 text-sm cursor-pointer"
              >
                <input
                  type="checkbox"
                  className="accent-copper"
                  checked={activeConditions.includes(c.value)}
                  onChange={() => toggleCondition(c.value)}
                />
                {c.label}
              </label>
            ))}
          </div>
        </div>

        {/* Size */}
        {sizes.length > 0 && (
          <div className="mb-5">
            <div className="text-sm font-medium mb-2">Size</div>
            <div className={cn("flex flex-wrap", isMobile ? "gap-2" : "gap-1.5")}>
              {sizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSize(s)}
                  aria-pressed={activeSize === s}
                  aria-label={`Size ${s}`}
                  className={cn(
                    "flex items-center justify-center text-sm border cursor-pointer transition-colors",
                    isMobile ? "w-11 h-11" : "w-10 h-10",
                    activeSize === s
                      ? "bg-charcoal text-cream border-charcoal"
                      : "bg-white text-charcoal border-border hover:border-charcoal-soft"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      {/* Filter chips bar */}
      <div className="flex items-center gap-2 px-4 md:px-6 py-3 bg-cream-dark border-b border-border overflow-x-auto">
        {/* Mobile filter toggle */}
        <button
          ref={mobileToggleRef}
          type="button"
          onClick={() => setShowMobileFilters(true)}
          aria-expanded={showMobileFilters}
          aria-controls="mobile-filter-drawer"
          aria-haspopup="dialog"
          className="md:hidden flex items-center gap-1.5 px-3 py-1.5 border border-border bg-white text-sm cursor-pointer"
        >
          <SlidersHorizontal size={14} aria-hidden="true" /> Filters
          {hasActiveFilters && (
            <span
              aria-hidden="true"
              className="w-2 h-2 rounded-full bg-copper"
            />
          )}
          {hasActiveFilters && (
            <span className="sr-only">(filters active)</span>
          )}
        </button>

        {/* Active filter pills */}
        {activeCategory && (
          <span className="flex items-center gap-1 px-3 py-1.5 bg-charcoal text-cream text-sm">
            {categories.find((c) => c.slug === activeCategory)?.name}
            <button
              type="button"
              onClick={() => toggleCategory(activeCategory)}
              aria-label={`Remove ${
                categories.find((c) => c.slug === activeCategory)?.name
              } filter`}
              className="cursor-pointer"
            >
              <X size={12} aria-hidden="true" />
            </button>
          </span>
        )}
        {activeSize && (
          <span className="flex items-center gap-1 px-3 py-1.5 bg-charcoal text-cream text-sm">
            Size {activeSize}
            <button
              type="button"
              onClick={() => toggleSize(activeSize)}
              aria-label={`Remove size ${activeSize} filter`}
              className="cursor-pointer"
            >
              <X size={12} aria-hidden="true" />
            </button>
          </span>
        )}
        {activeConditions.map((c) => (
          <span
            key={c}
            className="flex items-center gap-1 px-3 py-1.5 bg-charcoal text-cream text-sm"
          >
            {conditionOptions.find((o) => o.value === c)?.label}
            <button
              type="button"
              onClick={() => toggleCondition(c)}
              aria-label={`Remove ${
                conditionOptions.find((o) => o.value === c)?.label
              } filter`}
              className="cursor-pointer"
            >
              <X size={12} aria-hidden="true" />
            </button>
          </span>
        ))}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearAll}
            className="text-xs text-copper hover:text-copper-dark cursor-pointer whitespace-nowrap"
          >
            Clear all
          </button>
        )}

        {/* Sort (desktop) */}
        <label htmlFor="shop-sort-desktop" className="sr-only">
          Sort products
        </label>
        <select
          id="shop-sort-desktop"
          value={activeSort}
          onChange={(e) => handleSort(e.target.value)}
          className="ml-auto hidden md:block text-sm px-3 py-1.5 border border-border bg-white text-charcoal cursor-pointer"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              Sort: {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Sidebar (desktop) + products row. On mobile the sidebar is hidden and
          the products take the full width below the chips bar. */}
      <div className="flex">
        <aside className="hidden md:block w-[220px] p-4 border-r border-border bg-cream flex-shrink-0">
          <div className="text-xs uppercase tracking-widest text-charcoal-soft font-medium mb-4">
            Filter By
          </div>
          <FilterControls />
        </aside>
        {children}
      </div>

      {/* Mobile filter drawer */}
      {showMobileFilters && (
        <div
          id="mobile-filter-drawer"
          role="dialog"
          aria-modal="true"
          aria-labelledby="mobile-filter-heading"
          className="md:hidden fixed inset-0 z-50 flex"
        >
          <button
            type="button"
            aria-label="Close filters"
            onClick={() => setShowMobileFilters(false)}
            className="absolute inset-0 bg-charcoal/40 cursor-default"
          />
          <div className="relative ml-auto w-[85%] max-w-sm bg-white h-full overflow-y-auto p-5">
            <div className="flex justify-between items-center mb-5">
              <h2 id="mobile-filter-heading" className="text-base font-medium">
                Filters
              </h2>
              <button
                ref={drawerCloseRef}
                type="button"
                onClick={() => setShowMobileFilters(false)}
                aria-label="Close filters"
                className="cursor-pointer w-9 h-9 flex items-center justify-center"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            <FilterControls isMobile />

            {/* Sort (mobile) */}
            <div className="mb-6">
              <label
                htmlFor="shop-sort-mobile"
                className="text-sm font-medium mb-2 block"
              >
                Sort By
              </label>
              <select
                id="shop-sort-mobile"
                value={activeSort}
                onChange={(e) => handleSort(e.target.value)}
                className="w-full text-sm px-3 py-2.5 border border-border bg-white text-charcoal"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => setShowMobileFilters(false)}
              className="w-full bg-copper text-white text-sm uppercase tracking-wider py-3 cursor-pointer"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </>
  );
}
