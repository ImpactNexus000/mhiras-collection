import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

/**
 * Get the set of product IDs the current user has wishlisted.
 * Returns an empty Set for signed-out users or when the cart is empty.
 * Use alongside product queries to avoid N+1 `isInWishlist` round-trips
 * from each <WishlistButton> on a page.
 */
export async function getWishlistSet(): Promise<Set<string>> {
  const session = await auth();
  if (!session?.user?.id) {
    return new Set();
  }

  const items = await db.wishlistItem.findMany({
    where: { userId: session.user.id },
    select: { productId: true },
  });

  return new Set(items.map((i) => i.productId));
}
