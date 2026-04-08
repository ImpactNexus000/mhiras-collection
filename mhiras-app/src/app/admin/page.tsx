import { Button } from "@/components/ui/button";

const kpis = [
  { label: "Revenue (Month)", value: "₦384,500", change: "↑ 23% vs last month", up: true },
  { label: "Orders (Month)", value: "47", change: "↑ 12 more than last", up: true },
  { label: "Active Listings", value: "134", change: "↓ 8 sold today", up: false },
  { label: "Pending Orders", value: "9", change: "3 need action", up: null },
];

const recentOrders = [
  { id: "#MH-0847", customer: "Amara Okonkwo", items: 2, amount: "₦24,000", status: "processing", date: "Today 2:14 PM" },
  { id: "#MH-0846", customer: "Fatima Bello", items: 1, amount: "₦8,500", status: "delivered", date: "Today 11:20 AM" },
  { id: "#MH-0845", customer: "Chioma Eze", items: 3, amount: "₦31,000", status: "pending", date: "Yesterday" },
  { id: "#MH-0844", customer: "Kemi Adeyemi", items: 1, amount: "₦14,000", status: "cancelled", date: "Yesterday" },
];

const barHeights = [55, 72, 40, 90, 65, 85, 60];
const barLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function AdminDashboard() {
  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-light italic">
            Good afternoon, Mhiras
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
        <Button size="sm">+ Add New Item</Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3 mb-5">
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
          {barHeights.map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full bg-copper-light rounded-t hover:bg-copper transition-colors cursor-pointer"
                style={{ height: `${h}%` }}
              />
              <span className="text-[9px] text-charcoal-soft">
                {barLabels[i]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="flex justify-between items-center mb-2.5">
        <h3 className="text-sm font-medium">Recent Orders</h3>
        <span className="text-sm text-copper cursor-pointer">
          View all &rarr;
        </span>
      </div>
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
              <td className="px-4 py-3 font-medium">{order.id}</td>
              <td className="px-4 py-3">{order.customer}</td>
              <td className="px-4 py-3">
                {order.items} item{order.items > 1 ? "s" : ""}
              </td>
              <td className="px-4 py-3">{order.amount}</td>
              <td className="px-4 py-3">
                <span className={`pill pill-${order.status}`}>
                  {order.status}
                </span>
              </td>
              <td className="px-4 py-3 text-charcoal-soft">
                {order.date}
              </td>
              <td className="px-4 py-3 text-copper text-sm cursor-pointer">
                {order.status === "delivered" || order.status === "cancelled"
                  ? "View"
                  : "Manage"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
