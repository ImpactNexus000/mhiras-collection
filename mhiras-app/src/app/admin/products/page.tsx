import Link from "next/link";
import { getAdminProducts, getProductStatusCounts } from "@/lib/queries/admin";
import { getCategories } from "@/lib/queries/products";
import { formatPrice } from "@/lib/utils";
import { ProductsClient } from "@/components/admin/products-client";
import { db } from "@/lib/db";
import { getOptimizedUrl } from "@/lib/cloudinary";

const conditionLabel: Record<string, string> = {
  LIKE_NEW: "Like New",
  GOOD: "Good",
  FAIR: "Fair",
};

const statusStyles: Record<string, string> = {
  PUBLISHED: "bg-green-100 text-green-700",
  DRAFT: "bg-gray-100 text-gray-600",
  SOLD_OUT: "bg-copper-light text-copper-dark",
  ARCHIVED: "bg-gray-100 text-gray-500",
};

interface AdminProductsPageProps {
  searchParams: Promise<{
    status?: string;
    category?: string;
    search?: string;
    page?: string;
    action?: string;
    edit?: string;
  }>;
}

export default async function AdminProductsPage({
  searchParams,
}: AdminProductsPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page ?? "1", 10);
  const status = params.status;
  const search = params.search;
  const category = params.category;
  const showNewForm = params.action === "new";

  const { products, total, totalPages } = await getAdminProducts(
    { status, category, search },
    page
  );
  const [categories, counts] = await Promise.all([
    getCategories(),
    getProductStatusCounts(),
  ]);

  const tabs = [
    { label: "All Products", count: counts.all, href: "/admin/products" },
    { label: "Active", count: counts.published, href: "/admin/products?status=PUBLISHED" },
    { label: "Draft", count: counts.draft, href: "/admin/products?status=DRAFT" },
    { label: "Sold Out", count: counts.soldOut, href: "/admin/products?status=SOLD_OUT" },
  ];

  const activeTab = status
    ? tabs.findIndex((t) => t.href.includes(`status=${status}`))
    : 0;

  const categoriesForForm = categories.map((c) => ({
    id: c.id,
    name: c.name,
  }));

  // Fetch product for editing if edit param is present
  let editProduct = null;
  if (params.edit) {
    const product = await db.product.findUnique({
      where: { id: params.edit },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
      },
    });
    if (product) {
      editProduct = {
        id: product.id,
        name: product.name,
        description: product.description,
        categoryId: product.categoryId,
        size: product.size,
        condition: product.condition,
        sellingPrice: product.sellingPrice,
        originalPrice: product.originalPrice,
        stock: product.stock,
        status: product.status,
        featured: product.featured,
        images: product.images.map((img) => ({
          id: img.id,
          url: img.url,
          alt: img.alt,
          sortOrder: img.sortOrder,
          isPrimary: img.isPrimary,
        })),
      };
    }
  }

  return (
    <ProductsClient
      categories={categoriesForForm}
      showNewForm={showNewForm}
      editProduct={editProduct}
    >
      <div className="flex justify-between items-center mb-5">
        <h1 className="font-display text-3xl md:text-4xl font-light italic">
          Products
        </h1>
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

      {/* Products table */}
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
                    Sold
                  </th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr
                    key={product.id}
                    className="border-t border-border hover:bg-cream/50"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {product.images[0]?.url ? (
                          <img
                            src={getOptimizedUrl(product.images[0].url, { width: 80, height: 96 })}
                            alt={product.name}
                            className="w-10 h-12 object-cover rounded flex-shrink-0"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-10 h-12 bg-gradient-to-br from-cream-dark to-gold/30 rounded flex-shrink-0" />
                        )}
                        <span className="font-medium">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-charcoal-soft">
                      {product.category.name}
                    </td>
                    <td className="px-4 py-3">{product.size ?? "—"}</td>
                    <td className="px-4 py-3 text-charcoal-soft">
                      {conditionLabel[product.condition] ?? product.condition}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {formatPrice(product.sellingPrice)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={product.stock === 0 ? "text-danger" : ""}
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          statusStyles[product.status] ?? "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {product.status === "PUBLISHED"
                          ? "Active"
                          : product.status === "SOLD_OUT"
                            ? "Sold Out"
                            : product.status.toLowerCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-charcoal-soft">
                      {product._count.orderItems}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/products?edit=${product.id}`}
                        className="text-copper text-sm hover:text-copper-dark"
                      >
                        Edit
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
                {Math.min(page * 20, total)} of {total} products
              </span>
              <div className="flex gap-1">
                {page > 1 && (
                  <Link
                    href={`/admin/products?${new URLSearchParams({
                      ...(status ? { status } : {}),
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
                      href={`/admin/products?${new URLSearchParams({
                        ...(status ? { status } : {}),
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
                    href={`/admin/products?${new URLSearchParams({
                      ...(status ? { status } : {}),
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
          <p className="text-charcoal-soft mb-4">
            {search
              ? `No products found for "${search}"`
              : "No products in this category yet."}
          </p>
          <Link href="/admin/products?action=new">
            <button className="text-sm text-copper hover:underline cursor-pointer">
              + Add your first product
            </button>
          </Link>
        </div>
      )}
    </ProductsClient>
  );
}
