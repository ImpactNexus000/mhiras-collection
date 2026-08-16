"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { Condition, ProductStatus } from "@/generated/prisma/client";
import { resolveUniqueSlugs } from "@/lib/slug";
import { SIZE_CHART } from "@/lib/size-guide";
import {
  MAX_BULK_ITEMS,
  MAX_IMAGES_PER_PRODUCT,
  type BulkCreateResult,
  type BulkIssue,
  type BulkProductInput,
} from "@/lib/bulk-upload";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  return session;
}

const VALID_SIZES = new Set(SIZE_CHART.map((row) => row.size));
const CONDITIONS = new Set<string>(Object.values(Condition));
const STATUSES = new Set<string>(Object.values(ProductStatus));

/** Images are rendered through next/image, which only allows this host. */
const IMAGE_HOST = "https://res.cloudinary.com/";

function isPositiveInt(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value > 0;
}

/**
 * Check one row. Returns the first problem found, or null if the row is good —
 * one message per row keeps the grid's error display readable.
 */
function validate(item: BulkProductInput): string | null {
  if (!item.name?.trim()) return "Needs a name.";
  if (item.name.trim().length > 120) return "Name is too long (max 120 characters).";

  if (!isPositiveInt(item.sellingPrice)) {
    return "Needs a selling price above ₦0.";
  }
  if (
    item.originalPrice !== null &&
    (!Number.isInteger(item.originalPrice) || item.originalPrice < 0)
  ) {
    return "Original price must be a whole number.";
  }

  if (!Number.isInteger(item.stock) || item.stock < 0) {
    return "Stock must be 0 or more.";
  }

  if (!CONDITIONS.has(item.condition)) return "Unknown condition.";
  if (!STATUSES.has(item.status)) return "Unknown status.";

  if (item.sizes.some((size) => !VALID_SIZES.has(size))) {
    return "Contains a size that isn't on the UK size chart.";
  }

  if (item.images.length === 0) return "Needs at least one photo.";
  if (item.images.length > MAX_IMAGES_PER_PRODUCT) {
    return `Too many photos (max ${MAX_IMAGES_PER_PRODUCT}).`;
  }
  if (item.images.some((img) => !img.url?.startsWith(IMAGE_HOST))) {
    return "A photo didn't finish uploading.";
  }

  return null;
}

/**
 * Create a whole batch of products in one category.
 *
 * All-or-nothing by design: rows are validated up front and written inside a
 * single transaction, so a half-finished batch can never leave the admin
 * guessing which garments made it in. Retrying after a failure is always safe.
 */
export async function createProductsBulk(
  categoryId: string,
  items: BulkProductInput[]
): Promise<BulkCreateResult> {
  await requireAdmin();

  if (!categoryId) return { error: "Pick a category first." };
  if (items.length === 0) return { error: "Add some photos first." };
  if (items.length > MAX_BULK_ITEMS) {
    return {
      error: `That's ${items.length} products — upload up to ${MAX_BULK_ITEMS} at a time.`,
    };
  }

  const category = await db.category.findUnique({
    where: { id: categoryId },
    select: { id: true },
  });
  if (!category) return { error: "That category no longer exists." };

  const issues: BulkIssue[] = [];
  items.forEach((item, index) => {
    const message = validate(item);
    if (message) {
      issues.push({ index, name: item.name?.trim() || `Item ${index + 1}`, message });
    }
  });
  if (issues.length > 0) return { issues };

  const slugs = await resolveUniqueSlugs(items.map((item) => item.name.trim()));

  try {
    await db.$transaction(
      async (tx) => {
        for (const [index, item] of items.entries()) {
          await tx.product.create({
            data: {
              name: item.name.trim(),
              slug: slugs[index],
              description: item.description?.trim() || null,
              categoryId,
              condition: item.condition,
              sellingPrice: item.sellingPrice,
              originalPrice: item.originalPrice,
              stock: item.stock,
              status: item.status,
              featured: item.featured,
              availableSizes: item.sizes,
              images: {
                create: item.images.map((img, i) => ({
                  url: img.url,
                  sortOrder: i,
                  isPrimary: i === 0,
                })),
              },
            },
          });
        }
      },
      // Sized for a full 60-product batch on a pooled connection.
      { timeout: 30_000, maxWait: 10_000 }
    );
  } catch (error) {
    // A concurrent upload can claim a slug between resolveUniqueSlugs() and
    // the insert. Nothing was written, so re-submitting resolves it.
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: string }).code === "P2002"
    ) {
      return {
        error:
          "Another product claimed one of these names while saving. Nothing was created — press Save again.",
      };
    }

    console.error("[bulk-products] batch create failed:", error);
    return { error: "Couldn't save the batch. Nothing was created — try again." };
  }

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/");

  return { created: items.length };
}
