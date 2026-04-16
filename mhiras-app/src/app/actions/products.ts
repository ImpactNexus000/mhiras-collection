"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { Condition, ProductStatus } from "@/generated/prisma/client";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function createProduct(formData: FormData) {
  await requireAdmin();

  const name = formData.get("name") as string;
  const description = (formData.get("description") as string) || null;
  const categoryId = formData.get("categoryId") as string;
  const size = (formData.get("size") as string) || null;
  const condition = (formData.get("condition") as string) as Condition;
  const sellingPrice = parseInt(formData.get("sellingPrice") as string, 10);
  const originalPriceRaw = formData.get("originalPrice") as string;
  const originalPrice = originalPriceRaw ? parseInt(originalPriceRaw, 10) : null;
  const stock = parseInt(formData.get("stock") as string, 10) || 1;
  const status = (formData.get("status") as string) as ProductStatus;
  const featured = formData.get("featured") === "on";

  if (!name || !categoryId || !sellingPrice) {
    return { error: "Name, category, and selling price are required." };
  }

  // Generate unique slug
  let slug = slugify(name);
  const existing = await db.product.findUnique({ where: { slug } });
  if (existing) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }

  const product = await db.product.create({
    data: {
      name,
      slug,
      description,
      categoryId,
      size,
      condition: condition || "GOOD",
      sellingPrice,
      originalPrice,
      stock,
      status: status || "DRAFT",
      featured,
    },
  });

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  return { success: true, productId: product.id };
}

export async function updateProduct(productId: string, formData: FormData) {
  await requireAdmin();

  const name = formData.get("name") as string;
  const description = (formData.get("description") as string) || null;
  const categoryId = formData.get("categoryId") as string;
  const size = (formData.get("size") as string) || null;
  const condition = (formData.get("condition") as string) as Condition;
  const sellingPrice = parseInt(formData.get("sellingPrice") as string, 10);
  const originalPriceRaw = formData.get("originalPrice") as string;
  const originalPrice = originalPriceRaw ? parseInt(originalPriceRaw, 10) : null;
  const stock = parseInt(formData.get("stock") as string, 10);
  const status = (formData.get("status") as string) as ProductStatus;
  const featured = formData.get("featured") === "on";

  if (!name || !categoryId || !sellingPrice) {
    return { error: "Name, category, and selling price are required." };
  }

  const product = await db.product.findUnique({ where: { id: productId } });
  if (!product) {
    return { error: "Product not found." };
  }

  // Update slug if name changed
  let slug = product.slug;
  if (name !== product.name) {
    slug = slugify(name);
    const existing = await db.product.findFirst({
      where: { slug, id: { not: productId } },
    });
    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }
  }

  await db.product.update({
    where: { id: productId },
    data: {
      name,
      slug,
      description,
      categoryId,
      size,
      condition: condition || "GOOD",
      sellingPrice,
      originalPrice,
      stock: isNaN(stock) ? product.stock : stock,
      status: status || product.status,
      featured,
    },
  });

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath(`/shop/${slug}`);
  return { success: true };
}

export async function deleteProduct(productId: string) {
  await requireAdmin();

  const product = await db.product.findUnique({
    where: { id: productId },
    include: { _count: { select: { orderItems: true } } },
  });

  if (!product) {
    return { error: "Product not found." };
  }

  // If product has orders, archive instead of deleting
  if (product._count.orderItems > 0) {
    await db.product.update({
      where: { id: productId },
      data: { status: "ARCHIVED" },
    });
  } else {
    await db.product.delete({ where: { id: productId } });
  }

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  return { success: true };
}
