import type { Condition, ProductStatus } from "@/generated/prisma/client";

/**
 * Shared contract between the bulk-upload screen and `createProductsBulk`.
 * Lives outside the `"use server"` file because that module may only export
 * async functions — constants and types have to come from somewhere else.
 */

/**
 * Products per batch. Every row is one INSERT inside a single transaction, so
 * this is really a cap on how long that transaction holds a pooled Neon
 * connection. Bigger drops are fine — they just go up in two batches.
 */
export const MAX_BULK_ITEMS = 60;

/** Matches the per-product limit on the single-product form. */
export const MAX_IMAGES_PER_PRODUCT = 6;

/**
 * Photos that can be staged on the bulk screen at once. Higher than
 * MAX_BULK_ITEMS because grouping means several photos can collapse into one
 * product — this allows a full 60-product batch shot from three angles.
 */
export const MAX_BULK_IMAGES = MAX_BULK_ITEMS * 3;

export interface BulkProductImage {
  url: string;
  publicId: string;
}

export interface BulkProductInput {
  name: string;
  sellingPrice: number;
  originalPrice: number | null;
  /** UK sizes; empty means "offer the full range" (same as the single form). */
  sizes: string[];
  stock: number;
  condition: Condition;
  status: ProductStatus;
  description: string | null;
  featured: boolean;
  /** First image becomes the primary. */
  images: BulkProductImage[];
}

/** A row the server refused, keyed back to its position in the grid. */
export interface BulkIssue {
  index: number;
  name: string;
  message: string;
}

export interface BulkCreateResult {
  /** Batch-level failure — nothing was created. */
  error?: string;
  /** Per-row validation failures — nothing was created. */
  issues?: BulkIssue[];
  /** Number of products created. Only set on success. */
  created?: number;
}

/** What the bulk screen needs to know about a category. */
export interface BulkCategory {
  id: string;
  name: string;
  kind: "RETAIL" | "WHOLESALE";
  /** CSV of the sizes this category normally carries. */
  sizeOptions: string | null;
  /** Products already in the category — where auto-numbering picks up. */
  productCount: number;
}

/** "Dresses" → "Dress", "Gowns" → "Gown", "Tops" → "Top". */
function singularize(word: string): string {
  if (/(ss|sh|ch|x|z)es$/i.test(word)) return word.slice(0, -2);
  if (/ies$/i.test(word)) return `${word.slice(0, -3)}y`;
  if (/s$/i.test(word) && !/ss$/i.test(word)) return word.slice(0, -1);
  return word;
}

/**
 * Default product-name prefix for a category: "Sun Dresses" → "Sun Dress".
 * Only the last word is singularized, which is what category names need.
 */
export function categoryNamePrefix(categoryName: string): string {
  const words = categoryName.trim().split(/\s+/);
  if (words.length === 0) return categoryName;
  words[words.length - 1] = singularize(words[words.length - 1]);
  return words.join(" ");
}

/**
 * Auto-generated product name — "Sun Dress 07". Zero-padded to two digits to
 * match the naming the catalogue importer already used.
 */
export function autoProductName(prefix: string, number: number): string {
  return `${prefix} ${String(number).padStart(2, "0")}`.trim();
}
