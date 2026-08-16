import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCategories } from "@/lib/queries/products";
import { BulkUploadClient } from "@/components/admin/bulk-upload-client";
import type { BulkCategory } from "@/lib/bulk-upload";

export const metadata = {
  title: "Bulk Upload",
};

/**
 * `createProductsBulk` runs in this route's function and writes up to 60
 * products in one transaction. Vercel's default ceiling is 10s, which a full
 * batch on a cold start can brush against — 60s is the Hobby maximum and
 * costs nothing when the save takes two seconds, as it usually will.
 */
export const maxDuration = 60;

export default async function BulkUploadPage() {
  const categories = await getCategories();

  // productCount is what auto-numbering continues from, so "Sun Dress 07"
  // follows the six already in the category.
  const bulkCategories: BulkCategory[] = categories.map((category) => ({
    id: category.id,
    name: category.name,
    kind: category.kind,
    sizeOptions: category.sizeOptions,
    productCount: category._count.products,
  }));

  return (
    <>
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-1.5 text-sm text-charcoal-soft hover:text-charcoal mb-3"
      >
        <ArrowLeft size={14} aria-hidden="true" />
        Back to products
      </Link>

      <div className="mb-5">
        <h1 className="font-display text-3xl md:text-4xl font-light italic">
          Bulk Upload
        </h1>
        <p className="text-sm text-charcoal-soft mt-1">
          Add a whole drop at once — pick the photos, set the details for the
          batch, and save every product in one go.
        </p>
      </div>

      <BulkUploadClient categories={bulkCategories} />
    </>
  );
}
