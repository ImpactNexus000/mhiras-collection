import { Metadata } from "next";
import { Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Collections",
  description: "Curated edits from Mhiras Collection — coming soon.",
};

// Hard-coded preview of upcoming curated edits. None of these are shoppable
// yet — the cards render as non-interactive "Coming Soon" tiles. New Arrivals
// is the pinned featured edit (always first). When the Collection model is
// wired through admin (CollectionProduct join is already in the schema), this
// becomes a DB-driven list and the cards link to /collections/[slug].
const collections = [
  {
    slug: "new-arrivals",
    name: "New Arrivals",
    tag: "Fresh UK Bale · Just Arrived 🔥",
    featured: true,
  },
  {
    slug: "dresses",
    name: "Dresses Collection",
    tag: "Mini · Midi · Maxi · Dinner · Bodycon",
  },
  {
    slug: "corporate-classy",
    name: "Corporate / Classy Wear",
    tag: "Office Fits · Boss Babe Collection",
  },
  {
    slug: "casual-wear",
    name: "Casual Wear",
    tag: "Everyday Fits · Denim · Chill Fits",
  },
  {
    slug: "luxury-premium",
    name: "Luxury / Premium Finds",
    tag: "Rich Aunty Collection · Elite Closet",
  },
  {
    slug: "shoes",
    name: "Shoes Collection",
    tag: "Heels · Sneakers · Flats · Sandals",
  },
  {
    slug: "bags",
    name: "Bags Collection",
    tag: "Totes · Mini · Luxury · Everyday",
  },
  {
    slug: "accessories",
    name: "Accessories",
    tag: "Jewelry · Sunglasses · Belts · Watches",
  },
  {
    slug: "budget-corner",
    name: "Budget Corner",
    tag: "Under ₦5k · Steals · Affordable Picks",
  },
  {
    slug: "sales-clearance",
    name: "Sales & Clearance",
    tag: "Flash Sale · Last Pieces · Clearance",
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
  const featured = collections.find((c) => c.featured);
  const rest = collections.filter((c) => !c.featured);

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
        {/* Featured: New Arrivals — always on top */}
        {featured && (
          <div
            aria-label={`${featured.name} — coming soon`}
            className={`bg-gradient-to-br ${gradients[0]} rounded-lg overflow-hidden min-h-[280px] md:min-h-[320px] flex flex-col justify-end p-7 relative opacity-90 mb-4`}
          >
            <span className="absolute top-4 right-4">
              <ComingSoonBadge />
            </span>
            <div className="text-xs tracking-widest uppercase text-copper mb-2">
              {featured.tag}
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-light text-cream italic leading-tight mb-2">
              {featured.name}
            </h2>
            <p className="text-sm text-charcoal-soft">
              We&apos;re putting this edit together — check back soon.
            </p>
          </div>
        )}

        {/* The rest */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {rest.map((col, i) => (
            <div
              key={col.slug}
              aria-label={`${col.name} — coming soon`}
              className={`bg-gradient-to-br ${gradients[i % gradients.length]} rounded-lg overflow-hidden min-h-[200px] md:min-h-[240px] flex flex-col justify-end p-5 relative opacity-90`}
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
