import { Metadata } from "next";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { ArrowLeft, Package } from "lucide-react";

export const metadata: Metadata = {
  title: "Order History",
};

type OrderStatus = "processing" | "shipped" | "delivered" | "cancelled";

interface Order {
  id: string;
  date: string;
  items: number;
  total: number;
  status: OrderStatus;
}

const statusStyles: Record<OrderStatus, string> = {
  processing: "bg-gold/20 text-gold",
  shipped: "bg-copper-light text-copper",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-600",
};

const orders: Order[] = [
  {
    id: "MC-2024-001",
    date: "Apr 2, 2026",
    items: 3,
    total: 28500,
    status: "delivered",
  },
  {
    id: "MC-2024-002",
    date: "Mar 28, 2026",
    items: 1,
    total: 12000,
    status: "shipped",
  },
  {
    id: "MC-2024-003",
    date: "Mar 20, 2026",
    items: 2,
    total: 19500,
    status: "processing",
  },
  {
    id: "MC-2024-004",
    date: "Feb 14, 2026",
    items: 1,
    total: 8500,
    status: "cancelled",
  },
  {
    id: "MC-2024-005",
    date: "Jan 30, 2026",
    items: 4,
    total: 35000,
    status: "delivered",
  },
];

const tabs: { label: string; value: OrderStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Processing", value: "processing" },
  { label: "Shipped", value: "shipped" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
];

export default function OrderHistoryPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10 md:py-14">
      <Link
        href="/account"
        className="inline-flex items-center gap-1 text-sm text-charcoal-soft hover:text-charcoal transition-colors mb-6"
      >
        <ArrowLeft size={14} />
        My Account
      </Link>

      <h1 className="font-display text-3xl font-light italic mb-6">
        Order History
      </h1>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-6 -mx-4 px-4 md:mx-0 md:px-0">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            className={`px-4 py-2 text-sm whitespace-nowrap rounded-full cursor-pointer transition-colors ${
              tab.value === "all"
                ? "bg-charcoal text-cream"
                : "bg-cream-dark text-charcoal-soft hover:bg-border"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Order list */}
      <div className="space-y-4">
        {orders.map((order) => (
          <Link
            key={order.id}
            href={`/order/${order.id}`}
            className="block border border-border rounded-lg p-5 hover:border-copper/40 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="text-base font-medium">{order.id}</div>
                <div className="text-sm text-charcoal-soft mt-0.5">
                  {order.date} &middot; {order.items} item
                  {order.items !== 1 ? "s" : ""}
                </div>
              </div>
              <span
                className={`text-xs px-3 py-1 rounded-full font-medium capitalize ${statusStyles[order.status]}`}
              >
                {order.status}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-lg font-medium text-copper">
                {formatPrice(order.total)}
              </span>
              <span className="text-xs text-charcoal-soft">
                View details &rarr;
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Empty state (hidden, shown when no orders match filter) */}
      <div className="hidden text-center py-16">
        <Package size={48} className="mx-auto text-charcoal-soft/40 mb-4" />
        <h2 className="font-display text-2xl italic text-charcoal-soft mb-2">
          No orders yet
        </h2>
        <p className="text-sm text-charcoal-soft mb-6">
          When you place an order, it will appear here.
        </p>
        <Link
          href="/shop"
          className="text-copper font-medium hover:text-copper-dark text-sm"
        >
          Start Shopping &rarr;
        </Link>
      </div>
    </div>
  );
}
