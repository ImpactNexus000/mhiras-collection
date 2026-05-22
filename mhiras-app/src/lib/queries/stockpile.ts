import { db } from "@/lib/db";

/**
 * Items currently sitting in a user's stockpile: order items from paid
 * STOCKPILE orders that have not yet been assigned to a delivery request.
 */
export async function getStockpileItems(userId: string) {
  return db.orderItem.findMany({
    where: {
      deliveryRequestId: null,
      order: {
        userId,
        fulfillmentType: "STOCKPILE",
        paymentStatus: "PAID",
      },
    },
    include: {
      product: {
        select: {
          name: true,
          slug: true,
          images: {
            where: { isPrimary: true },
            take: 1,
            select: { url: true },
          },
        },
      },
      order: {
        select: {
          orderNumber: true,
          createdAt: true,
          stockpileExpiresAt: true,
        },
      },
    },
    orderBy: { order: { createdAt: "asc" } },
  });
}

/**
 * All delivery requests raised by a user, newest first.
 */
export async function getDeliveryRequests(userId: string) {
  return db.deliveryRequest.findMany({
    where: { userId },
    include: {
      items: {
        include: { product: { select: { name: true } } },
      },
      address: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Admin: every delivery request across all customers, newest first.
 */
export async function getAdminDeliveryRequests() {
  return db.deliveryRequest.findMany({
    include: {
      user: { select: { firstName: true, lastName: true, email: true } },
      address: true,
      items: { include: { product: { select: { name: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Admin: all items currently held in customer stockpiles (paid STOCKPILE
 * order items not yet assigned to a delivery request).
 */
export async function getAdminStockpiledItems() {
  return db.orderItem.findMany({
    where: {
      deliveryRequestId: null,
      order: { fulfillmentType: "STOCKPILE", paymentStatus: "PAID" },
    },
    include: {
      product: { select: { name: true } },
      order: {
        select: {
          orderNumber: true,
          stockpileExpiresAt: true,
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      },
    },
    orderBy: { order: { createdAt: "asc" } },
  });
}

/**
 * Generate the next delivery-request number: DR-YYYY-NNNN
 */
export async function generateDeliveryRequestNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `DR-${year}-`;

  const last = await db.deliveryRequest.findFirst({
    where: { requestNumber: { startsWith: prefix } },
    orderBy: { requestNumber: "desc" },
    select: { requestNumber: true },
  });

  const lastNum = last
    ? parseInt(last.requestNumber.replace(prefix, ""), 10)
    : 0;

  return `${prefix}${String(lastNum + 1).padStart(4, "0")}`;
}
