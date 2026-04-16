"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { OrderStatus } from "@/generated/prisma/client";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  return session;
}

const statusLabels: Record<string, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
};

export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  note?: string
) {
  await requireAdmin();

  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order) {
    return { error: "Order not found." };
  }

  await db.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: orderId },
      data: { status: newStatus },
    });

    await tx.orderEvent.create({
      data: {
        orderId,
        status: `Status changed to ${statusLabels[newStatus] ?? newStatus}`,
        note: note || null,
      },
    });

    // If cancelled, restore stock
    if (newStatus === "CANCELLED" && order.status !== "CANCELLED") {
      const items = await tx.orderItem.findMany({
        where: { orderId },
      });
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }
    }
  });

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  return { success: true };
}

export async function addOrderNote(orderId: string, note: string) {
  await requireAdmin();

  if (!note.trim()) {
    return { error: "Note cannot be empty." };
  }

  await db.orderEvent.create({
    data: {
      orderId,
      status: "Note added",
      note: note.trim(),
    },
  });

  revalidatePath(`/admin/orders/${orderId}`);
  return { success: true };
}
