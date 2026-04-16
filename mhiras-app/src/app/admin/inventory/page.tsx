import Link from "next/link";
import { getInventorySummary, getInventoryProducts } from "@/lib/queries/admin";
import { formatPrice } from "@/lib/utils";
import { AlertTriangle, Package, TrendingDown, CheckCircle } from "lucide-react";
import { StockUpdateCell } from "@/components/admin/stock-update-cell";

const stockStatusStyles: Record<string, string> = {
  ok: "bg-green-100 text-green-700",
  low: "bg-yellow-100 text-yellow-700",
  out: "bg-red-100 text-red-600",
};

const stockStatusLabels: Record<string, string> = {
  ok: "In Stock",
  low: "Low Stock",
  out: "Out of Stock",
};

function getStockStatus(stock: number) {
  if (stock === 0) return "out";
  if (stock <= 3) return "low";
  return "ok";
}

interface AdminInventoryPageProps {
  searchParams: Promise<{
    filter?: string;
    page?: string;
  }>;
}

export default async function AdminInventoryPage({
  searchParams,
}: AdminInventoryPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page ?? "1", 10);
  const filter = (params.filter as "all" | "low" | "out") ?? "all";

  const [summary, { products, total, totalPages }] = await Promise.all([
    getInventorySummary(),
    getInventoryProducts(filter, page),
  ]);

  const statCards = [
    {
      label: "Total Products",
      value: String(summary.totalProducts),
      icon: Package,
      color: "text-copper",
      href: "/admin/inventory",
    },
    {
      label: "In Stock",
      value: String(summary.inStock),
      icon: CheckCircle,
      color: "text-success",
      href: "/admin/inventory",
    },
    {
      label: "Low Stock (1–3)",
      value: String(summary.lowStock),
      icon: AlertTriangle,
      color: "text-warning",
      href: "/admin/inventory?filter=low",
    },
    {
      label: "Out of Stock",
      value: String(summary.outOfStock),
      icon: TrendingDown,
      color: "text-danger",
      href: "/admin/inventory?filter=out",
    },
  ];

  const tabs = [
    { label: "All", value: "all", count: summary.totalProducts, href: "/admin/inventory" },
    { label: "Low Stock", value: "low", count: summary.lowStock, href: "/admin/inventory?filter=low" },
    { label: "Out of Stock", value: "out", count: summary.outOfStock, href: "/admin/inventory?filter=out" },
  ];

  return (
    <>
      <h1 className="font-display text-3xl md:text-4xl font-light italic mb-5">
        Inventory
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {statCards.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="bg-white border border-border rounded-lg p-4 flex items-center gap-4 hover:border-copper transition-colors"
          >
            <div
              className={`w-10 h-10 rounded-lg bg-cream-dark flex items-center justify-center ${s.color}`}
            >
              <s.icon size={20} />
            </div>
            <div>
              <div className="text-2xl font-medium">{s.value}</div>
              <div className="text-xs text-charcoal-soft">{s.label}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Inventory value */}
      <div className="bg-white border border-border rounded-lg p-4 mb-5">
        <div className="text-xs uppercase tracking-wider text-charcoal-soft mb-1">
          Total Inventory Value
        </div>
        <div className="text-2xl font-medium text-copper">
          {formatPrice(summary.totalValue)}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto mb-4">
        {tabs.map((tab) => (
          <Link
            key={tab.value}
            href={tab.href}
            className={`px-4 py-2 text-sm whitespace-nowrap rounded-t-lg transition-colors ${
              tab.value === filter
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
      {products.length > 0 ? (
        <div className="bg-white border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-cream-dark">
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-charcoal-soft font-medium">
                    Product
                  </th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-charcoal-soft font-medium">
                    Category
                  </th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-charcoal-soft font-medium">
                    Price
                  </th>
                  <th className="text-center px-4 py-3 text-xs uppercase tracking-wider text-charcoal-soft font-medium">
                    Stock
                  </th>
                  <th className="text-center px-4 py-3 text-xs uppercase tracking-wider text-charcoal-soft font-medium">
                    Sold
                  </th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-charcoal-soft font-medium">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const status = getStockStatus(product.stock);
                  return (
                    <tr
                      key={product.id}
                      className="border-t border-border hover:bg-cream/50"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {product.images[0]?.url ? (
                            <img
                              src={product.images[0].url}
                              alt={product.name}
                              className="w-10 h-12 object-cover rounded flex-shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-12 bg-gradient-to-br from-cream-dark to-gold/30 rounded flex-shrink-0" />
                          )}
                          <div>
                            <span className="font-medium">{product.name}</span>
                            {product.size && (
                              <div className="text-xs text-charcoal-soft">
                                Size: {product.size}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-charcoal-soft">
                        {product.category.name}
                      </td>
                      <td className="px-4 py-3">
                        {formatPrice(product.sellingPrice)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <StockUpdateCell
                          productId={product.id}
                          currentStock={product.stock}
                        />
                      </td>
                      <td className="px-4 py-3 text-center text-charcoal-soft">
                        {product._count.orderItems}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-medium ${stockStatusStyles[status]}`}
                        >
                          {stockStatusLabels[status]}
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
                {Math.min(page * 20, total)} of {total} products
              </span>
              <div className="flex gap-1">
                {page > 1 && (
                  <Link
                    href={`/admin/inventory?${new URLSearchParams({
                      ...(filter !== "all" ? { filter } : {}),
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
                      href={`/admin/inventory?${new URLSearchParams({
                        ...(filter !== "all" ? { filter } : {}),
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
                    href={`/admin/inventory?${new URLSearchParams({
                      ...(filter !== "all" ? { filter } : {}),
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
            {filter === "low"
              ? "No low stock products."
              : filter === "out"
                ? "No out-of-stock products."
                : "No products in inventory."}
          </p>
        </div>
      )}
    </>
  );
}
