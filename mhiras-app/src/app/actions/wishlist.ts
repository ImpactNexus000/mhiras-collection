"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getWishlist() {
  const session = await auth();
  if (!session?.user?.id) {
    return [];
  }

  const items = await db.wishlistItem.findMany({
    where: { userId: session.user.id },
    include: {
      product: {
        include: {
          category: true,
          images: {
            where: { isPrimary: true },
            take: 1,
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return items;
}

export async function toggleWishlist(productId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be signed in to use your wishlist." };
  }

  // Check if already in wishlist
  const existing = await db.wishlistItem.findUnique({
    where: {
      userId_productId: {
        userId: session.user.id,
        productId,
      },
    },
  });

  if (existing) {
    await db.wishlistItem.delete({
      where: { id: existing.id },
    });

    revalidatePath("/wishlist");
    return { success: true, added: false };
  }

  // Verify product exists
  const product = await db.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    return { error: "Product not found." };
  }

  await db.wishlistItem.create({
    data: {
      userId: session.user.id,
      productId,
    },
  });

  revalidatePath("/wishlist");
  return { success: true, added: true };
}

export async function removeFromWishlist(wishlistItemId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be signed in." };
  }

  const item = await db.wishlistItem.findUnique({
    where: { id: wishlistItemId },
  });

  if (!item || item.userId !== session.user.id) {
    return { error: "Wishlist item not found." };
  }

  await db.wishlistItem.delete({
    where: { id: wishlistItemId },
  });

  revalidatePath("/wishlist");
  return { success: true };
}

export async function isInWishlist(productId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return false;
  }

  const item = await db.wishlistItem.findUnique({
    where: {
      userId_productId: {
        userId: session.user.id,
        productId,
      },
    },
  });

  return !!item;
}
