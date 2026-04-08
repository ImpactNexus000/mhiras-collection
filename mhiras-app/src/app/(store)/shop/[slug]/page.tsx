import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/store/product-card";
import { formatPrice } from "@/lib/utils";
import { Heart, ShieldCheck, RotateCcw, Truck } from "lucide-react";

// Placeholder — will be fetched from DB
const product = {
  name: "Vintage Wrap Dress",
  subtitle: "Burgundy Floral",
  slug: "vintage-wrap-dress",
  category: "Dresses",
  brand: "Mhiras Collection",
  price: 8500,
  originalPrice: 22000,
  condition: "Like New",
  sizes: [
    { label: "XS", available: true },
    { label: "M", available: true, selected: true },
    { label: "L", available: false },
  ],
  stock: 1,
  description:
    "Beautiful wrap dress in a burgundy floral print. Fully lined, midi length. Excellent pre-loved condition — no stains, no tears. A true vintage find.",
  images: [1, 2, 3],
};

const relatedProducts = [
  { slug: "midi-floral-dress", name: "Midi Floral Dress", category: "Dresses", size: "M", price: 7000, originalPrice: 22000, badge: "Like New" },
  { slug: "slip-midi-dress", name: "Slip Midi Dress", category: "Dresses", size: "XS", price: 6000, originalPrice: 15000, badge: "New" },
  { slug: "silk-blouse-cream", name: "Silk Blouse — Cream", category: "Tops", size: "S", price: 5200, originalPrice: 12000, badge: null },
];

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: product.name,
    description: product.description,
  };
}

export default function ProductDetailPage() {
  const discount = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100
  );

  return (
    <>
      {/* Breadcrumb */}
      <div className="px-6 py-3 text-sm text-charcoal-soft border-b border-border">
        <Link href="/" className="hover:text-charcoal">Home</Link>
        {" / "}
        <Link href="/shop" className="hover:text-charcoal">Shop</Link>
        {" / "}
        <Link href="/shop?category=dresses" className="hover:text-charcoal">{product.category}</Link>
        {" / "}
        <span className="text-charcoal">{product.name}</span>
      </div>

      {/* Product detail grid */}
      <div className="grid md:grid-cols-2">
        {/* Gallery */}
        <div className="bg-cream-dark flex items-center justify-center min-h-[340px] md:min-h-[480px] relative">
          <div className="w-40 h-56 bg-gradient-to-br from-gold to-copper-dark/50 opacity-60 rounded" />
          {/* Thumbnails */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {product.images.map((_, i) => (
              <div
                key={i}
                className={`w-12 h-16 bg-cream-dark border ${
                  i === 0 ? "border-copper" : "border-border"
                } cursor-pointer`}
              />
            ))}
          </div>
        </div>

        {/* Product info */}
        <div className="p-6 md:p-8">
          <div className="text-xs uppercase tracking-widest text-charcoal-soft mb-1.5">
            {product.brand}
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-light leading-tight mb-3">
            {product.name}
            <br />
            <em className="text-charcoal-mid">— {product.subtitle}</em>
          </h1>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-2xl md:text-3xl font-medium text-copper">
              {formatPrice(product.price)}
            </span>
            <span className="text-base text-charcoal-soft line-through">
              {formatPrice(product.originalPrice)}
            </span>
            <span className="text-xs bg-success/10 text-success px-2 py-0.5">
              {discount}% off
            </span>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider bg-copper-light text-copper-dark px-3 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-copper" />
              {product.condition}
            </span>
            <span className="text-xs bg-cream-dark px-3 py-1">
              Size M
            </span>
            <span className="text-xs bg-cream-dark px-3 py-1">
              {product.stock} Available
            </span>
          </div>

          {/* Trust signals */}
          <div className="flex flex-wrap gap-4 text-sm text-charcoal-soft my-4">
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={15} className="text-copper" />
              Verified & Inspected
            </span>
            <span className="flex items-center gap-1.5">
              <RotateCcw size={15} className="text-copper" />
              48hr Return Policy
            </span>
            <span className="flex items-center gap-1.5">
              <Truck size={15} className="text-copper" />
              Nationwide Delivery
            </span>
          </div>

          <div className="h-px bg-border my-5" />

          {/* Size selector */}
          <div className="mb-5">
            <div className="text-xs uppercase tracking-wider text-charcoal-soft mb-2">
              Available Sizes
            </div>
            <div className="flex gap-2">
              {product.sizes.map((s) => (
                <button
                  key={s.label}
                  disabled={!s.available}
                  className={`w-11 h-11 flex items-center justify-center text-sm border cursor-pointer transition-colors ${
                    s.selected
                      ? "bg-charcoal text-cream border-charcoal"
                      : s.available
                      ? "bg-white text-charcoal border-border hover:border-charcoal"
                      : "bg-white text-charcoal-soft/30 border-border line-through cursor-not-allowed"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col gap-3">
            <Button variant="primary" fullWidth size="lg">
              Add to Cart
            </Button>
            <Button variant="outline" fullWidth size="lg" className="text-charcoal border-charcoal hover:bg-cream-dark">
              <Heart size={16} /> Add to Wishlist
            </Button>
          </div>

          {/* Description */}
          <div className="mt-6 p-5 bg-cream-dark rounded">
            <div className="text-xs uppercase tracking-wider text-charcoal-mid font-medium mb-2">
              Description
            </div>
            <p className="text-sm text-charcoal-soft leading-relaxed">
              {product.description}
            </p>
          </div>
        </div>
      </div>

      {/* Related products */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 py-10">
        <div className="flex justify-between items-baseline mb-5">
          <h2 className="font-display text-3xl font-light italic">
            You May Also Like
          </h2>
          <Link
            href="/shop"
            className="text-sm uppercase tracking-wider text-copper underline"
          >
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {relatedProducts.map((p) => (
            <ProductCard
              key={p.slug}
              slug={p.slug}
              name={p.name}
              category={p.category}
              size={p.size}
              price={p.price}
              originalPrice={p.originalPrice}
              badge={p.badge}
            />
          ))}
        </div>
      </section>
    </>
  );
}
