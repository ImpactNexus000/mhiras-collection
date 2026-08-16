"use client";

import { useState } from "react";
import Image from "next/image";

interface GalleryImage {
  id: string;
  url: string;
  alt: string | null;
}

interface ProductGalleryProps {
  images: GalleryImage[];
  productName: string;
}

/**
 * Product photos with clickable thumbnails. Images arrive in sortOrder, so the
 * primary is already first — that's what shows until the customer picks
 * another angle.
 */
export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return (
      <div className="bg-cream-dark flex items-center justify-center h-[420px] md:h-[560px]">
        <div
          aria-hidden="true"
          className="w-40 h-56 bg-gradient-to-br from-gold to-copper-dark/50 opacity-60 rounded"
        />
      </div>
    );
  }

  const current = images[active] ?? images[0];

  return (
    <div className="bg-cream-dark flex items-center justify-center h-[420px] md:h-[560px] relative">
      <Image
        key={current.id}
        src={current.url}
        alt={current.alt ?? productName}
        fill
        sizes="(min-width: 768px) 55vw, 100vw"
        priority
        className="object-contain p-3"
      />

      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((image, i) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`View photo ${i + 1} of ${images.length}`}
              aria-current={i === active}
              className={`relative w-12 h-16 bg-cream-dark border overflow-hidden cursor-pointer transition-colors ${
                i === active
                  ? "border-copper"
                  : "border-border hover:border-charcoal-soft"
              }`}
            >
              <Image src={image.url} alt="" fill sizes="48px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
