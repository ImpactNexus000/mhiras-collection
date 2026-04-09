import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { formatPrice, formatDate } from "@/lib/utils";
import { getOrderByNumber } from "@/lib/queries/orders";

interface OrderPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: OrderPageProps): Promise<Metadata> {
  const { id } = await params;
  return { title: `Order #${id}` };
}

// Map order statuses to timeline steps
const timelineSteps = [
  "Order Placed",
  "Payment Confirmed",
  "Processing",
  "Shipped",
  "Delivered",
];

function getStepStatus(
  stepLabel: string,
  orderStatus: string,
  timelineEvents: { status: string; createdAt: Date }[]
) {
  const event = timelineEvents.find((e) => e.status === stepLabel);

  if (event) return { status: "done" as const, date: formatDate(event.createdAt) };

  // Determine active step based on order status
  const statusToStep: Record<string, string> = {
    PENDING: "Order Placed",
    CONFIRMED: "Payment Confirmed",
    PROCESSING: "Processing",
    SHIPPED: "Shipped",
    DELIVERED: "Delivered",
  };

  const currentStep = statusToStep[orderStatus] ?? "Order Placed";
  const currentIdx = timelineSteps.indexOf(currentStep);
  const stepIdx = timelineSteps.indexOf(stepLabel);

  if (stepIdx < currentIdx) return { status: "done" as const, date: "—" };
  if (stepIdx === currentIdx) return { status: "active" as const, date: "In progress..." };
  return { status: "pending" as const, date: "—" };
}

export default async function OrderConfirmationPage({
  params,
}: OrderPageProps) {
  const { id } = await params;
  const order = await getOrderByNumber(id);

  if (!order) notFound();

  const timeline = timelineSteps.map((label) => ({
    label,
    ...getStepStatus(label, order.status, order.timeline),
  }));

  const isCancelled = order.status === "CANCELLED" || order.status === "REFUNDED";

  return (
    <>
      {/* Confirmation banner */}
      <div className="bg-charcoal px-6 py-8 text-center text-cream">
        <div className="w-14 h-14 rounded-full bg-copper flex items-center justify-center mx-auto mb-4">
          <Check size={28} className="text-white" />
        </div>
        <h1 className="font-display text-3xl md:text-4xl font-light italic mb-2">
          {isCancelled ? "Order Cancelled" : "Order Confirmed!"}
        </h1>
        <p className="text-sm text-charcoal-soft">
          Order #{order.orderNumber} &middot; Thank you,{" "}
          {order.user.firstName}. {isCancelled
            ? "This order has been cancelled."
            : "Your items are being prepared for delivery."}
        </p>
        <div className="flex gap-3 justify-center mt-5">
          <Link href="/account/orders">
            <Button variant="primary">My Orders</Button>
          </Link>
          <Link href="/shop">
            <Button
              variant="outline"
              className="text-cream border-charcoal-mid hover:bg-charcoal-mid"
            >
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
            {timeline.map((step, i) => (
              <div
                key={step.label}
                className="flex gap-4 items-start pb-6 relative"
              >
                {i < timeline.length - 1 && (
                  <div
                    className={`absolute left-[13px] top-[30px] bottom-0 w-px ${
                      step.status === "done" ? "bg-copper" : "bg-border"
                    }`}
                  />
                )}

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
              <strong>
                {order.address.firstName} {order.address.lastName}
              </strong>
              <br />
              {order.address.address}, {order.address.city}, {order.address.state}
              <br />
              {order.address.phone}
            </div>

            {/* Items */}
            {order.items.map((item) => (
              <div key={item.id} className="mb-1.5">
                <Link
                  href={`/shop/${item.product.slug}`}
                  className="hover:text-copper transition-colors"
                >
                  {item.product.name}
                </Link>
                {item.size && ` · ${item.size}`}
                {item.quantity > 1 && ` × ${item.quantity}`} —{" "}
                <strong>{formatPrice(item.price * item.quantity)}</strong>
              </div>
            ))}

            {/* Totals */}
            <div className="pt-3 mt-3 border-t border-border space-y-1">
              <div className="flex justify-between text-charcoal-soft">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-charcoal-soft">
                <span>Delivery</span>
                <span>{formatPrice(order.deliveryFee)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-success">
                  <span>Discount</span>
                  <span>-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-medium text-base pt-2 border-t border-border">
                <span>Total Paid</span>
                <span className="text-copper">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Help */}
          <div className="mt-4 p-4 border border-border rounded bg-white text-sm">
            <div className="font-medium mb-1">Need help?</div>
            <p className="text-charcoal-soft text-xs leading-relaxed">
              Contact us on WhatsApp at +234 901 234 5678 or email
              hello@mhirascollection.com with your order number.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
