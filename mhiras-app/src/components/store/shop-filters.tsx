"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { SlidersHorizontal, X } from "lucide-react";

const categories = [
  { label: "Dresses", count: 34 },
  { label: "Tops", count: 28 },
  { label: "Bottoms", count: 19 },
  { label: "Bags", count: 47 },
  { label: "Shoes", count: 63 },
];

const conditions = ["Like New", "Good", "Fair"];
const sizes = ["XS", "S", "M", "L", "XL"];

const filterChips = ["All", "Women", "Men", "Bags & Accessories", "Shoes", "Under ₦5k"];

const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "price-asc", label: "Price: Low–High" },
  { value: "price-desc", label: "Price: High–Low" },
];

export function ShopFilters() {
  const [activeChip, setActiveChip] = useState("All");
  const [activeSize, setActiveSize] = useState<string | null>("M");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  return (
    <>
      {/* Filter chips bar */}
      <div className="flex items-center gap-2 px-4 md:px-6 py-3 bg-cream-dark border-b border-border overflow-x-auto">
        {filterChips.map((chip) => (
          <button
            key={chip}
            onClick={() => setActiveChip(chip)}
            className={cn(
              "px-3.5 py-1.5 border text-sm whitespace-nowrap cursor-pointer transition-colors",
              activeChip === chip
                ? "bg-charcoal text-cream border-charcoal"
                : "bg-white text-charcoal-mid border-border hover:border-charcoal-soft"
            )}
          >
            {chip}
          </button>
        ))}

        {/* Mobile filter toggle */}
        <button
          onClick={() => setShowMobileFilters(true)}
          className="md:hidden ml-auto flex items-center gap-1.5 px-3 py-1.5 border border-border bg-white text-sm cursor-pointer"
        >
          <SlidersHorizontal size={14} /> Filters
        </button>

        {/* Sort */}
        <select className="ml-auto hidden md:block text-sm px-3 py-1.5 border border-border bg-white text-charcoal cursor-pointer">
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              Sort: {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Desktop sidebar filter */}
      <aside className="hidden md:block w-[220px] p-4 border-r border-border bg-cream flex-shrink-0">
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
            {categories.map((cat) => (
              <label
                key={cat.label}
                className="flex items-center gap-2 text-sm cursor-pointer"
              >
                <input type="checkbox" className="accent-copper" />
                {cat.label} ({cat.count})
              </label>
            ))}
          </div>
        </div>

        {/* Condition */}
        <div className="mb-5">
          <div className="text-sm font-medium mb-2">Condition</div>
          <div className="flex flex-col gap-2">
            {conditions.map((c) => (
              <label
                key={c}
                className="flex items-center gap-2 text-sm cursor-pointer"
              >
                <input
                  type="checkbox"
                  defaultChecked={c !== "Fair"}
                  className="accent-copper"
                />
                {c}
              </label>
            ))}
          </div>
        </div>

        {/* Size */}
        <div className="mb-5">
          <div className="text-sm font-medium mb-2">Size</div>
          <div className="flex flex-wrap gap-1.5">
            {sizes.map((s) => (
              <button
                key={s}
                onClick={() => setActiveSize(activeSize === s ? null : s)}
                className={cn(
                  "w-10 h-10 flex items-center justify-center text-sm border cursor-pointer transition-colors",
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
      </aside>

      {/* Mobile filter drawer */}
      {showMobileFilters && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-charcoal/40"
            onClick={() => setShowMobileFilters(false)}
          />
          <div className="relative ml-auto w-[85%] max-w-sm bg-white h-full overflow-y-auto p-5">
            <div className="flex justify-between items-center mb-5">
              <span className="text-base font-medium">Filters</span>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Price */}
            <div className="mb-5">
              <div className="text-sm font-medium mb-2">Price Range</div>
              <div className="flex gap-2">
                <input
                  placeholder="₦ Min"
                  className="flex-1 px-3 py-2 border border-border text-sm outline-none focus:border-copper"
                />
                <input
                  placeholder="₦ Max"
                  className="flex-1 px-3 py-2 border border-border text-sm outline-none focus:border-copper"
                />
              </div>
            </div>

            {/* Category */}
            <div className="mb-5">
              <div className="text-sm font-medium mb-2">Category</div>
              <div className="flex flex-col gap-2.5">
                {categories.map((cat) => (
                  <label
                    key={cat.label}
                    className="flex items-center gap-2 text-sm cursor-pointer"
                  >
                    <input type="checkbox" className="accent-copper" />
                    {cat.label} ({cat.count})
                  </label>
                ))}
              </div>
            </div>

            {/* Condition */}
            <div className="mb-5">
              <div className="text-sm font-medium mb-2">Condition</div>
              <div className="flex flex-col gap-2.5">
                {conditions.map((c) => (
                  <label
                    key={c}
                    className="flex items-center gap-2 text-sm cursor-pointer"
                  >
                    <input type="checkbox" className="accent-copper" />
                    {c}
                  </label>
                ))}
              </div>
            </div>

            {/* Size */}
            <div className="mb-5">
              <div className="text-sm font-medium mb-2">Size</div>
              <div className="flex flex-wrap gap-2">
                {sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() =>
                      setActiveSize(activeSize === s ? null : s)
                    }
                    className={cn(
                      "w-11 h-11 flex items-center justify-center text-sm border cursor-pointer",
                      activeSize === s
                        ? "bg-charcoal text-cream border-charcoal"
                        : "bg-white text-charcoal border-border"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort (mobile) */}
            <div className="mb-6">
              <div className="text-sm font-medium mb-2">Sort By</div>
              <select className="w-full text-sm px-3 py-2.5 border border-border bg-white text-charcoal">
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <button
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
