import { Skeleton } from "@/components/ui/skeleton";

// Loading state for the product detail page.
export default function Loading() {
  return (
    <div>
      {/* Breadcrumb */}
      <div className="border-b border-border px-6 py-3">
        <Skeleton className="h-3 w-64" />
      </div>

      {/* Product detail grid */}
      <div className="grid md:grid-cols-[1.25fr_1fr]">
        {/* Gallery */}
        <Skeleton className="h-[420px] rounded-none md:h-[560px]" />

        {/* Info */}
        <div className="space-y-4 p-6 md:p-8">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-9 w-3/4" />
          <Skeleton className="h-7 w-36" />
          <Skeleton className="h-px w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-2/3" />
          <div className="space-y-3 pt-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
