"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";

export function PaymentRetryButton({ orderId }: { orderId: string }) {
  const [loading, setLoading] = useState(false);

  async function handleRetry() {
    setLoading(true);

    try {
      const res = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });

      const data = await res.json();

      if (data.authorization_url) {
        window.location.href = data.authorization_url;
        return;
      }

      alert(data.error || "Failed to initialize payment. Please try again.");
    } catch {
      alert("Something went wrong. Please try again.");
    }

    setLoading(false);
  }

  return (
    <Button
      variant="primary"
      onClick={handleRetry}
      disabled={loading}
      className="gap-2"
    >
      <CreditCard size={16} />
      {loading ? "Redirecting..." : "Pay Now"}
    </Button>
  );
}
