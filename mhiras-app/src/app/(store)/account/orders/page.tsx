import { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatPrice, formatDate } from "@/lib/utils";
import { ArrowLeft, Package } from "lucide-react";
import { auth } from "@/lib/auth";
import { getUserOrders } from "@/lib/queries/orders";
import { OrderStatus } from "@/generated/prisma/client";

export const metadata: Metadata = {
  title: "Order History",
};

const statusStyles: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  PROCESSING: "bg-gold/20 text-gold",
  SHIPPED: "bg-copper-light text-copper",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-600",
  REFUNDED: "bg-gray-100 text-gray-600",
};

const statusLabel: Record<string, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
};

interface OrderHistoryPageProps {
  searchParams: Promise<{
    status?: string;
    page?: string;
  }>;
}

export default async function OrderHistoryPage({
  searchParams,
}: OrderHistoryPageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");

  const params = await searchParams;
  const statusFilter = params.status as OrderStatus | undefined;
  const page = params.page ? Number(params.page) : 1;

  const { orders, total, totalPages } = await getUserOrders(
    session.user.id,
    statusFilter,
    page
  );

  const tabs: { label: string; value: string }[] = [
    { label: "All", value: "" },
    { label: "Processing", value: "PROCESSING" },
    { label: "Shipped", value: "SHIPPED" },
    { label: "Delivered", value: "DELIVERED" },
    { label: "Cancelled", value: "CANCELLED" },
  ];

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
          <Link
            key={tab.value}
            href={
              tab.value
                ? `/account/orders?status=${tab.value}`
                : "/account/orders"
            }
            className={`px-4 py-2 text-sm whitespace-nowrap rounded-full transition-colors ${
              (statusFilter ?? "") === tab.value
                ? "bg-charcoal text-cream"
                : "bg-cream-dark text-charcoal-soft hover:bg-border"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Order list */}
      {orders.length === 0 ? (
        <div className="text-center py-16">
          <Package size={48} className="mx-auto text-charcoal-soft/40 mb-4" />
          <h2 className="font-display text-2xl italic text-charcoal-soft mb-2">
            No orders found
          </h2>
          <p className="text-sm text-charcoal-soft mb-6">
            {statusFilter
              ? "No orders match this filter."
              : "When you place an order, it will appear here."}
          </p>
          <Link
            href="/shop"
            className="text-copper font-medium hover:text-copper-dark text-sm"
          >
            Start Shopping &rarr;
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/order/${order.orderNumber}`}
              className="block border border-border rounded-lg p-5 hover:border-copper/40 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-base font-medium">
                    {order.orderNumber}
                  </div>
                  <div className="text-sm text-charcoal-soft mt-0.5">
                    {formatDate(order.createdAt)} &middot; {order.items.length}{" "}
                    item{order.items.length !== 1 ? "s" : ""}
                  </div>
                </div>
                <span
                  className={`text-xs px-3 py-1 rounded-full font-medium ${
                    statusStyles[order.status] ?? "bg-gray-100 text-gray-600"
                  }`}
                >
                  {statusLabel[order.status] ?? order.status}
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
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(
            (pageNum) => (
              <a
                key={pageNum}
                href={`/account/orders?${new URLSearchParams({
                  ...(statusFilter ? { status: statusFilter } : {}),
                  page: String(pageNum),
                }).toString()}`}
                className={`px-3 py-1.5 text-sm border rounded transition-colors ${
                  pageNum === page
                    ? "border-copper bg-copper text-white"
                    : "border-border bg-white hover:bg-cream-dark"
                }`}
              >
                {pageNum}
              </a>
            )
          )}
        </div>
      )}
    </div>
  );
}
