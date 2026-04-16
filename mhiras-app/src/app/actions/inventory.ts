"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateStock(productId: string, stock: number) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  if (stock < 0) {
    return { error: "Stock cannot be negative." };
  }

  const product = await db.product.findUnique({ where: { id: productId } });
  if (!product) {
    return { error: "Product not found." };
  }

  await db.product.update({
    where: { id: productId },
    data: {
      stock,
      // Auto-update status based on stock
      status:
        stock === 0 && product.status === "PUBLISHED"
          ? "SOLD_OUT"
          : stock > 0 && product.status === "SOLD_OUT"
            ? "PUBLISHED"
            : product.status,
    },
  });

  revalidatePath("/admin/inventory");
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  return { success: true };
}
