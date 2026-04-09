import { db } from "@/lib/db";
import { OrderStatus } from "@/generated/prisma/client";

/**
 * Get a single order by orderNumber, including items, address, and timeline.
 */
export async function getOrderByNumber(orderNumber: string) {
  return db.order.findUnique({
    where: { orderNumber },
    include: {
      items: {
        include: {
          product: {
            select: { name: true, slug: true, size: true },
          },
        },
      },
      address: true,
      user: { select: { firstName: true, lastName: true, email: true } },
      timeline: { orderBy: { createdAt: "asc" } },
    },
  });
}

/**
 * Get orders for a specific user, optionally filtered by status.
 */
export async function getUserOrders(
  userId: string,
  status?: OrderStatus,
  page = 1,
  pageSize = 10
) {
  const where: Record<string, unknown> = { userId };
  if (status) where.status = status;

  const [orders, total] = await Promise.all([
    db.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: { select: { name: true, slug: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.order.count({ where }),
  ]);

  return {
    orders,
    total,
    page,
    totalPages: Math.ceil(total / pageSize),
  };
}

/**
 * Generate the next order number in the sequence: MH-YYYY-NNNN
 */
export async function generateOrderNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `MH-${year}-`;

  const lastOrder = await db.order.findFirst({
    where: { orderNumber: { startsWith: prefix } },
    orderBy: { orderNumber: "desc" },
    select: { orderNumber: true },
  });

  const lastNum = lastOrder
    ? parseInt(lastOrder.orderNumber.replace(prefix, ""), 10)
    : 0;

  const nextNum = String(lastNum + 1).padStart(4, "0");
  return `${prefix}${nextNum}`;
}
