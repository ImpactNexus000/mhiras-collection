import { cn } from "@/lib/utils";

/** A pulsing placeholder block used to build loading skeletons. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse rounded bg-cream-dark", className)}
    />
  );
}
