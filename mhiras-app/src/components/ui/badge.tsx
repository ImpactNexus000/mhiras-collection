import { cn } from "@/lib/utils";

type BadgeVariant =
  | "new"
  | "hot"
  | "low-stock"
  | "sold-out"
  | "like-new"
  | "good"
  | "fair";

interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  new: "bg-copper text-white",
  hot: "bg-copper text-white",
  "low-stock": "bg-warning/15 text-warning",
  "sold-out": "bg-danger/15 text-danger",
  "like-new": "bg-copper-light text-copper-dark",
  good: "bg-cream-dark text-charcoal-mid",
  fair: "bg-cream-dark text-charcoal-soft",
};

export function Badge({ variant, children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] uppercase tracking-wider font-medium",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
