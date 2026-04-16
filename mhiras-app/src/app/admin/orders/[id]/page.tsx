import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatPrice, formatDate } from "@/lib/utils";
import { ArrowLeft, MapPin, Phone, Mail } from "lucide-react";
import { OrderStatusActions } from "@/components/admin/order-status-actions";
import { OrderNotes } from "@/components/admin/order-notes";

const statusStyles: Record<string, string> = {
  PENDING: "pill pill-pending",
  CONFIRMED: "pill pill-confirmed",
  PROCESSING: "pill pill-processing",
  SHIPPED: "pill pill-shipped",
  DELIVERED: "pill pill-delivered",
  CANCELLED: "pill pill-cancelled",
  REFUNDED: "pill pill-refunded",
};

const paymentStatusStyles: Record<string, string> = {
  PENDING: "pill pill-pending",
  PAID: "pill pill-delivered",
  FAILED: "pill pill-cancelled",
  REFUNDED: "pill pill-refunded",
};

const paymentMethodLabel: Record<string, string> = {
  CARD: "Card",
  BANK_TRANSFER: "Bank Transfer",
  PAY_ON_DELIVERY: "Pay on Delivery",
};

// The expected order flow
const statusFlow = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
] as const;

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const order = await db.order.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
        },
      },
      address: true,
      items: {
        include: {
          product: {
            select: { name: true, slug: true, size: true, condition: true },
          },
        },
      },
      timeline: { orderBy: { createdAt: "asc" } },
      promoCode: { select: { code: true, discountType: true, discountValue: true } },
    },
  });

  if (!order) notFound();

  // Build timeline steps
  const currentIndex = statusFlow.indexOf(
    order.status as (typeof statusFlow)[number]
  );
  const isCancelled = order.status === "CANCELLED" || order.status === "REFUNDED";

  const timelineSteps = statusFlow.map((status, i) => {
    const event = order.timeline.find((e) =>
      e.status.toLowerCase().includes(status.toLowerCase())
    );
    return {
      label: status.charAt(0) + status.slice(1).toLowerCase(),
      time: event
        ? formatDate(event.createdAt)
        : "—",
      done: i <= currentIndex && !isCancelled,
      active: i === currentIndex && !isCancelled,
    };
  });

  // Add cancelled/refunded to timeline if applicable
  if (isCancelled) {
    const event = order.timeline.find((e) =>
      e.status.toLowerCase().includes(order.status.toLowerCase())
    );
    timelineSteps.push({
      label: order.status.charAt(0) + order.status.slice(1).toLowerCase(),
      time: event ? formatDate(event.createdAt) : formatDate(order.updatedAt),
      done: true,
      active: true,
    });
  }

  return (
    <>
      {/* Back + header */}
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-1 text-sm text-charcoal-soft hover:text-charcoal transition-colors mb-4"
      >
        <ArrowLeft size={14} />
        All Orders
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-3xl font-light italic">
            #{order.orderNumber}
          </h1>
          <span className={statusStyles[order.status] ?? "pill"}>
            {order.status.toLowerCase()}
          </span>
        </div>
        <OrderStatusActions
          orderId={order.id}
          currentStatus={order.status}
        />
      </div>

      <div className="grid md:grid-cols-[1fr_320px] gap-5">
        {/* Left column */}
        <div className="space-y-5">
          {/* Items */}
          <div className="bg-white border border-border rounded-lg overflow-hidden">
            <div className="px-5 py-3 border-b border-border">
              <h3 className="text-sm font-medium">
                Items ({order.items.length})
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-cream-dark">
                    <th className="text-left px-5 py-2.5 text-xs uppercase tracking-wider text-charcoal-soft font-medium">
                      Product
                    </th>
                    <th className="text-left px-5 py-2.5 text-xs uppercase tracking-wider text-charcoal-soft font-medium">
                      Size
                    </th>
                    <th className="text-center px-5 py-2.5 text-xs uppercase tracking-wider text-charcoal-soft font-medium">
                      Qty
                    </th>
                    <th className="text-right px-5 py-2.5 text-xs uppercase tracking-wider text-charcoal-soft font-medium">
                      Price
                    </th>
                    <th className="text-right px-5 py-2.5 text-xs uppercase tracking-wider text-charcoal-soft font-medium">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={item.id} className="border-t border-border">
                      <td className="px-5 py-3">
                        <Link
                          href={`/shop/${item.product.slug}`}
                          className="font-medium hover:text-copper"
                        >
                          {item.product.name}
                        </Link>
                      </td>
                      <td className="px-5 py-3 text-charcoal-soft">
                        {item.size ?? item.product.size ?? "—"}
                      </td>
                      <td className="px-5 py-3 text-center">{item.quantity}</td>
                      <td className="px-5 py-3 text-right">
                        {formatPrice(item.price)}
                      </td>
                      <td className="px-5 py-3 text-right font-medium">
                        {formatPrice(item.price * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 border-t border-border bg-cream-dark space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-charcoal-soft">Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal-soft">Delivery</span>
                <span>{formatPrice(order.deliveryFee)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-success">
                  <span>Discount</span>
                  <span>-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-medium text-base pt-1 border-t border-border">
                <span>Total</span>
                <span className="text-copper">
                  {formatPrice(order.total)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="bg-white border border-border rounded-lg p-5">
            <h3 className="text-sm font-medium mb-3">Payment</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-xs text-charcoal-soft uppercase tracking-wider mb-1">
                  Method
                </div>
                <div>
                  {paymentMethodLabel[order.paymentMethod] ??
                    order.paymentMethod}
                </div>
              </div>
              <div>
                <div className="text-xs text-charcoal-soft uppercase tracking-wider mb-1">
                  Reference
                </div>
                <div className="font-mono text-xs">
                  {order.paymentRef ?? "—"}
                </div>
              </div>
              <div>
                <div className="text-xs text-charcoal-soft uppercase tracking-wider mb-1">
                  Status
                </div>
                <span
                  className={
                    paymentStatusStyles[order.paymentStatus] ?? "pill"
                  }
                >
                  {order.paymentStatus.toLowerCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <OrderNotes orderId={order.id} />
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Timeline */}
          <div className="bg-white border border-border rounded-lg p-5">
            <h3 className="text-sm font-medium mb-4">Order Timeline</h3>
            <div className="space-y-0">
              {timelineSteps.map((step, i) => (
                <div key={step.label} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-3 h-3 rounded-full border-2 flex-shrink-0 ${
                        step.active
                          ? "border-copper bg-copper"
                          : step.done
                            ? "border-copper bg-copper"
                            : "border-border bg-white"
                      }`}
                    />
                    {i < timelineSteps.length - 1 && (
                      <div
                        className={`w-0.5 h-8 ${
                          step.done ? "bg-copper" : "bg-border"
                        }`}
                      />
                    )}
                  </div>
                  <div className="-mt-0.5 pb-4">
                    <div
                      className={`text-sm ${
                        step.active
                          ? "font-medium text-copper"
                          : step.done
                            ? "text-charcoal"
                            : "text-charcoal-soft"
                      }`}
                    >
                      {step.label}
                    </div>
                    <div className="text-xs text-charcoal-soft">
                      {step.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Full event log */}
            {order.timeline.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border">
                <h4 className="text-xs uppercase tracking-wider text-charcoal-soft font-medium mb-2">
                  Activity Log
                </h4>
                <div className="space-y-2">
                  {order.timeline.map((event) => (
                    <div key={event.id} className="text-xs">
                      <span className="text-charcoal">{event.status}</span>
                      {event.note && (
                        <span className="text-charcoal-soft">
                          {" "}
                          — {event.note}
                        </span>
                      )}
                      <div className="text-charcoal-soft/60">
                        {formatDate(event.createdAt)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Customer */}
          <div className="bg-white border border-border rounded-lg p-5">
            <h3 className="text-sm font-medium mb-3">Customer</h3>
            <div className="text-base font-medium mb-2">
              {order.user.firstName} {order.user.lastName}
            </div>
            <div className="space-y-2 text-sm text-charcoal-soft">
              <div className="flex items-center gap-2">
                <Mail size={14} />
                {order.user.email}
              </div>
              {order.user.phone && (
                <div className="flex items-center gap-2">
                  <Phone size={14} />
                  {order.user.phone}
                </div>
              )}
            </div>
          </div>

          {/* Delivery address */}
          <div className="bg-white border border-border rounded-lg p-5">
            <h3 className="text-sm font-medium mb-3">Delivery Address</h3>
            <div className="text-sm text-charcoal-soft space-y-1">
              <div className="font-medium text-charcoal">
                {order.address.firstName} {order.address.lastName}
              </div>
              <div className="flex items-start gap-2">
                <MapPin size={14} className="mt-0.5 flex-shrink-0" />
                <div>
                  {order.address.address}
                  <br />
                  {order.address.city}, {order.address.state}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={14} />
                {order.address.phone}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
