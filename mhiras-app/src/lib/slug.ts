import { db } from "@/lib/db";

/** Lowercase, hyphenate, and strip everything that isn't a-z0-9. */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Turn a list of product names into slugs unique both against the products
 * already in the DB and against each other.
 *
 * Bulk uploads routinely carry near-identical names ("Sun Dress 12", "Sun
 * Dress 12"), and the single-product fallback — append `Date.now()` — collides
 * when several rows are created inside the same millisecond. Numbering
 * duplicates is both collision-free and readable.
 */
export async function resolveUniqueSlugs(names: string[]): Promise<string[]> {
  if (names.length === 0) return [];

  const bases = names.map((name) => slugify(name) || "product");

  // One query for the whole batch. `startsWith` over-fetches slightly (base
  // "dress" also matches "dress-shirt") — harmless, it only grows the set of
  // names we avoid.
  const existing = await db.product.findMany({
    where: {
      OR: [...new Set(bases)].map((base) => ({ slug: { startsWith: base } })),
    },
    select: { slug: true },
  });

  const taken = new Set(existing.map((p) => p.slug));

  return bases.map((base) => {
    let slug = base;
    let n = 2;
    while (taken.has(slug)) slug = `${base}-${n++}`;
    taken.add(slug);
    return slug;
  });
}
