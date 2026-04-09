import { Search, AlertTriangle, Package, TrendingDown } from "lucide-react";

const stats = [
  { label: "Total SKUs", value: "134", icon: Package, color: "text-copper" },
  { label: "Low Stock (≤2)", value: "18", icon: AlertTriangle, color: "text-warning" },
  { label: "Out of Stock", value: "24", icon: TrendingDown, color: "text-danger" },
];

const inventory = [
  { id: 1, name: "Vintage Denim Jacket", sku: "MH-DJ-001", category: "Jackets", stock: 1, sold: 4, status: "low" },
  { id: 2, name: "Silk Midi Skirt", sku: "MH-SK-012", category: "Skirts", stock: 1, sold: 7, status: "low" },
  { id: 3, name: "Oversized Linen Blazer", sku: "MH-BL-003", category: "Blazers", stock: 1, sold: 2, status: "low" },
  { id: 4, name: "Floral Wrap Dress", sku: "MH-DR-008", category: "Dresses", stock: 0, sold: 12, status: "out" },
  { id: 5, name: "Cashmere Cardigan", sku: "MH-KN-005", category: "Knitwear", stock: 1, sold: 0, status: "ok" },
  { id: 6, name: "Wide-Leg Trousers", sku: "MH-TR-002", category: "Trousers", stock: 2, sold: 3, status: "ok" },
  { id: 7, name: "Leather Crossbody Bag", sku: "MH-BG-004", category: "Bags", stock: 1, sold: 9, status: "low" },
  { id: 8, name: "Pleated Maxi Skirt", sku: "MH-SK-015", category: "Skirts", stock: 0, sold: 6, status: "out" },
  { id: 9, name: "Corduroy Jacket", sku: "MH-DJ-009", category: "Jackets", stock: 2, sold: 1, status: "ok" },
  { id: 10, name: "Satin Blouse", sku: "MH-TP-011", category: "Tops", stock: 0, sold: 5, status: "out" },
];

const stockStyles: Record<string, string> = {
  ok: "bg-green-100 text-green-700",
  low: "bg-yellow-100 text-yellow-700",
  out: "bg-red-100 text-red-600",
};

const stockLabels: Record<string, string> = {
  ok: "In Stock",
  low: "Low Stock",
  out: "Out of Stock",
};

export default function AdminInventoryPage() {
  return (
    <>
      <h1 className="font-display text-3xl md:text-4xl font-light italic mb-5">
        Inventory
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {stats.map((s) => (
          <div key={s.label} className="bg-white border border-border rounded-lg p-4 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-lg bg-cream-dark flex items-center justify-center ${s.color}`}>
              <s.icon size={20} />
            </div>
            <div>
              <div className="text-2xl font-medium">{s.value}</div>
              <div className="text-xs text-charcoal-soft">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search + filter */}
      <div className="bg-white border border-border rounded-lg p-3 flex items-center gap-3 mb-4">
        <div className="flex-1 flex items-center gap-2 border border-border rounded px-3 py-2">
          <Search size={14} className="text-charcoal-soft" />
          <input
            type="text"
            placeholder="Search by product name or SKU..."
            className="flex-1 text-sm outline-none bg-transparent"
          />
        </div>
        <select className="border border-border rounded px-3 py-2 text-sm text-charcoal-soft outline-none cursor-pointer bg-white">
          <option>All Stock Levels</option>
          <option>In Stock</option>
          <option>Low Stock</option>
          <option>Out of Stock</option>
        </select>
        <select className="border border-border rounded px-3 py-2 text-sm text-charcoal-soft outline-none cursor-pointer bg-white">
          <option>All Categories</option>
          <option>Jackets</option>
          <option>Skirts</option>
          <option>Dresses</option>
          <option>Blazers</option>
          <option>Tops</option>
          <option>Bags</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-cream-dark">
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-charcoal-soft font-medium">
                Product
              </th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-charcoal-soft font-medium">
                SKU
              </th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-charcoal-soft font-medium">
                Category
              </th>
              <th className="text-center px-4 py-3 text-xs uppercase tracking-wider text-charcoal-soft font-medium">
                In Stock
              </th>
              <th className="text-center px-4 py-3 text-xs uppercase tracking-wider text-charcoal-soft font-medium">
                Total Sold
              </th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-charcoal-soft font-medium">
                Status
              </th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((item) => (
              <tr key={item.id} className="border-t border-border hover:bg-cream/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-12 bg-gradient-to-br from-cream-dark to-gold/30 rounded flex-shrink-0" />
                    <span className="font-medium">{item.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-charcoal-soft">
                  {item.sku}
                </td>
                <td className="px-4 py-3 text-charcoal-soft">{item.category}</td>
                <td className="px-4 py-3 text-center">
                  <span className={item.stock === 0 ? "text-danger font-medium" : ""}>
                    {item.stock}
                  </span>
                </td>
                <td className="px-4 py-3 text-center text-charcoal-soft">
                  {item.sold}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${stockStyles[item.status]}`}>
                    {stockLabels[item.status]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button className="text-copper text-sm hover:text-copper-dark cursor-pointer">
                    Update
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
