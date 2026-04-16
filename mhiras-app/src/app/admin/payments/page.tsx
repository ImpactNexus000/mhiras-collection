import Link from "next/link";
import { getPaymentsSummary, getPaymentOrders } from "@/lib/queries/admin";
import { PaymentStatus } from "@/generated/prisma/client";
import { formatPrice, formatDate } from "@/lib/utils";

const paymentStatusStyles: Record<string, string> = {
  PAID: "bg-green-100 text-green-700",
  PENDING: "bg-yellow-100 text-yellow-700",
  FAILED: "bg-red-100 text-red-600",
  REFUNDED: "bg-gray-100 text-gray-600",
};

const paymentStatusLabels: Record<string, string> = {
  PAID: "Successful",
  PENDING: "Pending",
  FAILED: "Failed",
  REFUNDED: "Refunded",
};

const paymentMethodLabel: Record<string, string> = {
  CARD: "Card",
  BANK_TRANSFER: "Bank Transfer",
  PAY_ON_DELIVERY: "Pay on Delivery",
};

interface AdminPaymentsPageProps {
  searchParams: Promise<{
    status?: string;
    page?: string;
  }>;
}

export default async function AdminPaymentsPage({
  searchParams,
}: AdminPaymentsPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page ?? "1", 10);
  const status = params.status as PaymentStatus | undefined;

  const [summary, { orders, total, totalPages }] = await Promise.all([
    getPaymentsSummary(),
    getPaymentOrders(status, page),
  ]);

  const totalRevenue = summary.paid.amount;
  const totalTransactions =
    summary.paid.count + summary.pending.count + summary.failed.count + summary.refunded.count;
  const successRate =
    totalTransactions > 0
      ? Math.round((summary.paid.count / totalTransactions) * 100)
      : 0;

  const statCards = [
    {
      label: "Total Revenue",
      value: formatPrice(totalRevenue),
      change: `${summary.paid.count} successful payments`,
    },
    {
      label: "Success Rate",
      value: `${successRate}%`,
      change: `${totalTransactions} total transactions`,
    },
    {
      label: "Pending",
      value: formatPrice(summary.pending.amount),
      change: `${summary.pending.count} transaction${summary.pending.count !== 1 ? "s" : ""}`,
    },
  ];

  const tabs = [
    { label: "All", count: totalTransactions, href: "/admin/payments" },
    { label: "Successful", count: summary.paid.count, href: "/admin/payments?status=PAID" },
    { label: "Pending", count: summary.pending.count, href: "/admin/payments?status=PENDING" },
    { label: "Failed", count: summary.failed.count, href: "/admin/payments?status=FAILED" },
    { label: "Refunded", count: summary.refunded.count, href: "/admin/payments?status=REFUNDED" },
  ];

  const activeTab = status
    ? tabs.findIndex((t) => t.href.includes(`status=${status}`))
    : 0;

  return (
    <>
      <div className="flex justify-between items-center mb-5">
        <h1 className="font-display text-3xl md:text-4xl font-light italic">
          Payments
        </h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {statCards.map((s) => (
          <div
            key={s.label}
            className="bg-white border border-border rounded-lg p-4"
          >
            <div className="text-xs uppercase tracking-wider text-charcoal-soft mb-1.5">
              {s.label}
            </div>
            <div className="text-3xl font-medium">{s.value}</div>
            <div className="text-xs text-charcoal-soft mt-1">{s.change}</div>
          </div>
        ))}
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

      {/* Table */}
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
                    Amount
                  </th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-charcoal-soft font-medium">
                    Method
                  </th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-charcoal-soft font-medium">
                    Reference
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
                      {order.user.firstName} {order.user.lastName}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {formatPrice(order.total)}
                    </td>
                    <td className="px-4 py-3 text-charcoal-soft">
                      {paymentMethodLabel[order.paymentMethod] ??
                        order.paymentMethod}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-charcoal-soft">
                      {order.paymentRef ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          paymentStatusStyles[order.paymentStatus] ??
                          "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {paymentStatusLabels[order.paymentStatus] ??
                          order.paymentStatus}
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
                {Math.min(page * 20, total)} of {total} payments
              </span>
              <div className="flex gap-1">
                {page > 1 && (
                  <Link
                    href={`/admin/payments?${new URLSearchParams({
                      ...(status ? { status } : {}),
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
                      href={`/admin/payments?${new URLSearchParams({
                        ...(status ? { status } : {}),
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
                    href={`/admin/payments?${new URLSearchParams({
                      ...(status ? { status } : {}),
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
            {status
              ? `No ${paymentStatusLabels[status]?.toLowerCase() ?? status} payments.`
              : "No payments yet."}
          </p>
        </div>
      )}
    </>
  );
}
