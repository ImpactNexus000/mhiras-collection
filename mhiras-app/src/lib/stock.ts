import type { Prisma } from "@/generated/prisma/client";

/**
 * Thrown by reacquireOrderStock when an item can no longer be re-reserved
 * (someone else bought it after the order's stock was released). Lets the
 * caller's transaction roll back so no partial re-acquire is committed.
 */
export class StockUnavailableError extends Error {
  constructor(public readonly productId: string) {
    super(`Product ${productId} is no longer available`);
    this.name = "StockUnavailableError";
  }
}

/**
 * Return an order's items to inventory exactly once. The atomic claim on
 * `stockReleased` means concurrent callers — the charge.failed webhook, the
 * stale-order cron, an admin cancel — can all call this safely; only the
 * first wins and actually increments stock.
 *
 * Must run inside a transaction. Returns true if this call released the
 * stock, false if it was already released.
 */
export async function releaseOrderStock(
  tx: Prisma.TransactionClient,
  orderId: string
): Promise<boolean> {
  const claimed = await tx.order.updateMany({
    where: { id: orderId, stockReleased: false },
    data: { stockReleased: true },
  });
  if (claimed.count === 0) return false;

  const items = await tx.orderItem.findMany({ where: { orderId } });
  for (const item of items) {
    await tx.product.update({
      where: { id: item.productId },
      data: { stock: { increment: item.quantity } },
    });
  }
  return true;
}

/**
 * Re-reserve an order's items after a late payment lands on an order whose
 * stock was already released. Atomically decrements each product only if
 * enough stock remains; if any item can't be re-acquired it throws
 * StockUnavailableError so the caller's transaction rolls back (no partial
 * re-acquire) and the order can be flagged for refund. On success the order
 * is marked not-released again.
 *
 * Must run inside a transaction.
 */
export async function reacquireOrderStock(
  tx: Prisma.TransactionClient,
  orderId: string
): Promise<void> {
  const items = await tx.orderItem.findMany({ where: { orderId } });
  for (const item of items) {
    const updated = await tx.product.updateMany({
      where: { id: item.productId, stock: { gte: item.quantity } },
      data: { stock: { decrement: item.quantity } },
    });
    if (updated.count === 0) {
      throw new StockUnavailableError(item.productId);
    }
  }
  await tx.order.updateMany({
    where: { id: orderId },
    data: { stockReleased: false },
  });
}
