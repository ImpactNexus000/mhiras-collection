import { Button } from "@/components/ui/button";
import { Search, Filter, Plus } from "lucide-react";

type ProductStatus = "active" | "draft" | "sold";

const statusStyles: Record<ProductStatus, string> = {
  active: "bg-green-100 text-green-700",
  draft: "bg-gray-100 text-gray-600",
  sold: "bg-copper-light text-copper-dark",
};

const products = [
  { id: 1, name: "Vintage Denim Jacket", category: "Jackets", size: "M", condition: "Like New", price: "₦12,000", stock: 1, status: "active" as ProductStatus, views: 234 },
  { id: 2, name: "Silk Midi Skirt", category: "Skirts", size: "S", condition: "Good", price: "₦8,500", stock: 1, status: "active" as ProductStatus, views: 189 },
  { id: 3, name: "Oversized Linen Blazer", category: "Blazers", size: "L", condition: "Like New", price: "₦15,000", stock: 1, status: "active" as ProductStatus, views: 156 },
  { id: 4, name: "Floral Wrap Dress", category: "Dresses", size: "M", condition: "Good", price: "₦10,000", stock: 0, status: "sold" as ProductStatus, views: 312 },
  { id: 5, name: "Cashmere Cardigan", category: "Knitwear", size: "M", condition: "Fair", price: "₦7,500", stock: 1, status: "draft" as ProductStatus, views: 0 },
  { id: 6, name: "Wide-Leg Trousers", category: "Trousers", size: "S", condition: "Like New", price: "₦9,000", stock: 2, status: "active" as ProductStatus, views: 98 },
  { id: 7, name: "Leather Crossbody Bag", category: "Bags", size: "One Size", condition: "Good", price: "₦14,000", stock: 1, status: "active" as ProductStatus, views: 275 },
  { id: 8, name: "Pleated Maxi Skirt", category: "Skirts", size: "M", condition: "Like New", price: "₦11,500", stock: 0, status: "sold" as ProductStatus, views: 201 },
];

const tabs = [
  { label: "All Products", count: 134 },
  { label: "Active", count: 98 },
  { label: "Draft", count: 12 },
  { label: "Sold Out", count: 24 },
];

export default function AdminProductsPage() {
  return (
    <>
      <div className="flex justify-between items-center mb-5">
        <h1 className="font-display text-3xl md:text-4xl font-light italic">
          Products
        </h1>
        <Button size="sm">
          <Plus size={14} className="mr-1.5" />
          Add Product
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

      {/* Search bar */}
      <div className="bg-white border border-border rounded-lg p-3 flex items-center gap-3 mb-4">
        <div className="flex-1 flex items-center gap-2 border border-border rounded px-3 py-2">
          <Search size={14} className="text-charcoal-soft" />
          <input
            type="text"
            placeholder="Search products by name, category..."
            className="flex-1 text-sm outline-none bg-transparent"
          />
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2 border border-border rounded text-sm text-charcoal-soft hover:text-charcoal cursor-pointer transition-colors">
          <Filter size={14} />
          Filters
        </button>
      </div>

      {/* Products table */}
      <div className="bg-white border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-cream-dark">
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-charcoal-soft font-medium">
                <input type="checkbox" className="accent-copper" />
              </th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-charcoal-soft font-medium">
                Product
              </th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-charcoal-soft font-medium">
                Category
              </th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-charcoal-soft font-medium">
                Size
              </th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-charcoal-soft font-medium">
                Condition
              </th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-charcoal-soft font-medium">
                Price
              </th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-charcoal-soft font-medium">
                Stock
              </th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-charcoal-soft font-medium">
                Status
              </th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-charcoal-soft font-medium">
                Views
              </th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-t border-border hover:bg-cream/50">
                <td className="px-4 py-3">
                  <input type="checkbox" className="accent-copper" />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-12 bg-gradient-to-br from-cream-dark to-gold/30 rounded flex-shrink-0" />
                    <span className="font-medium">{product.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-charcoal-soft">{product.category}</td>
                <td className="px-4 py-3">{product.size}</td>
                <td className="px-4 py-3 text-charcoal-soft">{product.condition}</td>
                <td className="px-4 py-3 font-medium">{product.price}</td>
                <td className="px-4 py-3">
                  <span className={product.stock === 0 ? "text-danger" : ""}>
                    {product.stock}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${statusStyles[product.status]}`}>
                    {product.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-charcoal-soft">{product.views}</td>
                <td className="px-4 py-3">
                  <button className="text-copper text-sm hover:text-copper-dark cursor-pointer">
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-cream-dark">
          <span className="text-xs text-charcoal-soft">
            Showing 1–8 of 134 products
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
