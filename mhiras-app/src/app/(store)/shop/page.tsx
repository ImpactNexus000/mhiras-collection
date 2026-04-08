import { Metadata } from "next";
import { ShopFilters } from "@/components/store/shop-filters";
import { ProductCard } from "@/components/store/product-card";

export const metadata: Metadata = {
  title: "Shop",
  description: "Browse our curated collection of pre-loved fashion pieces.",
};

// Placeholder data — will be replaced with DB queries
const products = [
  { slug: "midi-floral-dress", name: "Midi Floral Dress", category: "Dresses", size: "M", price: 7000, originalPrice: 22000, badge: "Like New", stock: 3 },
  { slug: "linen-button-up", name: "Linen Button-Up", category: "Tops", size: "S", price: 4500, originalPrice: null, badge: null, stock: 2 },
  { slug: "structured-handbag", name: "Structured Handbag", category: "Bags", size: null, price: 11000, originalPrice: 28000, badge: "1 left!", stock: 1 },
  { slug: "block-heel-mules", name: "Block Heel Mules", category: "Shoes", size: "40", price: 9500, originalPrice: 24000, badge: null, stock: 4 },
  { slug: "slip-midi-dress", name: "Slip Midi Dress", category: "Dresses", size: "XS", price: 6000, originalPrice: 15000, badge: "New", stock: 2 },
  { slug: "oxford-shirt-navy", name: "Oxford Shirt — Navy", category: "Men · Tops", size: "L", price: 5500, originalPrice: null, badge: null, stock: 3 },
  { slug: "vintage-wrap-dress", name: "Vintage Wrap Dress", category: "Dresses", size: "M", price: 8500, originalPrice: 18000, badge: "New", stock: 1 },
  { slug: "silk-blouse-cream", name: "Silk Blouse — Cream", category: "Tops", size: "S", price: 5200, originalPrice: 12000, badge: "Hot", stock: 0 },
  { slug: "leather-tote-brown", name: "Leather Tote — Brown", category: "Bags", size: null, price: 14000, originalPrice: 35000, badge: null, stock: 2 },
];

export default function ShopPage() {
  return (
    <>
      {/* Page header */}
      <div className="bg-charcoal px-6 py-6 text-center">
        <h1 className="font-display text-3xl md:text-4xl font-light text-cream italic">
          Shop All
        </h1>
        <p className="text-sm text-charcoal-soft mt-2">
          Handpicked fashion — every piece is one of a kind
        </p>
      </div>

      {/* Filters bar */}
      <ShopFilters />

      {/* Main content */}
      <div className="flex">
        {/* Sidebar rendered by ShopFilters on desktop */}
        <div className="hidden md:block w-[220px] p-4 border-r border-border bg-cream flex-shrink-0">
          <div className="text-xs uppercase tracking-widest text-charcoal-soft font-medium mb-4">
            Filter By
          </div>

          {/* Price Range */}
          <div className="mb-5">
            <div className="text-sm font-medium mb-2">Price Range</div>
            <div className="flex gap-2">
              <input placeholder="₦ Min" className="flex-1 px-2 py-1.5 border border-border text-sm bg-white outline-none focus:border-copper" />
              <input placeholder="₦ Max" className="flex-1 px-2 py-1.5 border border-border text-sm bg-white outline-none focus:border-copper" />
            </div>
          </div>

          {/* Category */}
          <div className="mb-5">
            <div className="text-sm font-medium mb-2">Category</div>
            <div className="flex flex-col gap-2">
              {["Dresses (34)", "Tops (28)", "Bottoms (19)", "Bags (47)", "Shoes (63)"].map((c) => (
                <label key={c} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" className="accent-copper" /> {c}
                </label>
              ))}
            </div>
          </div>

          {/* Condition */}
          <div className="mb-5">
            <div className="text-sm font-medium mb-2">Condition</div>
            <div className="flex flex-col gap-2">
              {["Like New", "Good", "Fair"].map((c) => (
                <label key={c} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" defaultChecked={c !== "Fair"} className="accent-copper" /> {c}
                </label>
              ))}
            </div>
          </div>

          {/* Size */}
          <div className="mb-5">
            <div className="text-sm font-medium mb-2">Size</div>
            <div className="flex flex-wrap gap-1.5">
              {["XS", "S", "M", "L", "XL"].map((s) => (
                <div key={s} className="w-10 h-10 flex items-center justify-center text-sm border border-border bg-white cursor-pointer hover:border-charcoal-soft">
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
              Showing <strong className="text-charcoal">{products.length} results</strong> for{" "}
              <strong className="text-charcoal">All Items</strong>
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-border">
            {products.map((product) => (
              <ProductCard
                key={product.slug}
                slug={product.slug}
                name={product.name}
                category={product.category}
                size={product.size}
                price={product.price}
                originalPrice={product.originalPrice}
                badge={product.badge}
                stock={product.stock}
                isSoldOut={product.stock === 0}
                className="rounded-none border-0"
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
