"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

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

export async function addToCart(productId: string, quantity: number = 1) {
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

  // Check if item already in cart
  const existingItem = await db.cartItem.findUnique({
    where: {
      cartId_productId: {
        cartId: cart.id,
        productId,
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
      },
    });
  }

  revalidatePath("/cart");
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

  revalidatePath("/cart");
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

  revalidatePath("/cart");
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

  revalidatePath("/cart");
  return { success: true };
}
