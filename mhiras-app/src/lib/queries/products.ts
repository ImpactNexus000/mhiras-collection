import { db } from "@/lib/db";
import { Condition, ProductStatus } from "@/generated/prisma/client";

export interface ProductFilters {
  category?: string;
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
  pageSize = 12
) {
  const where: Record<string, unknown> = {
    status: filters.status ?? ProductStatus.PUBLISHED,
  };

  if (filters.category) {
    where.category = { slug: filters.category };
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
    where.name = { contains: filters.search, mode: "insensitive" };
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
      orderBy: { createdAt: "desc" },
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
      category: { select: { name: true, slug: true } },
      images: { orderBy: { sortOrder: "asc" } },
      reviews: {
        include: {
          user: { select: { firstName: true, lastName: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
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
 * Get all categories with product counts.
 */
export async function getCategories() {
  return db.category.findMany({
    include: {
      _count: { select: { products: true } },
    },
    orderBy: { sortOrder: "asc" },
  });
}
