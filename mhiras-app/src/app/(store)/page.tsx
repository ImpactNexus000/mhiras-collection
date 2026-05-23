import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/store/product-card";
import { NewsletterForm } from "@/components/store/newsletter-form";
import { getCategories, getProducts } from "@/lib/queries/products";
import { getWishlistSet } from "@/lib/queries/wishlist";
import { getRatingSummariesForProducts } from "@/lib/queries/reviews";
import { CategoryKind } from "@/generated/prisma/client";
import { ArrowRight } from "lucide-react";
import { SITE_URL, SITE_NAME } from "@/lib/site";

const conditionLabel: Record<string, string> = {
  LIKE_NEW: "Like New",
  GOOD: "Good",
  FAIR: "Fair",
};

export default async function HomePage() {
  const [categories, { products: justDropped }, wishlistSet] =
    await Promise.all([
      getCategories(CategoryKind.RETAIL),
      getProducts({ kind: CategoryKind.RETAIL }, 1, 6, {
        field: "createdAt",
        direction: "desc",
      }),
      getWishlistSet(),
    ]);

  const ratingMap = await getRatingSummariesForProducts(
    justDropped.map((p) => p.id)
  );

  // Brand structured data — helps Google show the org and a search box.
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      description:
        "Curated pre-loved thrift fashion, delivered nationwide across Nigeria.",
      logo: `${SITE_URL}/logo-nav.png`,
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      {/* Hero */}
      <section className="bg-charcoal grid md:grid-cols-2 min-h-[320px]">
        <div className="p-8 md:py-10 md:pr-10 md:pl-20 flex flex-col justify-center">
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
          <span className="absolute font-display text-[180px] font-light text-charcoal italic opacity-50 select-none">
            M
          </span>
          <video
            src="/herovid.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden="true"
            className="relative z-10 h-[470px] w-3/4 object-cover"
          />
        </div>
      </section>

      {/* Category Bar */}
      {categories.length > 0 && (
        <section className="grid grid-cols-3 md:grid-cols-5 bg-copper-light">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/shop?category=${cat.slug}`}
              className="py-3 md:py-3.5 text-center border-r border-b border-copper/15 hover:bg-copper/5 transition-colors"
            >
              <div className="text-sm font-medium uppercase tracking-wider text-charcoal-mid">
                {cat.name}
              </div>
              <div className="text-xs text-charcoal-soft mt-0.5">
                {cat._count.products}{" "}
                {cat._count.products === 1 ? "item" : "items"}
              </div>
            </Link>
          ))}
        </section>
      )}

      {/* Just Dropped */}
      {justDropped.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 md:px-6 py-8">
          <div className="flex justify-between items-baseline mb-4">
            <h2 className="font-display text-3xl md:text-4xl font-light italic">
              New Arrivals
            </h2>
            <Link
              href="/shop"
              className="text-sm uppercase tracking-wider text-copper underline"
            >
              See all &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {justDropped.map((product) => (
              <ProductCard
                key={product.id}
                productId={product.id}
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
                isWishlisted={wishlistSet.has(product.id)}
                ratingAverage={ratingMap.get(product.id)?.average}
                ratingCount={ratingMap.get(product.id)?.count}
              />
            ))}
          </div>
        </section>
      )}

      {/* Wholesale / Bales callout */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 pb-8">
        <Link
          href="/wholesale"
          className="group block bg-charcoal p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
          <div>
            <span className="text-xs tracking-widest uppercase text-copper">
              Wholesale
            </span>
            <h3 className="font-display text-3xl md:text-4xl font-light italic text-cream mt-1">
              Buying in bulk? Shop Bales
            </h3>
            <p className="text-sm text-charcoal-soft mt-1.5 max-w-md leading-relaxed">
              Premium UK ~55kg thrift bales — sorted, graded and ready to
              resell. For boutiques and resellers.
            </p>
          </div>
          <span className="inline-flex items-center gap-2 bg-copper text-white text-sm uppercase tracking-wider px-5 py-3 group-hover:bg-copper-dark transition-colors whitespace-nowrap">
            Shop Bales
            <ArrowRight size={16} />
          </span>
        </Link>
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
          <div className="w-full md:w-auto">
            <NewsletterForm source="homepage" />
          </div>
        </div>
      </section>
    </>
  );
}
