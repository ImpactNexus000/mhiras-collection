"use client";

import { RotateCw, Star, X } from "lucide-react";
import type { StagedImage } from "@/components/admin/bulk-image-staging";

interface StagedThumbProps {
  image: StagedImage;
  /** The first photo of a product — what shows on the shop card. */
  isPrimary: boolean;
  /** Only worth offering when the product has more than one photo. */
  canPromote: boolean;
  onRemove: () => void;
  onRetry: () => void;
  onPromote: () => void;
}

export function StagedThumb({
  image,
  isPrimary,
  canPromote,
  onRemove,
  onRetry,
  onPromote,
}: StagedThumbProps) {
  const failed = image.status === "error";

  return (
    <div
      className={`relative w-16 h-20 shrink-0 rounded overflow-hidden border-2 group ${
        failed
          ? "border-danger"
          : isPrimary
            ? "border-copper"
            : "border-border"
      }`}
      title={failed ? image.error : image.file.name}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- local object URL */}
      <img
        src={image.previewUrl}
        alt={image.file.name}
        className={`w-full h-full object-cover ${
          image.status === "done" ? "" : "opacity-60"
        }`}
      />

      {isPrimary && !failed && (
        <span className="absolute top-0 left-0 bg-copper text-white text-[9px] px-1 leading-4">
          Main
        </span>
      )}

      {image.status === "uploading" && (
        <div className="absolute inset-x-0 bottom-0 h-1 bg-white/40">
          <div
            className="h-full bg-copper transition-[width] duration-200"
            style={{ width: `${image.progress}%` }}
          />
        </div>
      )}

      {image.status === "pending" && (
        <span className="absolute inset-x-0 bottom-0 bg-charcoal/70 text-white text-[9px] text-center leading-4">
          Queued
        </span>
      )}

      {failed && (
        <button
          type="button"
          onClick={onRetry}
          aria-label={`Retry ${image.file.name}`}
          className="absolute inset-0 flex items-center justify-center bg-danger/70 text-white cursor-pointer"
        >
          <RotateCw size={14} />
        </button>
      )}

      {/* Hover controls — hidden until needed so the row stays calm. */}
      <div className="absolute top-0.5 right-0.5 flex gap-0.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
        {canPromote && !isPrimary && !failed && (
          <button
            type="button"
            onClick={onPromote}
            aria-label={`Make ${image.file.name} the main photo`}
            className="w-5 h-5 rounded-full bg-white/90 flex items-center justify-center hover:bg-copper hover:text-white cursor-pointer"
          >
            <Star size={10} />
          </button>
        )}
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${image.file.name}`}
          className="w-5 h-5 rounded-full bg-white/90 flex items-center justify-center hover:bg-danger hover:text-white cursor-pointer"
        >
          <X size={10} />
        </button>
      </div>
    </div>
  );
}
