"use client";

import { useState } from "react";
import { Layers, Pencil, Trash2 } from "lucide-react";
import { SIZE_CHART } from "@/lib/size-guide";
import { StagedThumb } from "@/components/admin/bulk-staged-thumb";
import type { StagedImage } from "@/components/admin/bulk-image-staging";

/** Per-product edits. An absent field means "use the batch default". */
export interface RowOverride {
  name?: string;
  price?: string;
  sizes?: string[];
}

interface BulkProductRowProps {
  images: StagedImage[];
  /** The name this product gets if the admin doesn't type one. */
  autoName: string;
  batchPrice: string;
  batchSizes: string[];
  showSizes: boolean;
  override: RowOverride;
  /** Why this product can't be saved yet, shown once a save is attempted. */
  issue?: string;
  selected: boolean;
  onSelect: (selected: boolean) => void;
  onChange: (patch: RowOverride) => void;
  onUngroup: () => void;
  onRemove: () => void;
  onRemoveImage: (imageId: string) => void;
  onRetryImage: (imageId: string) => void;
  onPromoteImage: (imageId: string) => void;
}

const inputClass =
  "w-full border border-border px-2.5 py-2 text-sm rounded outline-none focus:border-copper";

export function BulkProductRow({
  images,
  autoName,
  batchPrice,
  batchSizes,
  showSizes,
  override,
  issue,
  selected,
  onSelect,
  onChange,
  onUngroup,
  onRemove,
  onRemoveImage,
  onRetryImage,
  onPromoteImage,
}: BulkProductRowProps) {
  const [editingSizes, setEditingSizes] = useState(false);
  const grouped = images.length > 1;
  const sizes = override.sizes ?? batchSizes;
  const customSizes = override.sizes !== undefined;

  return (
    <div
      className={`bg-white border rounded-lg p-3 flex flex-wrap md:flex-nowrap items-start gap-3 ${
        issue
          ? "border-danger"
          : selected
            ? "border-copper ring-1 ring-copper/30"
            : "border-border"
      }`}
    >
      <label className="flex items-center pt-6 cursor-pointer">
        <input
          type="checkbox"
          checked={selected}
          onChange={(e) => onSelect(e.target.checked)}
          className="accent-copper"
          aria-label={`Select ${override.name?.trim() || autoName}`}
        />
      </label>

      <div className="flex gap-1.5">
        {images.map((image, i) => (
          <StagedThumb
            key={image.id}
            image={image}
            isPrimary={i === 0}
            canPromote={grouped}
            onRemove={() => onRemoveImage(image.id)}
            onRetry={() => onRetryImage(image.id)}
            onPromote={() => onPromoteImage(image.id)}
          />
        ))}
      </div>

      <div className="flex-1 min-w-50 grid gap-2 sm:grid-cols-[minmax(0,1fr)_120px]">
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-charcoal-soft mb-1">
            Name
          </label>
          <input
            type="text"
            value={override.name ?? ""}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder={autoName}
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-wider text-charcoal-soft mb-1">
            Price (NGN)
          </label>
          <input
            type="number"
            min={0}
            value={override.price ?? ""}
            onChange={(e) => onChange({ price: e.target.value })}
            placeholder={batchPrice || "—"}
            className={inputClass}
          />
        </div>

        {showSizes && (
          <div className="sm:col-span-2">
            <label className="block text-[10px] uppercase tracking-wider text-charcoal-soft mb-1">
              Sizes (UK)
              {customSizes && (
                <span className="ml-1.5 text-copper">custom</span>
              )}
            </label>
            <button
              type="button"
              onClick={() => setEditingSizes((open) => !open)}
              aria-expanded={editingSizes}
              aria-label={`Edit sizes for ${override.name?.trim() || autoName}`}
              className={`${inputClass} bg-white text-left flex items-center justify-between gap-2 cursor-pointer`}
            >
              <span className={sizes.length > 0 ? "" : "text-charcoal-soft"}>
                {sizes.length > 0 ? sizes.join(", ") : "All UK sizes"}
              </span>
              <Pencil size={12} className="shrink-0 text-charcoal-soft" />
            </button>

            {editingSizes && (
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                {SIZE_CHART.map((row) => {
                  const on = sizes.includes(row.size);
                  return (
                    <button
                      key={row.size}
                      type="button"
                      onClick={() =>
                        onChange({
                          sizes: on
                            ? sizes.filter((s) => s !== row.size)
                            : [...sizes, row.size],
                        })
                      }
                      aria-pressed={on}
                      className={`border rounded px-2 py-1 text-xs cursor-pointer ${
                        on
                          ? "border-copper bg-copper/5 text-charcoal"
                          : "border-border text-charcoal-soft"
                      }`}
                    >
                      {row.size}
                    </button>
                  );
                })}
                {customSizes && (
                  <button
                    type="button"
                    onClick={() => onChange({ sizes: undefined })}
                    className="text-xs text-copper hover:underline cursor-pointer ml-1"
                  >
                    Use batch sizes
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {issue && (
          <p className="sm:col-span-2 text-xs text-danger" role="alert">
            {issue}
          </p>
        )}
      </div>

      <div className="flex items-center gap-1 pt-5">
        {grouped && (
          <button
            type="button"
            onClick={onUngroup}
            title="Split back into one product per photo"
            className="flex items-center gap-1 text-xs text-charcoal-soft hover:text-charcoal border border-border rounded px-2 py-1.5 cursor-pointer"
          >
            <Layers size={12} />
            Ungroup
          </button>
        )}
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${override.name?.trim() || autoName}`}
          className="w-7 h-7 flex items-center justify-center rounded text-charcoal-soft hover:text-danger hover:bg-danger/10 cursor-pointer"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
