"use client";

import { SIZE_CHART } from "@/lib/size-guide";
import type { BulkCategory } from "@/lib/bulk-upload";

/**
 * Everything on this panel applies to every product in the batch. Rows can
 * override name, price and sizes individually — the rest is batch-wide, which
 * is the whole point of uploading a drop at once.
 */
export interface BatchDefaults {
  categoryId: string;
  sellingPrice: string;
  originalPrice: string;
  condition: string;
  status: string;
  stock: string;
  sizes: string[];
  description: string;
  featured: boolean;
  namePrefix: string;
  startNumber: string;
}

interface BatchDefaultsPanelProps {
  categories: BulkCategory[];
  value: BatchDefaults;
  /** Retail categories sell by size; wholesale bales don't. */
  showSizes: boolean;
  onChange: (patch: Partial<BatchDefaults>) => void;
}

const labelClass =
  "block text-xs uppercase tracking-wider text-charcoal-soft mb-1.5";
const inputClass =
  "w-full border border-border px-3 py-2.5 text-sm rounded outline-none focus:border-copper";

export function BatchDefaultsPanel({
  categories,
  value,
  showSizes,
  onChange,
}: BatchDefaultsPanelProps) {
  function toggleSize(size: string) {
    onChange({
      sizes: value.sizes.includes(size)
        ? value.sizes.filter((s) => s !== size)
        : [...value.sizes, size],
    });
  }

  return (
    <div className="bg-white border border-border rounded-lg p-5 space-y-4">
      <div>
        <h2 className="font-display text-lg font-light italic">
          Details for this batch
        </h2>
        <p className="text-xs text-charcoal-soft mt-0.5">
          Applied to every product below. Change any single one in its own row.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="col-span-2 lg:col-span-1">
          <label className={labelClass} htmlFor="bulk-category">
            Category *
          </label>
          <select
            id="bulk-category"
            value={value.categoryId}
            onChange={(e) => onChange({ categoryId: e.target.value })}
            className={`${inputClass} bg-white`}
          >
            <option value="">Select category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass} htmlFor="bulk-price">
            Selling Price (NGN) *
          </label>
          <input
            id="bulk-price"
            type="number"
            min={0}
            value={value.sellingPrice}
            onChange={(e) => onChange({ sellingPrice: e.target.value })}
            className={inputClass}
            placeholder="e.g. 9000"
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="bulk-original-price">
            Original Price (NGN)
          </label>
          <input
            id="bulk-original-price"
            type="number"
            min={0}
            value={value.originalPrice}
            onChange={(e) => onChange({ originalPrice: e.target.value })}
            className={inputClass}
            placeholder="Optional"
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="bulk-condition">
            Condition
          </label>
          <select
            id="bulk-condition"
            value={value.condition}
            onChange={(e) => onChange({ condition: e.target.value })}
            className={`${inputClass} bg-white`}
          >
            <option value="LIKE_NEW">Like New</option>
            <option value="GOOD">Good</option>
            <option value="FAIR">Fair</option>
          </select>
        </div>

        <div>
          <label className={labelClass} htmlFor="bulk-status">
            Status
          </label>
          <select
            id="bulk-status"
            value={value.status}
            onChange={(e) => onChange({ status: e.target.value })}
            className={`${inputClass} bg-white`}
          >
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>

        <div>
          <label className={labelClass} htmlFor="bulk-stock">
            Stock per product
          </label>
          <input
            id="bulk-stock"
            type="number"
            min={0}
            value={value.stock}
            onChange={(e) => onChange({ stock: e.target.value })}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="bulk-name-prefix">
            Name prefix
          </label>
          <input
            id="bulk-name-prefix"
            type="text"
            value={value.namePrefix}
            onChange={(e) => onChange({ namePrefix: e.target.value })}
            className={inputClass}
            placeholder="e.g. Sun Dress"
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="bulk-start-number">
            Numbering starts at
          </label>
          <input
            id="bulk-start-number"
            type="number"
            min={1}
            value={value.startNumber}
            onChange={(e) => onChange({ startNumber: e.target.value })}
            className={inputClass}
          />
        </div>
      </div>

      {showSizes && (
        <div>
          <span className={labelClass}>Available sizes (UK)</span>
          <p className="text-xs text-charcoal-soft mb-2">
            Leave all unticked to offer the full UK range.
          </p>
          <div className="flex flex-wrap gap-2">
            {SIZE_CHART.map((row) => (
              <label
                key={row.size}
                className="inline-flex items-center gap-1.5 border border-border rounded px-2.5 py-1.5 text-sm cursor-pointer has-[:checked]:border-copper has-[:checked]:bg-copper/5"
              >
                <input
                  type="checkbox"
                  checked={value.sizes.includes(row.size)}
                  onChange={() => toggleSize(row.size)}
                  className="accent-copper"
                />
                {row.size}
              </label>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className={labelClass} htmlFor="bulk-description">
          Description
        </label>
        <textarea
          id="bulk-description"
          rows={2}
          value={value.description}
          onChange={(e) => onChange({ description: e.target.value })}
          className={`${inputClass} resize-none`}
          placeholder="Shared by every product in this batch — fabric, fit, condition notes..."
        />
      </div>

      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input
          type="checkbox"
          checked={value.featured}
          onChange={(e) => onChange({ featured: e.target.checked })}
          className="accent-copper"
        />
        Feature every product on the homepage
      </label>
    </div>
  );
}
