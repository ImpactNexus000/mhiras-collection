import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Order Confirmed",
};

// Placeholder data — will be fetched from DB by order ID
const order = {
  orderNumber: "MH-2024-0847",
  customerName: "Amara",
  items: [
    { name: "Vintage Wrap Dress", size: "M", price: 8500 },
    { name: "Leather Tote — Brown", size: null, price: 14000 },
  ],
  subtotal: 22500,
  delivery: 1500,
  total: 24000,
  address: {
    name: "Amara Okonkwo",
    street: "14 Adeniyi Jones Ave, Ikeja, Lagos",
    phone: "+234 801 234 5678",
  },
  timeline: [
    { label: "Order Placed", date: "Wed, 8 Apr 2026 · 2:14 PM", status: "done" as const },
    { label: "Payment Confirmed", date: "Wed, 8 Apr 2026 · 2:17 PM", status: "done" as const },
    { label: "Being Packaged", date: "In progress...", status: "active" as const },
    { label: "Out for Delivery", date: "Expected: Thu, 9 Apr", status: "pending" as const },
    { label: "Delivered", date: "—", status: "pending" as const },
  ],
};

export default function OrderConfirmationPage() {
  return (
    <>
      {/* Confirmation banner */}
      <div className="bg-charcoal px-6 py-8 text-center text-cream">
        <div className="w-14 h-14 rounded-full bg-copper flex items-center justify-center mx-auto mb-4">
          <Check size={28} className="text-white" />
        </div>
        <h1 className="font-display text-3xl md:text-4xl font-light italic mb-2">
          Order Confirmed!
        </h1>
        <p className="text-sm text-charcoal-soft">
          Order #{order.orderNumber} · Thank you, {order.customerName}. Your items
          are being prepared for delivery.
        </p>
        <div className="flex gap-3 justify-center mt-5">
          <Button variant="primary">Track My Order</Button>
          <Link href="/shop">
            <Button variant="outline" className="text-cream border-charcoal-mid hover:bg-charcoal-mid">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>

      {/* Tracking + Order details */}
      <div className="max-w-5xl mx-auto grid md:grid-cols-[1fr_340px] gap-6 p-5 md:p-8">
        {/* Tracking timeline */}
        <div>
          <h2 className="text-base font-medium mb-5">Delivery Progress</h2>
          <div className="space-y-0">
            {order.timeline.map((step, i) => (
              <div key={step.label} className="flex gap-4 items-start pb-6 relative">
                {/* Connector line */}
                {i < order.timeline.length - 1 && (
                  <div
                    className={`absolute left-[13px] top-[30px] bottom-0 w-px ${
                      step.status === "done" ? "bg-copper" : "bg-border"
                    }`}
                  />
                )}

                {/* Dot */}
                {step.status === "done" ? (
                  <div className="w-7 h-7 rounded-full bg-copper flex items-center justify-center flex-shrink-0 z-10">
                    <Check size={14} className="text-white" />
                  </div>
                ) : step.status === "active" ? (
                  <div className="w-7 h-7 rounded-full border-2 border-copper bg-white flex items-center justify-center flex-shrink-0 z-10">
                    <div className="w-2.5 h-2.5 rounded-full bg-copper" />
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-full border-2 border-border bg-white flex-shrink-0 z-10" />
                )}

                {/* Content */}
                <div>
                  <div
                    className={`text-sm font-medium ${
                      step.status === "active"
                        ? "text-copper"
                        : step.status === "pending"
                        ? "text-charcoal-soft"
                        : "text-charcoal"
                    }`}
                  >
                    {step.label}
                  </div>
                  <div className="text-xs text-charcoal-soft mt-0.5">
                    {step.date}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order summary sidebar */}
        <div>
          <h2 className="text-base font-medium mb-3">Order Summary</h2>
          <div className="bg-cream-dark p-4 rounded text-sm">
            {/* Address */}
            <div className="pb-3 mb-3 border-b border-border">
              <strong>{order.address.name}</strong>
              <br />
              {order.address.street}
              <br />
              {order.address.phone}
            </div>

            {/* Items */}
            {order.items.map((item) => (
              <div key={item.name} className="mb-1.5">
                {item.name}
                {item.size && ` · ${item.size}`} —{" "}
                <strong>{formatPrice(item.price)}</strong>
              </div>
            ))}

            {/* Totals */}
            <div className="pt-3 mt-3 border-t border-border flex justify-between font-medium text-base">
              <span>Total Paid</span>
              <span className="text-copper">{formatPrice(order.total)}</span>
            </div>
          </div>

          {/* Help */}
          <div className="mt-4 p-4 border border-border rounded bg-white text-sm">
            <div className="font-medium mb-1">Need help?</div>
            <p className="text-charcoal-soft text-xs leading-relaxed">
              Contact us on WhatsApp at +234 801 234 5678 or email
              hello@mhirascollection.com with your order number.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
