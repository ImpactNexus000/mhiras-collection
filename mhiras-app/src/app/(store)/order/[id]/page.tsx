import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check, Clock, XCircle, AlertTriangle } from "lucide-react";
import { formatPrice, formatDate } from "@/lib/utils";
import { getOrderByNumber } from "@/lib/queries/orders";
import { verifyTransaction } from "@/lib/paystack";
import { db } from "@/lib/db";
import { PaymentRetryButton } from "@/components/store/payment-retry-button";

interface OrderPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ payment?: string; reference?: string; trxref?: string }>;
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
  paymentStatus: string,
  timelineEvents: { status: string; createdAt: Date }[]
) {
  const event = timelineEvents.find((e) =>
    e.status.toLowerCase().includes(stepLabel.toLowerCase())
  );

  if (event)
    return { status: "done" as const, date: formatDate(event.createdAt) };

  // Determine active step based on order status
  const statusToStep: Record<string, string> = {
    PENDING: "Order Placed",
    CONFIRMED: "Payment Confirmed",
    PROCESSING: "Processing",
    SHIPPED: "Shipped",
    DELIVERED: "Delivered",
  };

  // If payment is pending, the active step is "Payment Confirmed" (waiting)
  if (
    stepLabel === "Payment Confirmed" &&
    paymentStatus === "PENDING" &&
    orderStatus === "PENDING"
  ) {
    return { status: "active" as const, date: "Awaiting payment..." };
  }

  const currentStep = statusToStep[orderStatus] ?? "Order Placed";
  const currentIdx = timelineSteps.indexOf(currentStep);
  const stepIdx = timelineSteps.indexOf(stepLabel);

  if (stepIdx < currentIdx) return { status: "done" as const, date: "—" };
  if (stepIdx === currentIdx)
    return { status: "active" as const, date: "In progress..." };
  return { status: "pending" as const, date: "—" };
}

// Verify payment with Paystack on callback
async function verifyPaymentCallback(
  reference: string,
  orderId: string
): Promise<"success" | "failed" | "pending"> {
  try {
    const result = await verifyTransaction(reference);

    if (result.data.status === "success") {
      // Update order if not already paid
      const order = await db.order.findUnique({ where: { id: orderId } });
      if (order && order.paymentStatus !== "PAID") {
        await db.$transaction(async (tx) => {
          await tx.order.update({
            where: { id: orderId },
            data: {
              paymentStatus: "PAID",
              paymentRef: reference,
              status: order.status === "PENDING" ? "CONFIRMED" : order.status,
            },
          });
          await tx.orderEvent.create({
            data: {
              orderId,
              status: "Payment confirmed",
              note: `Verified via callback — ref: ${reference}`,
            },
          });
        });
      }
      return "success";
    }

    if (result.data.status === "failed" || result.data.status === "abandoned") {
      return "failed";
    }

    return "pending";
  } catch {
    return "pending";
  }
}

export default async function OrderConfirmationPage({
  params,
  searchParams,
}: OrderPageProps) {
  const { id } = await params;
  const query = await searchParams;

  let order = await getOrderByNumber(id);
  if (!order) notFound();

  // If this is a Paystack callback, verify the payment
  let paymentVerified: "success" | "failed" | "pending" | null = null;
  const reference = query.reference || query.trxref;

  if (query.payment === "callback" && reference) {
    paymentVerified = await verifyPaymentCallback(reference, order.id);
    // Re-fetch order to get updated status
    order = (await getOrderByNumber(id))!;
  }

  const timeline = timelineSteps.map((label) => ({
    label,
    ...getStepStatus(label, order.status, order.paymentStatus, order.timeline),
  }));

  const isCancelled =
    order.status === "CANCELLED" || order.status === "REFUNDED";
  const isPaid = order.paymentStatus === "PAID";
  const isCardPending =
    order.paymentMethod === "CARD" &&
    order.paymentStatus === "PENDING" &&
    !isCancelled;

  // Banner config
  let bannerIcon = <Check size={28} className="text-white" />;
  let bannerBg = "bg-copper";
  let bannerTitle = "Order Confirmed!";
  let bannerMessage = `Your items are being prepared for delivery.`;

  if (isCancelled) {
    bannerIcon = <XCircle size={28} className="text-white" />;
    bannerBg = "bg-danger";
    bannerTitle = "Order Cancelled";
    bannerMessage = "This order has been cancelled.";
  } else if (paymentVerified === "failed") {
    bannerIcon = <AlertTriangle size={28} className="text-white" />;
    bannerBg = "bg-warning";
    bannerTitle = "Payment Failed";
    bannerMessage = "Your payment could not be processed. You can retry below.";
  } else if (isCardPending) {
    bannerIcon = <Clock size={28} className="text-white" />;
    bannerBg = "bg-gold";
    bannerTitle = "Awaiting Payment";
    bannerMessage =
      "Your order has been placed. Complete your card payment to confirm.";
  } else if (
    order.paymentMethod === "BANK_TRANSFER" &&
    !isPaid
  ) {
    bannerIcon = <Clock size={28} className="text-white" />;
    bannerBg = "bg-gold";
    bannerTitle = "Awaiting Payment";
    bannerMessage =
      "Please complete your bank transfer. Your order will be confirmed once payment is verified.";
  }

  return (
    <>
      {/* Confirmation banner */}
      <div className="bg-charcoal px-6 py-8 text-center text-cream">
        <div
          className={`w-14 h-14 rounded-full ${bannerBg} flex items-center justify-center mx-auto mb-4`}
        >
          {bannerIcon}
        </div>
        <h1 className="font-display text-3xl md:text-4xl font-light italic mb-2">
          {bannerTitle}
        </h1>
        <p className="text-sm text-charcoal-soft">
          Order #{order.orderNumber} &middot; Thank you, {order.user.firstName}.{" "}
          {bannerMessage}
        </p>

        <div className="flex gap-3 justify-center mt-5">
          {isCardPending && (
            <PaymentRetryButton orderId={order.id} />
          )}
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

      {/* Bank transfer details */}
      {order.paymentMethod === "BANK_TRANSFER" && !isPaid && !isCancelled && (
        <div className="max-w-lg mx-auto px-5 -mt-2 mb-4">
          <div className="bg-white border border-border rounded-lg p-5 text-sm">
            <h3 className="font-medium mb-2">Bank Transfer Details</h3>
            <div className="space-y-1 text-charcoal-soft">
              <div>
                <span className="text-charcoal font-medium">Bank:</span> GTBank
              </div>
              <div>
                <span className="text-charcoal font-medium">
                  Account Number:
                </span>{" "}
                0123456789
              </div>
              <div>
                <span className="text-charcoal font-medium">
                  Account Name:
                </span>{" "}
                Mhiras Collection
              </div>
              <div>
                <span className="text-charcoal font-medium">Amount:</span>{" "}
                {formatPrice(order.total)}
              </div>
            </div>
            <p className="text-xs text-charcoal-soft mt-3">
              Please use your order number <strong>#{order.orderNumber}</strong>{" "}
              as the transfer reference. Your order will be confirmed once
              payment is verified.
            </p>
          </div>
        </div>
      )}

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
              {order.address.address}, {order.address.city},{" "}
              {order.address.state}
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
                <span>{isPaid ? "Total Paid" : "Total Due"}</span>
                <span className="text-copper">
                  {formatPrice(order.total)}
                </span>
              </div>
            </div>

            {/* Payment status */}
            <div className="mt-3 pt-3 border-t border-border text-xs text-charcoal-soft">
              Payment:{" "}
              <span
                className={
                  isPaid
                    ? "text-success font-medium"
                    : order.paymentStatus === "FAILED"
                      ? "text-danger font-medium"
                      : "text-warning font-medium"
                }
              >
                {isPaid
                  ? "Paid"
                  : order.paymentStatus === "FAILED"
                    ? "Failed"
                    : "Pending"}
              </span>
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
