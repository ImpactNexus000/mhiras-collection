import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export interface RatingSummary {
  count: number;
  average: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
}

const emptyDistribution = (): RatingSummary["distribution"] => ({
  1: 0,
  2: 0,
  3: 0,
  4: 0,
  5: 0,
});

/**
 * Fetch reviews for a product, newest first.
 */
export async function getProductReviews(productId: string) {
  return db.review.findMany({
    where: { productId },
    include: {
      user: { select: { id: true, firstName: true, lastName: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Aggregate rating summary for a product.
 */
export async function getProductRatingSummary(
  productId: string
): Promise<RatingSummary> {
  const rows = await db.review.groupBy({
    by: ["rating"],
    where: { productId },
    _count: { rating: true },
  });

  const distribution = emptyDistribution();
  let total = 0;
  let sum = 0;

  for (const row of rows) {
    const r = row.rating as 1 | 2 | 3 | 4 | 5;
    const c = row._count.rating;
    if (r >= 1 && r <= 5) {
      distribution[r] = c;
      total += c;
      sum += r * c;
    }
  }

  return {
    count: total,
    average: total === 0 ? 0 : sum / total,
    distribution,
  };
}

export interface RatingSnippet {
  average: number;
  count: number;
}

/**
 * Batched rating summary for a list of products. Returns a Map keyed by
 * productId — products with no reviews are absent from the map.
 */
export async function getRatingSummariesForProducts(
  productIds: string[]
): Promise<Map<string, RatingSnippet>> {
  const result = new Map<string, RatingSnippet>();
  if (productIds.length === 0) return result;

  const rows = await db.review.groupBy({
    by: ["productId", "rating"],
    where: { productId: { in: productIds } },
    _count: { rating: true },
  });

  // Aggregate sum + count per productId
  const totals = new Map<string, { sum: number; count: number }>();
  for (const row of rows) {
    const t = totals.get(row.productId) ?? { sum: 0, count: 0 };
    t.sum += row.rating * row._count.rating;
    t.count += row._count.rating;
    totals.set(row.productId, t);
  }

  for (const [productId, { sum, count }] of totals) {
    if (count > 0) {
      result.set(productId, { average: sum / count, count });
    }
  }

  return result;
}

export interface ReviewEligibility {
  signedIn: boolean;
  hasPurchased: boolean;
  existingReview: {
    id: string;
    rating: number;
    comment: string | null;
  } | null;
}

/**
 * Check whether the current user may leave (or edit) a review on this product.
 * Eligible if they have at least one DELIVERED order containing the product.
 */
export async function getReviewEligibility(
  productId: string
): Promise<ReviewEligibility> {
  const session = await auth();
  if (!session?.user?.id) {
    return { signedIn: false, hasPurchased: false, existingReview: null };
  }

  const [deliveredOrder, existingReview] = await Promise.all([
    db.orderItem.findFirst({
      where: {
        productId,
        order: { userId: session.user.id, status: "DELIVERED" },
      },
      select: { id: true },
    }),
    db.review.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId,
        },
      },
      select: { id: true, rating: true, comment: true },
    }),
  ]);

  return {
    signedIn: true,
    hasPurchased: !!deliveredOrder,
    existingReview,
  };
}

/**
 * Fetch the current user's reviews (for the account page).
 */
export async function getMyReviews() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return db.review.findMany({
    where: { userId: session.user.id },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          images: {
            where: { isPrimary: true },
            take: 1,
            select: { url: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}
