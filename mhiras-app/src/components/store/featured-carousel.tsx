"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ProductCard,
  type ProductCardProps,
} from "@/components/store/product-card";

const AUTOPLAY_MS = 4000;

/**
 * Auto-advancing carousel for the homepage Featured row. Scrolls itself every
 * few seconds, pauses on hover/focus/touch, and wraps around. Built on native
 * scroll-snap so the per-view count is purely responsive (CSS widths) and
 * swipe works on mobile without extra logic.
 */
export function FeaturedCarousel({ items }: { items: ProductCardProps[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const paused = useRef(false);
  const [index, setIndex] = useState(0);
  const count = items.length;

  const scrollTo = (i: number) => {
    const track = trackRef.current;
    if (!track) return;
    const next = ((i % count) + count) % count;
    const child = track.children[next] as HTMLElement | undefined;
    if (child) {
      track.scrollTo({ left: child.offsetLeft, behavior: "smooth" });
      setIndex(next);
    }
  };

  useEffect(() => {
    if (count <= 1) return;
    const id = setInterval(() => {
      if (paused.current) return;
      setIndex((prev) => {
        const next = (prev + 1) % count;
        const track = trackRef.current;
        const child = track?.children[next] as HTMLElement | undefined;
        if (track && child) {
          track.scrollTo({ left: child.offsetLeft, behavior: "smooth" });
        }
        return next;
      });
    }, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [count]);

  const pause = () => {
    paused.current = true;
  };
  const resume = () => {
    paused.current = false;
  };

  return (
    <div
      className="relative"
      onMouseEnter={pause}
      onMouseLeave={resume}
      onFocusCapture={pause}
      onBlurCapture={resume}
      onTouchStart={pause}
      onTouchEnd={resume}
    >
      <div
        ref={trackRef}
        className="relative flex gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar"
      >
        {items.map((item) => (
          <div
            key={item.productId ?? item.slug}
            className="snap-start shrink-0 w-[80%] sm:w-[48%] lg:w-[32%]"
          >
            <ProductCard {...item} />
          </div>
        ))}
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={() => scrollTo(index - 1)}
            aria-label="Previous featured items"
            className="absolute left-0 lg:-left-4 top-[38%] -translate-y-1/2 z-10 grid place-items-center w-9 h-9 rounded-full bg-white border border-border shadow-md text-charcoal hover:text-copper transition-colors cursor-pointer"
          >
            <ChevronLeft size={18} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => scrollTo(index + 1)}
            aria-label="Next featured items"
            className="absolute right-0 lg:-right-4 top-[38%] -translate-y-1/2 z-10 grid place-items-center w-9 h-9 rounded-full bg-white border border-border shadow-md text-charcoal hover:text-copper transition-colors cursor-pointer"
          >
            <ChevronRight size={18} aria-hidden="true" />
          </button>

          <div className="flex justify-center gap-2 mt-4">
            {items.map((item, i) => (
              <button
                key={item.productId ?? item.slug}
                type="button"
                onClick={() => scrollTo(i)}
                aria-label={`Go to featured item ${i + 1}`}
                className={cn(
                  "h-1.5 rounded-full transition-all cursor-pointer",
                  i === index ? "w-6 bg-copper" : "w-1.5 bg-charcoal-soft/30"
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
