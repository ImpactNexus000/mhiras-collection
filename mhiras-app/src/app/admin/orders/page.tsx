import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Search, Filter, Download } from "lucide-react";

type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

const statusStyles: Record<OrderStatus, string> = {
  pending: "pill pill-pending",
  processing: "pill pill-processing",
  shipped: "pill pill-shipped",
  delivered: "pill pill-delivered",
  cancelled: "pill pill-cancelled",
};

const orders = [
  { id: "MH-0847", customer: "Amara Okonkwo", email: "amara@email.com", items: 2, amount: "₦24,000", status: "processing" as OrderStatus, payment: "Paystack", date: "Apr 9, 2026 2:14 PM" },
  { id: "MH-0846", customer: "Fatima Bello", email: "fatima@email.com", items: 1, amount: "₦8,500", status: "delivered" as OrderStatus, payment: "Bank Transfer", date: "Apr 9, 2026 11:20 AM" },
  { id: "MH-0845", customer: "Chioma Eze", email: "chioma@email.com", items: 3, amount: "₦31,000", status: "pending" as OrderStatus, payment: "Paystack", date: "Apr 8, 2026 4:30 PM" },
  { id: "MH-0844", customer: "Kemi Adeyemi", email: "kemi@email.com", items: 1, amount: "₦14,000", status: "cancelled" as OrderStatus, payment: "Flutterwave", date: "Apr 8, 2026 1:05 PM" },
  { id: "MH-0843", customer: "Blessing Nwosu", email: "blessing@email.com", items: 2, amount: "₦19,500", status: "shipped" as OrderStatus, payment: "Paystack", date: "Apr 7, 2026 9:45 AM" },
  { id: "MH-0842", customer: "Ngozi Obi", email: "ngozi@email.com", items: 4, amount: "₦42,000", status: "delivered" as OrderStatus, payment: "Bank Transfer", date: "Apr 6, 2026 3:20 PM" },
  { id: "MH-0841", customer: "Aisha Mohammed", email: "aisha@email.com", items: 1, amount: "₦9,800", status: "delivered" as OrderStatus, payment: "Paystack", date: "Apr 5, 2026 10:10 AM" },
  { id: "MH-0840", customer: "Temi Oladipo", email: "temi@email.com", items: 2, amount: "₦22,000", status: "processing" as OrderStatus, payment: "Flutterwave", date: "Apr 5, 2026 8:30 AM" },
];

const tabs: { label: string; count: number }[] = [
  { label: "All Orders", count: 47 },
  { label: "Pending", count: 9 },
  { label: "Processing", count: 5 },
  { label: "Shipped", count: 3 },
  { label: "Delivered", count: 28 },
  { label: "Cancelled", count: 2 },
];

export default function AdminOrdersPage() {
  return (
    <>
      <div className="flex justify-between items-center mb-5">
        <h1 className="font-display text-3xl md:text-4xl font-light italic">
          Orders
        </h1>
        <Button size="sm" variant="outline">
          <Download size={14} className="mr-1.5" />
          Export CSV
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto mb-4">
        {tabs.map((tab, i) => (
          <button
            key={tab.label}
            className={`px-4 py-2 text-sm whitespace-nowrap rounded-t-lg cursor-pointer transition-colors ${
              i === 0
                ? "bg-white text-charcoal border border-border border-b-white -mb-px z-10"
                : "text-charcoal-soft hover:text-charcoal"
            }`}
          >
            {tab.label}{" "}
            <span className="text-xs text-charcoal-soft">({tab.count})</span>
          </button>
        ))}
      </div>

      {/* Filters bar */}
      <div className="bg-white border border-border rounded-lg p-3 flex items-center gap-3 mb-4">
        <div className="flex-1 flex items-center gap-2 border border-border rounded px-3 py-2">
          <Search size={14} className="text-charcoal-soft" />
          <input
            type="text"
            placeholder="Search by order ID, customer name, or email..."
            className="flex-1 text-sm outline-none bg-transparent"
          />
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2 border border-border rounded text-sm text-charcoal-soft hover:text-charcoal cursor-pointer transition-colors">
          <Filter size={14} />
          Filters
        </button>
      </div>

      {/* Orders table */}
      <div className="bg-white border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-cream-dark">
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-charcoal-soft font-medium">
                <input type="checkbox" className="accent-copper" />
              </th>
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
              <tr key={order.id} className="border-t border-border hover:bg-cream/50">
                <td className="px-4 py-3">
                  <input type="checkbox" className="accent-copper" />
                </td>
                <td className="px-4 py-3 font-medium">#{order.id}</td>
                <td className="px-4 py-3">
                  <div>{order.customer}</div>
                  <div className="text-xs text-charcoal-soft">{order.email}</div>
                </td>
                <td className="px-4 py-3">{order.items}</td>
                <td className="px-4 py-3 font-medium">{order.amount}</td>
                <td className="px-4 py-3 text-charcoal-soft">{order.payment}</td>
                <td className="px-4 py-3">
                  <span className={statusStyles[order.status]}>
                    {order.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-charcoal-soft text-xs">
                  {order.date}
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

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-cream-dark">
          <span className="text-xs text-charcoal-soft">
            Showing 1–8 of 47 orders
          </span>
          <div className="flex gap-1">
            <button className="px-3 py-1.5 text-xs border border-border rounded bg-white cursor-pointer hover:bg-cream-dark">
              Previous
            </button>
            <button className="px-3 py-1.5 text-xs border border-copper rounded bg-copper text-white">
              1
            </button>
            <button className="px-3 py-1.5 text-xs border border-border rounded bg-white cursor-pointer hover:bg-cream-dark">
              2
            </button>
            <button className="px-3 py-1.5 text-xs border border-border rounded bg-white cursor-pointer hover:bg-cream-dark">
              3
            </button>
            <button className="px-3 py-1.5 text-xs border border-border rounded bg-white cursor-pointer hover:bg-cream-dark">
              Next
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
