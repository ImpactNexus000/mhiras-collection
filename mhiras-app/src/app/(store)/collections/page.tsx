import { Metadata } from "next";
import { Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Collections",
  description: "Curated edits from Mhiras Collection — coming soon.",
};

// Hard-coded preview of upcoming curated edits. None of these are shoppable
// yet — the cards render as non-interactive "Coming Soon" tiles. When the
// Collection model is wired through admin (CollectionProduct join is already
// in the schema), this becomes a DB-driven list and the cards link to
// /collections/[slug].
const collections = [
  {
    slug: "spring-edit-2026",
    name: "Light Layers & Fresh Prints",
    tag: "Spring Edit 2026",
    size: "large",
  },
  {
    slug: "workwear-capsule",
    name: "The Workwear Capsule",
    tag: "Timeless Classics",
    size: "large",
  },
  {
    slug: "accessories-edit",
    name: "The Accessories Edit",
    tag: "Bags & More",
    size: "small",
  },
  {
    slug: "budget-steals",
    name: "Budget Steals",
    tag: "Under ₦5,000",
    size: "small",
  },
  {
    slug: "for-him",
    name: "For Him",
    tag: "Men's Selection",
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

function ComingSoonBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider bg-copper text-white px-3 py-1">
      <Clock size={10} aria-hidden="true" />
      Coming Soon
    </span>
  );
}

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
          Themed edits of handpicked pieces — coming soon. In the meantime,
          explore the full shop for what&apos;s available now.
        </p>
      </div>

      {/* Collections grid — preview only, not yet shoppable */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        {/* Large cards */}
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          {large.map((col, i) => (
            <div
              key={col.slug}
              aria-label={`${col.name} — coming soon`}
              className={`bg-gradient-to-br ${gradients[i]} rounded-lg overflow-hidden min-h-[280px] md:min-h-[320px] flex flex-col justify-end p-7 relative opacity-90`}
            >
              <span className="absolute top-4 right-4">
                <ComingSoonBadge />
              </span>
              <div className="text-xs tracking-widest uppercase text-copper mb-2">
                {col.tag}
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-light text-cream italic leading-tight mb-2">
                {col.name}
              </h2>
              <p className="text-sm text-charcoal-soft">
                We&apos;re putting this edit together — check back soon.
              </p>
            </div>
          ))}
        </div>

        {/* Small cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {small.map((col, i) => (
            <div
              key={col.slug}
              aria-label={`${col.name} — coming soon`}
              className={`bg-gradient-to-br ${gradients[i + 2]} rounded-lg overflow-hidden min-h-[200px] md:min-h-[240px] flex flex-col justify-end p-5 relative opacity-90`}
            >
              <span className="absolute top-3 right-3">
                <ComingSoonBadge />
              </span>
              <div className="text-[10px] tracking-widest uppercase text-copper mb-1">
                {col.tag}
              </div>
              <h3 className="font-display text-xl md:text-2xl font-light text-cream italic mb-1">
                {col.name}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
