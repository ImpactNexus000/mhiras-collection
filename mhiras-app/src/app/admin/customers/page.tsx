import Link from "next/link";
import { getAdminCustomers, getCustomerStats } from "@/lib/queries/admin";
import { formatPrice, formatDate } from "@/lib/utils";
import { CustomersSearch } from "@/components/admin/customers-search";

interface AdminCustomersPageProps {
  searchParams: Promise<{
    search?: string;
    page?: string;
  }>;
}

export default async function AdminCustomersPage({
  searchParams,
}: AdminCustomersPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page ?? "1", 10);
  const search = params.search;

  const [{ customers, total, totalPages }, stats] = await Promise.all([
    getAdminCustomers({ search }, page),
    getCustomerStats(),
  ]);

  const statCards = [
    {
      label: "Total Customers",
      value: String(stats.totalCustomers),
      change: `+${stats.newThisMonth} this month`,
    },
    {
      label: "Repeat Buyers",
      value: String(stats.repeatBuyers),
      change:
        stats.totalCustomers > 0
          ? `${Math.round((stats.repeatBuyers / stats.totalCustomers) * 100)}% of total`
          : "0% of total",
    },
    {
      label: "Avg. Order Value",
      value: formatPrice(stats.avgOrderValue),
      change: "",
    },
  ];

  return (
    <>
      <div className="flex justify-between items-center mb-5">
        <h1 className="font-display text-3xl md:text-4xl font-light italic">
          Customers
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
            {s.change && (
              <div className="text-xs text-charcoal-soft mt-1">{s.change}</div>
            )}
          </div>
        ))}
      </div>

      {/* Search */}
      <CustomersSearch initialSearch={search ?? ""} />

      {/* Customers table */}
      {customers.length > 0 ? (
        <div className="bg-white border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
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
                    Joined
                  </th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-charcoal-soft font-medium">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => {
                  const initials = `${c.firstName[0]}${c.lastName[0]}`;
                  const customerStatus =
                    c._count.orders === 0
                      ? "new"
                      : c._count.orders >= 5
                        ? "vip"
                        : "active";
                  const statusStyle =
                    customerStatus === "vip"
                      ? "bg-copper-light text-copper-dark"
                      : customerStatus === "new"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-green-100 text-green-700";

                  return (
                    <tr
                      key={c.id}
                      className="border-t border-border hover:bg-cream/50"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-copper/15 flex items-center justify-center text-xs font-medium text-copper flex-shrink-0">
                            {initials}
                          </div>
                          <div>
                            <div className="font-medium">
                              {c.firstName} {c.lastName}
                            </div>
                            <div className="text-xs text-charcoal-soft">
                              {c.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-charcoal-soft">
                        {c.phone ?? "—"}
                      </td>
                      <td className="px-4 py-3">{c._count.orders}</td>
                      <td className="px-4 py-3 font-medium">
                        {formatPrice(c.totalSpent)}
                      </td>
                      <td className="px-4 py-3 text-charcoal-soft text-xs">
                        {formatDate(c.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-medium uppercase ${statusStyle}`}
                        >
                          {customerStatus}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-cream-dark">
              <span className="text-xs text-charcoal-soft">
                Showing {(page - 1) * 20 + 1}–
                {Math.min(page * 20, total)} of {total} customers
              </span>
              <div className="flex gap-1">
                {page > 1 && (
                  <Link
                    href={`/admin/customers?${new URLSearchParams({
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
                      href={`/admin/customers?${new URLSearchParams({
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
                    href={`/admin/customers?${new URLSearchParams({
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
              ? `No customers found for "${search}"`
              : "No customers yet."}
          </p>
        </div>
      )}
    </>
  );
}
