"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateDeliveryRequestStatus } from "@/app/actions/admin-stockpile";
import type { DeliveryRequestStatus } from "@/generated/prisma/client";

interface ActionDef {
  label: string;
  status: DeliveryRequestStatus;
  primary?: boolean;
  tracking?: boolean;
}

// Which actions are offered for each current status.
const nextActions: Record<string, ActionDef[]> = {
  PENDING_PAYMENT: [{ label: "Cancel", status: "CANCELLED" }],
  PAID: [
    { label: "Mark Processing", status: "PROCESSING", primary: true },
    { label: "Cancel", status: "CANCELLED" },
  ],
  PROCESSING: [
    { label: "Mark Shipped", status: "SHIPPED", primary: true, tracking: true },
    { label: "Cancel", status: "CANCELLED" },
  ],
  SHIPPED: [{ label: "Mark Delivered", status: "DELIVERED", primary: true }],
  DELIVERED: [],
  CANCELLED: [],
};

export function DeliveryRequestActions({
  deliveryRequestId,
  status,
}: {
  deliveryRequestId: string;
  status: DeliveryRequestStatus;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const actions = nextActions[status] ?? [];
  if (actions.length === 0) {
    return <span className="text-xs text-charcoal-soft">—</span>;
  }

  async function run(action: ActionDef) {
    if (
      action.status === "CANCELLED" &&
      !window.confirm(
        "Cancel this delivery request? Its items return to the customer's stockpile. Any delivery fee already paid must be refunded manually."
      )
    ) {
      return;
    }

    let tracking: string | undefined;
    if (action.tracking) {
      tracking =
        window.prompt("Tracking number (optional):")?.trim() || undefined;
    }

    setLoading(true);
    const res = await updateDeliveryRequestStatus(
      deliveryRequestId,
      action.status,
      tracking
    );
    setLoading(false);

    if (res?.error) {
      alert(res.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex gap-1.5 flex-wrap">
      {actions.map((action) => (
        <button
          key={action.status}
          disabled={loading}
          onClick={() => run(action)}
          className={`px-2.5 py-1 text-xs rounded cursor-pointer transition-colors disabled:opacity-50 ${
            action.primary
              ? "bg-copper text-white hover:bg-copper-dark"
              : "border border-border text-charcoal-soft hover:bg-cream-dark"
          }`}
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}
