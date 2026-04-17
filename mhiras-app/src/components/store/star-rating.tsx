"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number;
  size?: number;
  className?: string;
}

/**
 * Read-only star display. Supports fractional averages via a clipped half star.
 */
export function StarRating({ value, size = 14, className }: StarRatingProps) {
  const clamped = Math.max(0, Math.min(5, value));
  return (
    <div className={cn("inline-flex items-center gap-0.5", className)}>
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = Math.max(0, Math.min(1, clamped - (i - 1)));
        return (
          <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
            <Star
              size={size}
              className="absolute inset-0 text-copper/30"
              strokeWidth={1.5}
            />
            <span
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${fill * 100}%` }}
            >
              <Star
                size={size}
                className="text-copper fill-copper"
                strokeWidth={1.5}
              />
            </span>
          </span>
        );
      })}
    </div>
  );
}

interface StarRatingInputProps {
  value: number;
  onChange: (rating: number) => void;
  size?: number;
  disabled?: boolean;
}

/**
 * Interactive star picker — 1 to 5.
 */
export function StarRatingInput({
  value,
  onChange,
  size = 22,
  disabled = false,
}: StarRatingInputProps) {
  return (
    <div className="inline-flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = i <= value;
        return (
          <button
            key={i}
            type="button"
            disabled={disabled}
            onClick={() => onChange(i)}
            className={cn(
              "cursor-pointer disabled:cursor-not-allowed transition-transform",
              !disabled && "hover:scale-110"
            )}
            aria-label={`${i} star${i === 1 ? "" : "s"}`}
          >
            <Star
              size={size}
              strokeWidth={1.5}
              className={cn(
                filled ? "text-copper fill-copper" : "text-copper/30"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
