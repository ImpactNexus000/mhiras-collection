import Link from "next/link";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { formatPrice, formatDate } from "@/lib/utils";
import {
  getDashboardStats,
  getWeeklyRevenue,
  getRecentOrders,
} from "@/lib/queries/admin";

const statusStyles: Record<string, string> = {
  PENDING: "pill pill-pending",
  CONFIRMED: "pill pill-confirmed",
  PROCESSING: "pill pill-processing",
  SHIPPED: "pill pill-shipped",
  DELIVERED: "pill pill-delivered",
  CANCELLED: "pill pill-cancelled",
  REFUNDED: "pill pill-refunded",
};

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function formatRelativeDate(date: Date) {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return `Today ${new Date(date).toLocaleTimeString("en-NG", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })}`;
  }
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return formatDate(date);
}

export default async function AdminDashboard() {
  const session = await auth();
  const [stats, weeklyRevenue, recentOrders] = await Promise.all([
    getDashboardStats(),
    getWeeklyRevenue(),
    getRecentOrders(5),
  ]);

  const maxRevenue = Math.max(...weeklyRevenue.map((d) => d.revenue), 1);

  const kpis = [
    {
      label: "Revenue (Month)",
      value: formatPrice(stats.revenueThisMonth),
      change:
        stats.revenueChange >= 0
          ? `↑ ${stats.revenueChange}% vs last month`
          : `↓ ${Math.abs(stats.revenueChange)}% vs last month`,
      up: stats.revenueChange >= 0,
    },
    {
      label: "Orders (Month)",
      value: String(stats.monthlyOrders),
      change:
        stats.orderChange >= 0
          ? `↑ ${stats.orderChange} more than last`
          : `↓ ${Math.abs(stats.orderChange)} less than last`,
      up: stats.orderChange >= 0,
    },
    {
      label: "Active Listings",
      value: String(stats.activeListings),
      change: `${stats.lowStockProducts} low stock`,
      up: stats.lowStockProducts === 0,
    },
    {
      label: "Pending Orders",
      value: String(stats.pendingOrders),
      change:
        stats.pendingOrders > 0
          ? `${stats.pendingOrders} need action`
          : "All caught up",
      up: stats.pendingOrders === 0 ? true : null,
    },
  ];

  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-light italic">
            {getGreeting()}, {session?.user?.firstName ?? "Mhiras"}
          </h1>
          <p className="text-sm text-charcoal-soft">
            {new Date().toLocaleDateString("en-NG", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <Link href="/admin/products?action=new">
          <Button size="sm">+ Add New Item</Button>
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="bg-white border border-border rounded-lg p-4"
          >
            <div className="text-xs uppercase tracking-wider text-charcoal-soft mb-1.5">
              {kpi.label}
            </div>
            <div className="text-3xl font-medium">{kpi.value}</div>
            <div
              className={`text-xs mt-1 ${
                kpi.up === true
                  ? "text-success"
                  : kpi.up === false
                    ? "text-danger"
                    : "text-warning"
              }`}
            >
              {kpi.change}
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="bg-white border border-border rounded-lg p-4 mb-5">
        <h3 className="text-sm font-medium mb-3.5">
          Revenue — Last 7 Days
        </h3>
        <div className="flex items-end gap-2 h-28">
          {weeklyRevenue.map((day, i) => {
            const height =
              maxRevenue > 0
                ? Math.max((day.revenue / maxRevenue) * 100, 4)
                : 4;
            return (
              <div
                key={i}
                className="flex-1 flex flex-col items-center gap-1"
              >
                <div
                  className="w-full bg-copper-light rounded-t hover:bg-copper transition-colors cursor-pointer"
                  style={{ height: `${height}%` }}
                  title={formatPrice(day.revenue)}
                />
                <span className="text-[9px] text-charcoal-soft">
                  {day.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="flex justify-between items-center mb-2.5">
        <h3 className="text-sm font-medium">Recent Orders</h3>
        <Link
          href="/admin/orders"
          className="text-sm text-copper hover:underline"
        >
          View all →
        </Link>
      </div>

      {recentOrders.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full bg-white border border-border rounded-lg overflow-hidden text-sm">
            <thead>
              <tr className="bg-cream-dark">
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-charcoal-soft font-medium">
                  Order ID
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
                  Status
                </th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-charcoal-soft font-medium">
                  Date
                </th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id} className="border-t border-border">
                  <td className="px-4 py-3 font-medium">
                    #{order.orderNumber}
                  </td>
                  <td className="px-4 py-3">
                    {order.user.firstName} {order.user.lastName}
                  </td>
                  <td className="px-4 py-3">
                    {order.items.length} item
                    {order.items.length !== 1 ? "s" : ""}
                  </td>
                  <td className="px-4 py-3">{formatPrice(order.total)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        statusStyles[order.status] ?? "pill"
                      }
                    >
                      {order.status.toLowerCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-charcoal-soft">
                    {formatRelativeDate(order.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-copper text-sm hover:underline"
                    >
                      {order.status === "DELIVERED" ||
                      order.status === "CANCELLED"
                        ? "View"
                        : "Manage"}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white border border-border rounded-lg p-8 text-center">
          <p className="text-sm text-charcoal-soft">
            No orders yet. They&apos;ll show up here once customers start placing
            orders.
          </p>
        </div>
      )}

      {/* Quick stats footer */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-5">
        <Link
          href="/admin/customers"
          className="bg-white border border-border rounded-lg p-4 hover:border-copper transition-colors"
        >
          <div className="text-xs uppercase tracking-wider text-charcoal-soft mb-1">
            Total Customers
          </div>
          <div className="text-2xl font-medium">{stats.totalCustomers}</div>
        </Link>
        <Link
          href="/admin/inventory?filter=low"
          className="bg-white border border-border rounded-lg p-4 hover:border-copper transition-colors"
        >
          <div className="text-xs uppercase tracking-wider text-charcoal-soft mb-1">
            Low Stock Items
          </div>
          <div className="text-2xl font-medium text-warning">
            {stats.lowStockProducts}
          </div>
        </Link>
        <Link
          href="/admin/products"
          className="bg-white border border-border rounded-lg p-4 hover:border-copper transition-colors"
        >
          <div className="text-xs uppercase tracking-wider text-charcoal-soft mb-1">
            Active Listings
          </div>
          <div className="text-2xl font-medium">{stats.activeListings}</div>
        </Link>
      </div>
    </>
  );
}
