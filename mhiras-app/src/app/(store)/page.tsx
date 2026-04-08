import Link from "next/link";
import { Button } from "@/components/ui/button";

const categories = [
  { name: "Women", count: 142, slug: "women" },
  { name: "Men", count: 89, slug: "men" },
  { name: "Bags", count: 47, slug: "bags" },
  { name: "Shoes", count: 63, slug: "shoes" },
];

const featuredProducts = [
  {
    name: "Vintage Wrap Dress",
    category: "Dresses",
    price: 8500,
    originalPrice: 18000,
    badge: "New",
    slug: "vintage-wrap-dress",
  },
  {
    name: "Silk Blouse — Cream",
    category: "Tops",
    price: 5200,
    originalPrice: 12000,
    badge: "Hot",
    slug: "silk-blouse-cream",
  },
  {
    name: "Leather Tote — Brown",
    category: "Bags",
    price: 14000,
    originalPrice: 35000,
    badge: null,
    slug: "leather-tote-brown",
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-charcoal grid md:grid-cols-2 min-h-[320px]">
        <div className="p-8 md:p-10 flex flex-col justify-center">
          <span className="text-xs md:text-sm tracking-widest uppercase text-copper mb-3">
            New Arrivals — Spring Edit
          </span>
          <h1 className="font-display text-5xl md:text-[72px] leading-none font-light text-cream mb-3">
            Curated
            <br />
            Thrift,
            <br />
            <em className="text-gold">Elevated.</em>
          </h1>
          <p className="text-sm md:text-base text-charcoal-soft mb-8 leading-relaxed max-w-md">
            Handpicked fashion pieces, pre-loved and premium.
            <br />
            Every item is unique — once it&apos;s gone, it&apos;s gone.
          </p>
          <div className="flex gap-3">
            <Link href="/shop">
              <Button variant="primary">Shop Now &rarr;</Button>
            </Link>
            <Link href="/collections">
              <Button variant="outline" className="text-cream border-charcoal-mid">
                View Lookbook
              </Button>
            </Link>
          </div>
        </div>
        <div className="hidden md:flex bg-gradient-to-br from-charcoal-mid to-charcoal items-center justify-center relative overflow-hidden">
          <span className="absolute font-display text-[180px] font-light text-charcoal italic opacity-60 select-none">
            M
          </span>
          <div className="w-40 h-56 bg-gradient-to-br from-charcoal-mid to-charcoal border border-charcoal-mid flex flex-col items-center justify-center gap-2 z-10">
            <div className="w-10 h-0.5 bg-gold" />
            <span className="text-[9px] tracking-widest uppercase text-gold">
              Featured Piece
            </span>
            <span className="text-[9px] tracking-widest uppercase text-charcoal-soft">
              &#8358;8,500
            </span>
          </div>
        </div>
      </section>

      {/* Category Bar */}
      <section className="grid grid-cols-4 bg-copper-light">
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/shop?category=${cat.slug}`}
            className="py-3 md:py-3.5 text-center border-r border-copper-light/60 last:border-r-0 hover:bg-copper/5 transition-colors"
          >
            <div className="text-sm font-medium uppercase tracking-wider text-charcoal-mid">
              {cat.name}
            </div>
            <div className="text-xs text-charcoal-soft mt-0.5">
              {cat.count} items
            </div>
          </Link>
        ))}
      </section>

      {/* Just Dropped */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        <div className="flex justify-between items-baseline mb-4">
          <h2 className="font-display text-3xl md:text-4xl font-light italic">
            Just Dropped
          </h2>
          <Link
            href="/shop?filter=new"
            className="text-sm uppercase tracking-wider text-copper underline"
          >
            See all &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-border">
          {featuredProducts.map((product) => (
            <Link
              key={product.slug}
              href={`/shop/${product.slug}`}
              className="bg-white group"
            >
              {/* Image placeholder */}
              <div className="h-48 md:h-60 bg-gradient-to-br from-cream-dark to-gold/30 flex items-center justify-center relative">
                <div className="w-[70px] h-[100px] bg-gradient-to-br from-gold to-copper-dark/40 opacity-60" />
                {product.badge && (
                  <span className="absolute top-2 left-2 bg-copper text-white text-[10px] uppercase tracking-wider px-2.5 py-1">
                    {product.badge}
                  </span>
                )}
              </div>
              <div className="p-4">
                <div className="text-xs text-charcoal-soft uppercase tracking-wider">
                  {product.category}
                </div>
                <div className="text-base font-medium mt-1">
                  {product.name}
                </div>
                <div className="mt-1.5">
                  <span className="text-lg font-medium text-copper">
                    &#8358;{product.price.toLocaleString()}
                  </span>
                  {product.originalPrice && (
                    <span className="text-xs text-charcoal-soft line-through ml-2">
                      &#8358;{product.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center px-4 pb-4">
                <span className="text-xl text-charcoal-soft group-hover:text-copper transition-colors cursor-pointer">
                  &#9825;
                </span>
                <span className="bg-charcoal text-cream text-xs uppercase tracking-wider px-4 py-2 cursor-pointer hover:bg-copper transition-colors">
                  Add to Cart
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 pb-8">
        <div className="bg-copper-light p-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h3 className="font-display text-3xl font-light italic">
              Never miss a drop
            </h3>
            <p className="text-sm text-charcoal-soft mt-1">
              Get notified when new items land.
            </p>
          </div>
          <div className="flex w-full md:w-auto">
            <input
              placeholder="Your WhatsApp number"
              className="input-base flex-1 md:w-60"
            />
            <Button variant="primary" className="px-5">
              Notify Me
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
