import { Search, Filter, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const stats = [
  { label: "Total Customers", value: "312", change: "+18 this month" },
  { label: "Repeat Buyers", value: "89", change: "28% of total" },
  { label: "Avg. Order Value", value: "₦16,400", change: "↑ 8% vs last month" },
];

const customers = [
  { id: 1, name: "Amara Okonkwo", email: "amara@email.com", phone: "+234 801 234 5678", orders: 12, spent: "₦186,000", lastOrder: "Apr 9, 2026", status: "active" },
  { id: 2, name: "Fatima Bello", email: "fatima@email.com", phone: "+234 803 456 7890", orders: 8, spent: "₦124,500", lastOrder: "Apr 9, 2026", status: "active" },
  { id: 3, name: "Chioma Eze", email: "chioma@email.com", phone: "+234 805 678 1234", orders: 15, spent: "₦245,000", lastOrder: "Apr 8, 2026", status: "active" },
  { id: 4, name: "Kemi Adeyemi", email: "kemi@email.com", phone: "+234 807 890 1234", orders: 3, spent: "₦42,000", lastOrder: "Apr 8, 2026", status: "active" },
  { id: 5, name: "Blessing Nwosu", email: "blessing@email.com", phone: "+234 809 012 3456", orders: 6, spent: "₦89,500", lastOrder: "Apr 7, 2026", status: "active" },
  { id: 6, name: "Ngozi Obi", email: "ngozi@email.com", phone: "+234 802 345 6789", orders: 21, spent: "₦340,000", lastOrder: "Apr 6, 2026", status: "vip" },
  { id: 7, name: "Aisha Mohammed", email: "aisha@email.com", phone: "+234 804 567 8901", orders: 1, spent: "₦9,800", lastOrder: "Apr 5, 2026", status: "new" },
  { id: 8, name: "Temi Oladipo", email: "temi@email.com", phone: "+234 806 789 0123", orders: 4, spent: "₦58,000", lastOrder: "Apr 5, 2026", status: "active" },
];

const customerStatusStyles: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  vip: "bg-copper-light text-copper-dark",
  new: "bg-blue-100 text-blue-700",
};

export default function AdminCustomersPage() {
  return (
    <>
      <div className="flex justify-between items-center mb-5">
        <h1 className="font-display text-3xl md:text-4xl font-light italic">
          Customers
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
            <div className="text-xs text-charcoal-soft mt-1">{s.change}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white border border-border rounded-lg p-3 flex items-center gap-3 mb-4">
        <div className="flex-1 flex items-center gap-2 border border-border rounded px-3 py-2">
          <Search size={14} className="text-charcoal-soft" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            className="flex-1 text-sm outline-none bg-transparent"
          />
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2 border border-border rounded text-sm text-charcoal-soft hover:text-charcoal cursor-pointer transition-colors">
          <Filter size={14} />
          Filters
        </button>
      </div>

      {/* Customers table */}
      <div className="bg-white border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-cream-dark">
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-charcoal-soft font-medium">
                Customer
              </th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-charcoal-soft font-medium">
                Phone
              </th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-charcoal-soft font-medium">
                Orders
              </th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-charcoal-soft font-medium">
                Total Spent
              </th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-charcoal-soft font-medium">
                Last Order
              </th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-charcoal-soft font-medium">
                Status
              </th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-t border-border hover:bg-cream/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-copper/15 flex items-center justify-center text-xs font-medium text-copper flex-shrink-0">
                      {c.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <div className="font-medium">{c.name}</div>
                      <div className="text-xs text-charcoal-soft">{c.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-charcoal-soft">{c.phone}</td>
                <td className="px-4 py-3">{c.orders}</td>
                <td className="px-4 py-3 font-medium">{c.spent}</td>
                <td className="px-4 py-3 text-charcoal-soft text-xs">{c.lastOrder}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium uppercase ${customerStatusStyles[c.status]}`}>
                    {c.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button className="text-copper text-sm hover:text-copper-dark cursor-pointer">
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-cream-dark">
          <span className="text-xs text-charcoal-soft">
            Showing 1–8 of 312 customers
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
              Next
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
