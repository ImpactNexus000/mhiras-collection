import { Search, Filter, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const stats = [
  { label: "Revenue (April)", value: "₦384,500", change: "↑ 23% vs March" },
  { label: "Successful Payments", value: "44", change: "93.6% success rate" },
  { label: "Pending Payouts", value: "₦62,000", change: "3 transactions" },
];

type PaymentStatus = "successful" | "pending" | "failed" | "refunded";

const paymentStatusStyles: Record<PaymentStatus, string> = {
  successful: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  failed: "bg-red-100 text-red-600",
  refunded: "bg-gray-100 text-gray-600",
};

const payments = [
  { id: "PAY-3948573920", order: "MH-0847", customer: "Amara Okonkwo", amount: "₦25,500", method: "Paystack", status: "successful" as PaymentStatus, date: "Apr 9, 2:15 PM" },
  { id: "PAY-3948573919", order: "MH-0846", customer: "Fatima Bello", amount: "₦10,000", method: "Bank Transfer", status: "successful" as PaymentStatus, date: "Apr 9, 11:22 AM" },
  { id: "PAY-3948573918", order: "MH-0845", customer: "Chioma Eze", amount: "₦32,500", method: "Paystack", status: "pending" as PaymentStatus, date: "Apr 8, 4:32 PM" },
  { id: "PAY-3948573917", order: "MH-0844", customer: "Kemi Adeyemi", amount: "₦15,500", method: "Flutterwave", status: "refunded" as PaymentStatus, date: "Apr 8, 1:10 PM" },
  { id: "PAY-3948573916", order: "MH-0843", customer: "Blessing Nwosu", amount: "₦21,000", method: "Paystack", status: "successful" as PaymentStatus, date: "Apr 7, 9:48 AM" },
  { id: "PAY-3948573915", order: "MH-0842", customer: "Ngozi Obi", amount: "₦43,500", method: "Bank Transfer", status: "successful" as PaymentStatus, date: "Apr 6, 3:25 PM" },
  { id: "PAY-3948573914", order: "MH-0841", customer: "Aisha Mohammed", amount: "₦11,300", method: "Paystack", status: "successful" as PaymentStatus, date: "Apr 5, 10:15 AM" },
  { id: "PAY-3948573913", order: "—", customer: "Temi Oladipo", amount: "₦23,500", method: "Flutterwave", status: "failed" as PaymentStatus, date: "Apr 5, 8:35 AM" },
];

export default function AdminPaymentsPage() {
  return (
    <>
      <div className="flex justify-between items-center mb-5">
        <h1 className="font-display text-3xl md:text-4xl font-light italic">
          Payments
        </h1>
        <Button size="sm" variant="outline">
          <Download size={14} className="mr-1.5" />
          Export
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {stats.map((s) => (
          <div key={s.label} className="bg-white border border-border rounded-lg p-4">
            <div className="text-xs uppercase tracking-wider text-charcoal-soft mb-1.5">
              {s.label}
            </div>
            <div className="text-3xl font-medium">{s.value}</div>
            <div className="text-xs text-success mt-1">{s.change}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white border border-border rounded-lg p-3 flex items-center gap-3 mb-4">
        <div className="flex-1 flex items-center gap-2 border border-border rounded px-3 py-2">
          <Search size={14} className="text-charcoal-soft" />
          <input
            type="text"
            placeholder="Search by payment ID, order, or customer..."
            className="flex-1 text-sm outline-none bg-transparent"
          />
        </div>
        <select className="border border-border rounded px-3 py-2 text-sm text-charcoal-soft outline-none cursor-pointer bg-white">
          <option>All Methods</option>
          <option>Paystack</option>
          <option>Flutterwave</option>
          <option>Bank Transfer</option>
        </select>
        <select className="border border-border rounded px-3 py-2 text-sm text-charcoal-soft outline-none cursor-pointer bg-white">
          <option>All Statuses</option>
          <option>Successful</option>
          <option>Pending</option>
          <option>Failed</option>
          <option>Refunded</option>
        </select>
        <button className="flex items-center gap-1.5 px-3 py-2 border border-border rounded text-sm text-charcoal-soft hover:text-charcoal cursor-pointer transition-colors">
          <Filter size={14} />
          More
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-cream-dark">
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-charcoal-soft font-medium">
                Payment ID
              </th>
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
                Status
              </th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-charcoal-soft font-medium">
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id} className="border-t border-border hover:bg-cream/50">
                <td className="px-4 py-3 font-mono text-xs">{p.id}</td>
                <td className="px-4 py-3 font-medium">
                  {p.order !== "—" ? `#${p.order}` : "—"}
                </td>
                <td className="px-4 py-3">{p.customer}</td>
                <td className="px-4 py-3 font-medium">{p.amount}</td>
                <td className="px-4 py-3 text-charcoal-soft">{p.method}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${paymentStatusStyles[p.status]}`}>
                    {p.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-charcoal-soft text-xs">{p.date}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-cream-dark">
          <span className="text-xs text-charcoal-soft">
            Showing 1–8 of 47 payments
          </span>
          <div className="flex gap-1">
            <button className="px-3 py-1.5 text-xs border border-border rounded bg-white cursor-pointer hover:bg-cream-dark">
              Previous
            </button>
            <button className="px-3 py-1.5 text-xs border border-copper rounded bg-copper text-white">
              1
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
