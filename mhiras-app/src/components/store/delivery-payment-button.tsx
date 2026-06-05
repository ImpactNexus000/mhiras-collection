"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { CreditCard } from "lucide-react";

/**
 * Completes (or retries) the delivery-fee payment for a delivery request
 * that is still awaiting payment.
 */
export function DeliveryPaymentButton({
  deliveryRequestId,
}: {
  deliveryRequestId: string;
}) {
  const { error: toastError } = useToast();
  const [loading, setLoading] = useState(false);

  async function handlePay() {
    setLoading(true);
    try {
      const res = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deliveryRequestId }),
      });
      const data = await res.json();
      if (data.authorization_url) {
        window.location.href = data.authorization_url;
        return;
      }
      toastError(data.error || "Failed to start payment. Please try again.");
    } catch {
      toastError("Something went wrong. Please try again.");
    }
    setLoading(false);
  }

  return (
    <Button
      variant="primary"
      onClick={handlePay}
      disabled={loading}
      className="gap-2 text-xs"
    >
      <CreditCard size={14} />
      {loading ? "Redirecting..." : "Complete Payment"}
    </Button>
  );
}
