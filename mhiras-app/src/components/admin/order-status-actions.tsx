"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateOrderStatus } from "@/app/actions/admin-orders";
import { Button } from "@/components/ui/button";
import { OrderStatus } from "@/generated/prisma/client";

const nextStatusMap: Partial<Record<OrderStatus, { label: string; status: OrderStatus }>> = {
  PENDING: { label: "Confirm Order", status: "CONFIRMED" },
  CONFIRMED: { label: "Start Processing", status: "PROCESSING" },
  PROCESSING: { label: "Mark as Shipped", status: "SHIPPED" },
  SHIPPED: { label: "Mark as Delivered", status: "DELIVERED" },
};

interface OrderStatusActionsProps {
  orderId: string;
  currentStatus: string;
}

export function OrderStatusActions({
  orderId,
  currentStatus,
}: OrderStatusActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const nextAction = nextStatusMap[currentStatus as OrderStatus];
  const canCancel =
    currentStatus !== "CANCELLED" &&
    currentStatus !== "DELIVERED" &&
    currentStatus !== "REFUNDED";

  async function handleStatusUpdate(
    newStatus: OrderStatus,
    actionLabel: string
  ) {
    const message =
      newStatus === "CANCELLED"
        ? "Cancel this order? Any reserved stock will be returned to inventory. This can't be undone easily."
        : `Are you sure you want to "${actionLabel}" for this order?`;
    if (!window.confirm(message)) return;

    setLoading(true);
    const result = await updateOrderStatus(orderId, newStatus);
    if (!result.error) {
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <div className="flex gap-2">
      {nextAction && (
        <Button
          size="sm"
          onClick={() =>
            handleStatusUpdate(nextAction.status, nextAction.label)
          }
          disabled={loading}
        >
          {loading ? "Updating..." : nextAction.label}
        </Button>
      )}
      {canCancel && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleStatusUpdate("CANCELLED", "Cancel Order")}
          disabled={loading}
          className="text-danger border-danger hover:bg-danger/5"
        >
          Cancel Order
        </Button>
      )}
    </div>
  );
}
