import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ProductCard } from "@/components/store/product-card";
import { AddToCartButton } from "@/components/store/add-to-cart-button";
import { WishlistButton } from "@/components/store/wishlist-button";
import { formatPrice } from "@/lib/utils";
import { getProductBySlug, getRelatedProducts } from "@/lib/queries/products";
import { ShieldCheck, RotateCcw, Truck } from "lucide-react";

const conditionLabel: Record<string, string> = {
  LIKE_NEW: "Like New",
  GOOD: "Good",
  FAIR: "Fair",
};

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) return { title: "Product Not Found" };

  return {
    title: product.name,
    description:
      product.description ?? `Shop ${product.name} at Mhiras Collection`,
  };
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const relatedProducts = await getRelatedProducts(
    product.categoryId,
    product.id
  );

  const discount =
    product.originalPrice && product.originalPrice > product.sellingPrice
      ? Math.round(
          ((product.originalPrice - product.sellingPrice) /
            product.originalPrice) *
            100
        )
      : null;

  const isSoldOut = product.stock === 0;
  const primaryImage = product.images.find((img) => img.isPrimary) ?? product.images[0];

  return (
    <>
      {/* Breadcrumb */}
      <div className="px-6 py-3 text-sm text-charcoal-soft border-b border-border">
        <Link href="/" className="hover:text-charcoal">
          Home
        </Link>
        {" / "}
        <Link href="/shop" className="hover:text-charcoal">
          Shop
        </Link>
        {" / "}
        <Link
          href={`/shop?category=${product.category.slug}`}
          className="hover:text-charcoal"
        >
          {product.category.name}
        </Link>
        {" / "}
        <span className="text-charcoal">{product.name}</span>
      </div>

      {/* Product detail grid */}
      <div className="grid md:grid-cols-2">
        {/* Gallery */}
        <div className="bg-cream-dark flex items-center justify-center min-h-[340px] md:min-h-[480px] relative">
          {primaryImage ? (
            <img
              src={primaryImage.url}
              alt={primaryImage.alt ?? product.name}
              className="max-h-[440px] object-contain"
            />
          ) : (
            <div className="w-40 h-56 bg-gradient-to-br from-gold to-copper-dark/50 opacity-60 rounded" />
          )}
          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {product.images.map((img, i) => (
                <div
                  key={img.id}
                  className={`w-12 h-16 bg-cream-dark border ${
                    i === 0 ? "border-copper" : "border-border"
                  } cursor-pointer overflow-hidden`}
                >
                  <img
                    src={img.url}
                    alt={img.alt ?? ""}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="p-6 md:p-8">
          <div className="text-xs uppercase tracking-widest text-charcoal-soft mb-1.5">
            Mhiras Collection
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-light leading-tight mb-3">
            {product.name}
          </h1>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-2xl md:text-3xl font-medium text-copper">
              {formatPrice(product.sellingPrice)}
            </span>
            {product.originalPrice && (
              <span className="text-base text-charcoal-soft line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
            {discount && (
              <span className="text-xs bg-success/10 text-success px-2 py-0.5">
                {discount}% off
              </span>
            )}
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider bg-copper-light text-copper-dark px-3 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-copper" />
              {conditionLabel[product.condition]}
            </span>
            {product.size && (
              <span className="text-xs bg-cream-dark px-3 py-1">
                Size {product.size}
              </span>
            )}
            <span className="text-xs bg-cream-dark px-3 py-1">
              {isSoldOut ? "Sold Out" : `${product.stock} Available`}
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

          {/* CTA buttons */}
          <div className="flex flex-col gap-3">
            <AddToCartButton productId={product.id} stock={product.stock} />
            <WishlistButton productId={product.id} />
          </div>

          {/* Description */}
          {product.description && (
            <div className="mt-6 p-5 bg-cream-dark rounded">
              <div className="text-xs uppercase tracking-wider text-charcoal-mid font-medium mb-2">
                Description
              </div>
              <p className="text-sm text-charcoal-soft leading-relaxed">
                {product.description}
              </p>
            </div>
          )}

          {/* Reviews */}
          {product.reviews.length > 0 && (
            <div className="mt-6">
              <h3 className="text-xs uppercase tracking-wider text-charcoal-mid font-medium mb-3">
                Reviews ({product.reviews.length})
              </h3>
              <div className="space-y-3">
                {product.reviews.map((review) => (
                  <div
                    key={review.id}
                    className="p-4 bg-cream-dark rounded text-sm"
                  >
                    <div className="flex justify-between mb-1">
                      <span className="font-medium">
                        {review.user.firstName} {review.user.lastName[0]}.
                      </span>
                      <span className="text-xs text-copper">
                        {"★".repeat(review.rating)}
                        {"☆".repeat(5 - review.rating)}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="text-charcoal-soft">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related products */}
      {relatedProducts.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 md:px-6 py-10">
          <div className="flex justify-between items-baseline mb-5">
            <h2 className="font-display text-3xl font-light italic">
              You May Also Like
            </h2>
            <Link
              href={`/shop?category=${product.category.slug}`}
              className="text-sm uppercase tracking-wider text-copper underline"
            >
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {relatedProducts.map((p) => (
              <ProductCard
                key={p.id}
                productId={p.id}
                slug={p.slug}
                name={p.name}
                category={p.category.name}
                size={p.size}
                price={p.sellingPrice}
                originalPrice={p.originalPrice}
                badge={conditionLabel[p.condition]}
                image={p.images[0]?.url ?? null}
                stock={p.stock}
                isSoldOut={p.stock === 0}
              />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
