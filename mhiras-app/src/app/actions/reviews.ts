"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const MAX_COMMENT_LENGTH = 1000;

function parseReviewInput(formData: FormData):
  | { rating: number; comment: string | null }
  | { error: string } {
  const ratingRaw = formData.get("rating");
  const commentRaw = formData.get("comment");

  const rating =
    typeof ratingRaw === "string" ? parseInt(ratingRaw, 10) : NaN;
  if (isNaN(rating) || rating < 1 || rating > 5) {
    return { error: "Rating must be between 1 and 5." };
  }

  const comment =
    typeof commentRaw === "string" ? commentRaw.trim() : "";
  if (comment.length > MAX_COMMENT_LENGTH) {
    return { error: `Comment must be ${MAX_COMMENT_LENGTH} characters or fewer.` };
  }

  return { rating, comment: comment || null };
}

async function getProductSlug(productId: string): Promise<string | null> {
  const product = await db.product.findUnique({
    where: { id: productId },
    select: { slug: true },
  });
  return product?.slug ?? null;
}

export async function createReview(productId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Please sign in to leave a review." };
  }
  const userId = session.user.id;

  const parsed = parseReviewInput(formData);
  if ("error" in parsed) return parsed;

  // Eligibility: must have a DELIVERED order for this product
  const purchased = await db.orderItem.findFirst({
    where: {
      productId,
      order: { userId, status: "DELIVERED" },
    },
    select: { id: true },
  });
  if (!purchased) {
    return {
      error: "You can only review products from a delivered order.",
    };
  }

  // One review per (user, product) — upsert so re-submits edit
  await db.review.upsert({
    where: { userId_productId: { userId, productId } },
    create: {
      userId,
      productId,
      rating: parsed.rating,
      comment: parsed.comment,
    },
    update: {
      rating: parsed.rating,
      comment: parsed.comment,
    },
  });

  const slug = await getProductSlug(productId);
  if (slug) revalidatePath(`/shop/${slug}`);
  revalidatePath("/account");

  return { success: true };
}

export async function updateReview(reviewId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Please sign in to edit this review." };
  }

  const parsed = parseReviewInput(formData);
  if ("error" in parsed) return parsed;

  const review = await db.review.findUnique({
    where: { id: reviewId },
    select: { userId: true, productId: true },
  });
  if (!review) return { error: "Review not found." };
  if (review.userId !== session.user.id) {
    return { error: "You can only edit your own review." };
  }

  await db.review.update({
    where: { id: reviewId },
    data: { rating: parsed.rating, comment: parsed.comment },
  });

  const slug = await getProductSlug(review.productId);
  if (slug) revalidatePath(`/shop/${slug}`);
  revalidatePath("/account");

  return { success: true };
}

export async function deleteReview(reviewId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Please sign in." };
  }

  const review = await db.review.findUnique({
    where: { id: reviewId },
    select: { userId: true, productId: true },
  });
  if (!review) return { error: "Review not found." };
  if (review.userId !== session.user.id) {
    return { error: "You can only delete your own review." };
  }

  await db.review.delete({ where: { id: reviewId } });

  const slug = await getProductSlug(review.productId);
  if (slug) revalidatePath(`/shop/${slug}`);
  revalidatePath("/account");

  return { success: true };
}
