import { db } from "@/lib/db";
import { CategoryKind, Condition, ProductStatus } from "@/generated/prisma/client";

export interface ProductFilters {
  category?: string;
  kind?: CategoryKind;
  condition?: Condition[];
  minPrice?: number;
  maxPrice?: number;
  size?: string;
  search?: string;
  featured?: boolean;
  status?: ProductStatus;
}

/**
 * Get a paginated list of published products with optional filters.
 */
export async function getProducts(
  filters: ProductFilters = {},
  page = 1,
  pageSize = 12,
  sort: { field: string; direction: "asc" | "desc" } = { field: "createdAt", direction: "desc" }
) {
  const where: Record<string, unknown> = {
    status: filters.status ?? ProductStatus.PUBLISHED,
  };

  if (filters.category || filters.kind) {
    where.category = {
      ...(filters.category ? { slug: filters.category } : {}),
      ...(filters.kind ? { kind: filters.kind } : {}),
    };
  }

  if (filters.condition && filters.condition.length > 0) {
    where.condition = { in: filters.condition };
  }

  if (filters.minPrice || filters.maxPrice) {
    where.sellingPrice = {
      ...(filters.minPrice ? { gte: filters.minPrice } : {}),
      ...(filters.maxPrice ? { lte: filters.maxPrice } : {}),
    };
  }

  if (filters.size) {
    where.size = filters.size;
  }

  if (filters.search) {
    // Tokenize the query — every word must appear somewhere in
    // name / description / category name. Each token gets its own OR
    // group, and the AND across tokens narrows the result.
    // "white dress" matches a product where "white" hits the name and
    // "dress" hits the category, not just "white dress" verbatim.
    const tokens = filters.search
      .trim()
      .split(/\s+/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    if (tokens.length > 0) {
      where.AND = tokens.map((token) => ({
        OR: [
          { name: { contains: token, mode: "insensitive" } },
          { description: { contains: token, mode: "insensitive" } },
          {
            category: {
              name: { contains: token, mode: "insensitive" },
            },
          },
        ],
      }));
    }
  }

  if (filters.featured) {
    where.featured = true;
  }

  const [products, total] = await Promise.all([
    db.product.findMany({
      where,
      include: {
        category: { select: { name: true, slug: true } },
        images: {
          where: { isPrimary: true },
          take: 1,
          select: { url: true, alt: true },
        },
      },
      orderBy: { [sort.field]: sort.direction },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.product.count({ where }),
  ]);

  return {
    products,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

/**
 * Get a single product by its slug, including all images and related products.
 */
export async function getProductBySlug(slug: string) {
  const product = await db.product.findUnique({
    where: { slug },
    include: {
      category: { select: { name: true, slug: true, kind: true } },
      images: { orderBy: { sortOrder: "asc" } },
    },
  });

  return product;
}

/**
 * Get related products (same category, excluding the current product).
 */
export async function getRelatedProducts(
  categoryId: string,
  excludeProductId: string,
  limit = 3
) {
  return db.product.findMany({
    where: {
      categoryId,
      id: { not: excludeProductId },
      status: ProductStatus.PUBLISHED,
    },
    include: {
      category: { select: { name: true, slug: true } },
      images: {
        where: { isPrimary: true },
        take: 1,
        select: { url: true, alt: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

/**
 * Get categories with product counts, optionally filtered by kind
 * (RETAIL for the main shop, WHOLESALE for the bales section).
 */
export async function getCategories(kind?: CategoryKind) {
  return db.category.findMany({
    where: kind ? { kind } : undefined,
    include: {
      _count: { select: { products: true } },
    },
    orderBy: { sortOrder: "asc" },
  });
}
