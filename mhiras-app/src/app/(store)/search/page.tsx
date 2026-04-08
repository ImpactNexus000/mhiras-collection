import { Metadata } from "next";
import { ProductCard } from "@/components/store/product-card";
import { SearchBar } from "@/components/store/search-bar";

export const metadata: Metadata = {
  title: "Search",
};

const trendingTags = ["Bags", "Silk blouse", "Under ₦5,000", "Size M", "Vintage", "Men's shirts"];

const results = [
  { slug: "vintage-wrap-dress", name: "Vintage Wrap Dress", category: "Dresses", size: "M", price: 8500, originalPrice: 18000, badge: "New" },
  { slug: "vintage-a-line-dress", name: "Vintage A-Line Dress", category: "Dresses", size: "S", price: 6200, originalPrice: 14000, badge: null },
  { slug: "vintage-shirt-dress", name: "Vintage Shirt Dress", category: "Dresses", size: "L", price: 7800, originalPrice: null, badge: null },
  { slug: "vintage-maxi-dress", name: "Vintage Maxi Dress", category: "Dresses", size: "M", price: 9000, originalPrice: 25000, badge: null },
  { slug: "midi-floral-dress", name: "Midi Floral Dress", category: "Dresses", size: "M", price: 7000, originalPrice: 22000, badge: "Like New" },
  { slug: "slip-midi-dress", name: "Slip Midi Dress", category: "Dresses", size: "XS", price: 6000, originalPrice: 15000, badge: "New" },
];

export default function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  // In production, query would come from searchParams and hit the DB
  const query = "vintage dress";

  return (
    <>
      {/* Search header */}
      <div className="bg-charcoal px-4 md:px-6 py-6">
        <SearchBar />
        <div className="flex flex-wrap gap-2 justify-center mt-3">
          {trendingTags.map((tag) => (
            <span
              key={tag}
              className="text-xs text-charcoal-soft px-3 py-1 border border-charcoal-mid cursor-pointer hover:text-cream hover:border-cream/30 transition-colors"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
        <div className="flex justify-between items-center mb-5">
          <span className="text-sm text-charcoal-soft">
            Showing <strong className="text-charcoal">{results.length} results</strong> for &ldquo;
            <strong className="text-charcoal">{query}</strong>&rdquo;
          </span>
          <select className="text-sm px-3 py-1.5 border border-border bg-white text-charcoal cursor-pointer">
            <option>Relevance</option>
            <option>Price: Low–High</option>
            <option>Newest</option>
          </select>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {results.map((product) => (
            <ProductCard
              key={product.slug}
              slug={product.slug}
              name={product.name}
              category={product.category}
              size={product.size}
              price={product.price}
              originalPrice={product.originalPrice}
              badge={product.badge}
            />
          ))}
        </div>
      </div>
    </>
  );
}
