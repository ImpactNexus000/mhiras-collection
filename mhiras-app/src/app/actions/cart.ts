"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function getCart() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  const cart = await db.cart.findUnique({
    where: { userId: session.user.id },
    include: {
      items: {
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
        orderBy: { id: "asc" },
      },
    },
  });

  return cart;
}

export async function addToCart(
  productId: string,
  quantity: number = 1,
  size: string = ""
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be signed in to add items to your cart." };
  }

  // Verify product exists and has stock
  const product = await db.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    return { error: "Product not found." };
  }

  if (product.stock < quantity) {
    return { error: `Only ${product.stock} left in stock.` };
  }

  // Find or create the user's cart
  const cart = await db.cart.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id },
    update: {},
  });

  // Check if the same product + size is already in cart
  const existingItem = await db.cartItem.findUnique({
    where: {
      cartId_productId_size: {
        cartId: cart.id,
        productId,
        size,
      },
    },
  });

  if (existingItem) {
    const newQuantity = existingItem.quantity + quantity;
    if (newQuantity > product.stock) {
      return {
        error: `Cannot add more. You already have ${existingItem.quantity} in your cart and only ${product.stock} are available.`,
      };
    }

    await db.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: newQuantity },
    });
  } else {
    await db.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity,
        size,
      },
    });
  }

  return { success: true };
}

export async function updateCartItemQuantity(
  cartItemId: string,
  quantity: number
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be signed in." };
  }

  if (quantity < 1) {
    return { error: "Quantity must be at least 1." };
  }

  // Verify the cart item belongs to the user
  const cartItem = await db.cartItem.findUnique({
    where: { id: cartItemId },
    include: { cart: true, product: true },
  });

  if (!cartItem || cartItem.cart.userId !== session.user.id) {
    return { error: "Cart item not found." };
  }

  if (quantity > cartItem.product.stock) {
    return { error: `Only ${cartItem.product.stock} available.` };
  }

  await db.cartItem.update({
    where: { id: cartItemId },
    data: { quantity },
  });

  return { success: true };
}

export async function removeFromCart(cartItemId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be signed in." };
  }

  // Verify the cart item belongs to the user
  const cartItem = await db.cartItem.findUnique({
    where: { id: cartItemId },
    include: { cart: true },
  });

  if (!cartItem || cartItem.cart.userId !== session.user.id) {
    return { error: "Cart item not found." };
  }

  await db.cartItem.delete({
    where: { id: cartItemId },
  });

  return { success: true };
}

export async function clearCart() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be signed in." };
  }

  const cart = await db.cart.findUnique({
    where: { userId: session.user.id },
  });

  if (!cart) {
    return { success: true };
  }

  await db.cartItem.deleteMany({
    where: { cartId: cart.id },
  });

  return { success: true };
}

/**
 * Fetch the minimal product info the cart UI needs to render a list of
 * guest-cart entries (which only store productId + quantity + size in
 * localStorage). Anything with status !== PUBLISHED or stock === 0 is
 * excluded so dead items quietly drop out of the guest cart on next load.
 */
export async function getProductsForCart(productIds: string[]) {
  if (productIds.length === 0) return [];

  const products = await db.product.findMany({
    where: { id: { in: productIds }, status: "PUBLISHED" },
    include: {
      category: { select: { name: true } },
      images: {
        where: { isPrimary: true },
        take: 1,
        select: { url: true },
      },
    },
  });

  return products.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    category: p.category.name,
    size: p.size,
    condition: p.condition,
    sellingPrice: p.sellingPrice,
    originalPrice: p.originalPrice,
    imageUrl: p.images[0]?.url ?? null,
    stock: p.stock,
    availableSizes: p.availableSizes,
  }));
}

interface GuestCartEntry {
  productId: string;
  quantity: number;
  size: string;
}

/**
 * Merge a guest's localStorage cart into the user's DB cart on signin.
 * Dedupes by [productId, size] (cart unique key) and clamps each line to
 * available stock. Silently ignores unknown / unpublished products and
 * non-positive quantities. Returns a per-line summary so the UI can show
 * "we capped your cart" feedback if needed.
 */
export async function mergeGuestCart(entries: GuestCartEntry[]) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be signed in." };
  }
  if (!Array.isArray(entries) || entries.length === 0) {
    return { success: true, merged: 0, skipped: 0 };
  }

  const userId = session.user.id;

  // Collapse duplicates client-side first — same productId+size submitted
  // twice should add together, not race against the upsert.
  const collapsed = new Map<string, GuestCartEntry>();
  for (const entry of entries) {
    if (
      !entry?.productId ||
      typeof entry.quantity !== "number" ||
      entry.quantity < 1
    )
      continue;
    const size = entry.size ?? "";
    const key = `${entry.productId}::${size}`;
    const prev = collapsed.get(key);
    collapsed.set(key, {
      productId: entry.productId,
      quantity: (prev?.quantity ?? 0) + entry.quantity,
      size,
    });
  }

  const productIds = Array.from(
    new Set(Array.from(collapsed.values()).map((e) => e.productId))
  );
  const products = await db.product.findMany({
    where: { id: { in: productIds }, status: "PUBLISHED" },
    select: { id: true, stock: true },
  });
  const stockById = new Map(products.map((p) => [p.id, p.stock]));

  const cart = await db.cart.upsert({
    where: { userId },
    create: { userId },
    update: {},
  });

  let merged = 0;
  let skipped = 0;

  for (const entry of collapsed.values()) {
    const stock = stockById.get(entry.productId);
    if (stock === undefined || stock <= 0) {
      skipped++;
      continue;
    }

    const existing = await db.cartItem.findUnique({
      where: {
        cartId_productId_size: {
          cartId: cart.id,
          productId: entry.productId,
          size: entry.size,
        },
      },
    });

    const desired = (existing?.quantity ?? 0) + entry.quantity;
    const finalQty = Math.min(desired, stock);
    if (finalQty <= 0) {
      skipped++;
      continue;
    }

    if (existing) {
      if (finalQty !== existing.quantity) {
        await db.cartItem.update({
          where: { id: existing.id },
          data: { quantity: finalQty },
        });
      }
    } else {
      await db.cartItem.create({
        data: {
          cartId: cart.id,
          productId: entry.productId,
          quantity: finalQty,
          size: entry.size,
        },
      });
    }
    merged++;
  }

  return { success: true, merged, skipped };
}
