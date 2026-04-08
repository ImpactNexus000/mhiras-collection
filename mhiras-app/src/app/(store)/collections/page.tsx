import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Collections",
  description: "Explore our curated collections of handpicked thrift fashion.",
};

const collections = [
  {
    slug: "spring-edit-2026",
    name: "Light Layers & Fresh Prints",
    tag: "Spring Edit 2026",
    pieces: 24,
    startingPrice: 3500,
    isNew: true,
    size: "large",
  },
  {
    slug: "workwear-capsule",
    name: "The Workwear Capsule",
    tag: "Timeless Classics",
    pieces: 18,
    startingPrice: 4000,
    isNew: false,
    size: "large",
  },
  {
    slug: "accessories-edit",
    name: "The Accessories Edit",
    tag: "Bags & More",
    pieces: 47,
    startingPrice: null,
    isNew: false,
    size: "small",
  },
  {
    slug: "budget-steals",
    name: "Budget Steals",
    tag: "Under ₦5,000",
    pieces: 31,
    startingPrice: null,
    isNew: false,
    size: "small",
  },
  {
    slug: "for-him",
    name: "For Him",
    tag: "Men's Selection",
    pieces: 89,
    startingPrice: null,
    isNew: false,
    size: "small",
  },
];

const gradients = [
  "from-[#2A2220] to-[#1A1614]",
  "from-[#3D2E28] to-[#2A1F1C]",
  "from-[#4A3A35] to-[#2A1F1C]",
  "from-[#2A2220] to-[#1A1614]",
  "from-[#3D3330] to-[#1A1614]",
];

export default function CollectionsPage() {
  const large = collections.filter((c) => c.size === "large");
  const small = collections.filter((c) => c.size === "small");

  return (
    <>
      {/* Hero */}
      <div className="bg-charcoal px-6 py-12 text-center">
        <div className="text-xs tracking-widest uppercase text-copper mb-2">
          Curated Edits
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-light text-cream italic mb-3">
          Our Collections
        </h1>
        <p className="text-sm text-charcoal-soft max-w-lg mx-auto leading-relaxed">
          Each collection is a carefully curated edit of handpicked pieces.
          Explore our themed selections and find your next favourite.
        </p>
      </div>

      {/* Collections grid */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        {/* Large cards */}
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          {large.map((col, i) => (
            <Link
              key={col.slug}
              href={`/collections/${col.slug}`}
              className={`bg-gradient-to-br ${gradients[i]} rounded-lg overflow-hidden min-h-[280px] md:min-h-[320px] flex flex-col justify-end p-7 relative group`}
            >
              {col.isNew && (
                <span className="absolute top-4 right-4 text-[10px] uppercase tracking-wider bg-copper text-white px-3 py-1">
                  New
                </span>
              )}
              <div className="text-xs tracking-widest uppercase text-copper mb-2">
                {col.tag}
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-light text-cream italic leading-tight mb-2">
                {col.name}
              </h2>
              <p className="text-sm text-charcoal-soft mb-4">
                {col.pieces} pieces
                {col.startingPrice && ` · Starting from ₦${col.startingPrice.toLocaleString()}`}
              </p>
              <span className="inline-flex items-center gap-2 bg-copper text-white text-xs uppercase tracking-wider px-5 py-2.5 w-fit group-hover:bg-copper-dark transition-colors">
                Shop Collection →
              </span>
            </Link>
          ))}
        </div>

        {/* Small cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {small.map((col, i) => (
            <Link
              key={col.slug}
              href={`/collections/${col.slug}`}
              className={`bg-gradient-to-br ${gradients[i + 2]} rounded-lg overflow-hidden min-h-[200px] md:min-h-[240px] flex flex-col justify-end p-5 group`}
            >
              <div className="text-[10px] tracking-widest uppercase text-copper mb-1">
                {col.tag}
              </div>
              <h3 className="font-display text-xl md:text-2xl font-light text-cream italic mb-1">
                {col.name}
              </h3>
              <p className="text-xs text-charcoal-soft">
                {col.pieces} pieces
              </p>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
