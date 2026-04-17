import Link from "next/link";
import { getAdminOrders, getOrderStatusCounts } from "@/lib/queries/admin";
import { OrderStatus } from "@/generated/prisma/client";
import { formatPrice, formatDate } from "@/lib/utils";
import { OrdersSearch } from "@/components/admin/orders-search";

const statusStyles: Record<string, string> = {
  PENDING: "pill pill-pending",
  CONFIRMED: "pill pill-confirmed",
  PROCESSING: "pill pill-processing",
  SHIPPED: "pill pill-shipped",
  DELIVERED: "pill pill-delivered",
  CANCELLED: "pill pill-cancelled",
  REFUNDED: "pill pill-refunded",
};

const paymentMethodLabel: Record<string, string> = {
  CARD: "Card",
  BANK_TRANSFER: "Bank Transfer",
  PAY_ON_DELIVERY: "Pay on Delivery",
};

interface AdminOrdersPageProps {
  searchParams: Promise<{
    status?: string;
    search?: string;
    page?: string;
  }>;
}

export default async function AdminOrdersPage({
  searchParams,
}: AdminOrdersPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page ?? "1", 10);
  const status = params.status as OrderStatus | undefined;
  const search = params.search;

  const data = await getAdminOrders({ status, search }, page);
  const counts = await getOrderStatusCounts();

  const { orders, total, totalPages } = data;

  const tabs = [
    { label: "All Orders", count: counts.all, href: "/admin/orders" },
    { label: "Pending", count: counts.pending, href: "/admin/orders?status=PENDING" },
    { label: "Processing", count: counts.processing, href: "/admin/orders?status=PROCESSING" },
    { label: "Shipped", count: counts.shipped, href: "/admin/orders?status=SHIPPED" },
    { label: "Delivered", count: counts.delivered, href: "/admin/orders?status=DELIVERED" },
    { label: "Cancelled", count: counts.cancelled, href: "/admin/orders?status=CANCELLED" },
  ];

  const activeTab = status
    ? tabs.findIndex((t) => t.href.includes(`status=${status}`))
    : 0;

  return (
    <>
      <div className="flex justify-between items-center mb-5">
        <h1 className="font-display text-3xl md:text-4xl font-light italic">
          Orders
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto mb-4">
        {tabs.map((tab, i) => (
          <Link
            key={tab.label}
            href={tab.href}
            className={`px-4 py-2 text-sm whitespace-nowrap rounded-t-lg transition-colors ${
              i === activeTab
                ? "bg-white text-charcoal border border-border border-b-white -mb-px z-10"
                : "text-charcoal-soft hover:text-charcoal"
            }`}
          >
            {tab.label}{" "}
            <span className="text-xs text-charcoal-soft">({tab.count})</span>
          </Link>
        ))}
      </div>

      {/* Search */}
      <OrdersSearch initialSearch={search ?? ""} status={status} />

      {/* Orders table */}
      {orders.length > 0 ? (
        <div className="bg-white border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-cream-dark">
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-charcoal-soft font-medium">
                    Order
                  </th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-charcoal-soft font-medium">
                    Customer
                  </th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-charcoal-soft font-medium">
                    Items
                  </th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-charcoal-soft font-medium">
                    Amount
                  </th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-charcoal-soft font-medium">
                    Payment
                  </th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-charcoal-soft font-medium">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-charcoal-soft font-medium">
                    Date
                  </th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-t border-border hover:bg-cream/50"
                  >
                    <td className="px-4 py-3 font-medium">
                      #{order.orderNumber}
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        {order.user.firstName} {order.user.lastName}
                      </div>
                      <div className="text-xs text-charcoal-soft">
                        {order.user.email}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {order.items.length} item
                      {order.items.length !== 1 ? "s" : ""}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {formatPrice(order.total)}
                    </td>
                    <td className="px-4 py-3 text-charcoal-soft">
                      {paymentMethodLabel[order.paymentMethod] ??
                        order.paymentMethod}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          statusStyles[order.status] ?? "pill"
                        }
                      >
                        {order.status.toLowerCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-charcoal-soft text-xs">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-copper text-sm hover:text-copper-dark"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-cream-dark">
              <span className="text-xs text-charcoal-soft">
                Showing {(page - 1) * 20 + 1}–
                {Math.min(page * 20, total)} of {total} orders
              </span>
              <div className="flex gap-1">
                {page > 1 && (
                  <Link
                    href={`/admin/orders?${new URLSearchParams({
                      ...(status ? { status } : {}),
                      ...(search ? { search } : {}),
                      page: String(page - 1),
                    }).toString()}`}
                    className="px-3 py-1.5 text-xs border border-border rounded bg-white hover:bg-cream-dark"
                  >
                    Previous
                  </Link>
                )}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <Link
                      key={p}
                      href={`/admin/orders?${new URLSearchParams({
                        ...(status ? { status } : {}),
                        ...(search ? { search } : {}),
                        page: String(p),
                      }).toString()}`}
                      className={`px-3 py-1.5 text-xs border rounded ${
                        p === page
                          ? "border-copper bg-copper text-white"
                          : "border-border bg-white hover:bg-cream-dark"
                      }`}
                    >
                      {p}
                    </Link>
                  )
                )}
                {page < totalPages && (
                  <Link
                    href={`/admin/orders?${new URLSearchParams({
                      ...(status ? { status } : {}),
                      ...(search ? { search } : {}),
                      page: String(page + 1),
                    }).toString()}`}
                    className="px-3 py-1.5 text-xs border border-border rounded bg-white hover:bg-cream-dark"
                  >
                    Next
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white border border-border rounded-lg p-12 text-center">
          <p className="text-charcoal-soft">
            {search
              ? `No orders found for "${search}"`
              : "No orders yet."}
          </p>
        </div>
      )}
    </>
  );
}
