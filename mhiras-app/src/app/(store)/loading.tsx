import { Skeleton } from "@/components/ui/skeleton";
import { ProductCardSkeleton } from "@/components/store/product-card-skeleton";

// Default loading state for the storefront — covers the home, shop,
// wholesale, collections and search routes, which all show product grids.
export default function Loading() {
  return (
    <div>
      {/* Page header */}
      <div className="flex flex-col items-center gap-3 bg-charcoal px-6 py-8">
        <Skeleton className="h-8 w-48 bg-charcoal-mid" />
        <Skeleton className="h-3 w-64 bg-charcoal-mid" />
      </div>

      {/* Product grid */}
      <div className="grid grid-cols-2 gap-px bg-border md:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <ProductCardSkeleton key={i} className="rounded-none border-0" />
        ))}
      </div>
    </div>
  );
}
