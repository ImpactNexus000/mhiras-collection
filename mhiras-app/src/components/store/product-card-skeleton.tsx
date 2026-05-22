import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

/** Loading placeholder mirroring the layout of <ProductCard />. */
export function ProductCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded border border-border bg-white",
        className
      )}
    >
      {/* Image */}
      <Skeleton className="h-48 rounded-none md:h-60" />

      {/* Info */}
      <div className="space-y-2 p-4">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-5 w-1/4" />
      </div>

      {/* Action */}
      <div className="px-4 pb-4">
        <Skeleton className="h-9 w-full" />
      </div>
    </div>
  );
}
