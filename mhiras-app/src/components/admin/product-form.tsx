"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProduct, updateProduct } from "@/app/actions/products";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface Category {
  id: string;
  name: string;
}

interface ProductData {
  id: string;
  name: string;
  description: string | null;
  categoryId: string;
  size: string | null;
  condition: string;
  sellingPrice: number;
  originalPrice: number | null;
  stock: number;
  status: string;
  featured: boolean;
}

interface ProductFormProps {
  categories: Category[];
  product?: ProductData;
  onClose: () => void;
}

export function ProductForm({ categories, product, onClose }: ProductFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const isEditing = !!product;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    const result = isEditing
      ? await updateProduct(product!.id, formData)
      : await createProduct(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.refresh();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 bg-black/40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-white z-10">
          <h2 className="font-display text-xl font-light italic">
            {isEditing ? "Edit Product" : "New Product"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center hover:bg-cream-dark rounded cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="text-sm text-danger bg-danger/10 px-3 py-2 rounded">
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-charcoal-soft mb-1.5">
              Product Name *
            </label>
            <input
              name="name"
              type="text"
              required
              defaultValue={product?.name ?? ""}
              className="w-full border border-border px-3 py-2.5 text-sm rounded outline-none focus:border-copper"
              placeholder="e.g. Vintage Wrap Dress"
            />
          </div>

          {/* Category + Condition */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs uppercase tracking-wider text-charcoal-soft mb-1.5">
                Category *
              </label>
              <select
                name="categoryId"
                required
                defaultValue={product?.categoryId ?? ""}
                className="w-full border border-border px-3 py-2.5 text-sm rounded outline-none focus:border-copper bg-white"
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-charcoal-soft mb-1.5">
                Condition
              </label>
              <select
                name="condition"
                defaultValue={product?.condition ?? "GOOD"}
                className="w-full border border-border px-3 py-2.5 text-sm rounded outline-none focus:border-copper bg-white"
              >
                <option value="LIKE_NEW">Like New</option>
                <option value="GOOD">Good</option>
                <option value="FAIR">Fair</option>
              </select>
            </div>
          </div>

          {/* Size */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-charcoal-soft mb-1.5">
              Size
            </label>
            <input
              name="size"
              type="text"
              defaultValue={product?.size ?? ""}
              className="w-full border border-border px-3 py-2.5 text-sm rounded outline-none focus:border-copper"
              placeholder="e.g. M, L, 40, One Size"
            />
          </div>

          {/* Prices */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs uppercase tracking-wider text-charcoal-soft mb-1.5">
                Selling Price (NGN) *
              </label>
              <input
                name="sellingPrice"
                type="number"
                required
                min={0}
                defaultValue={product?.sellingPrice ?? ""}
                className="w-full border border-border px-3 py-2.5 text-sm rounded outline-none focus:border-copper"
                placeholder="e.g. 8500"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-charcoal-soft mb-1.5">
                Original Price (NGN)
              </label>
              <input
                name="originalPrice"
                type="number"
                min={0}
                defaultValue={product?.originalPrice ?? ""}
                className="w-full border border-border px-3 py-2.5 text-sm rounded outline-none focus:border-copper"
                placeholder="e.g. 18000"
              />
            </div>
          </div>

          {/* Stock + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs uppercase tracking-wider text-charcoal-soft mb-1.5">
                Stock
              </label>
              <input
                name="stock"
                type="number"
                min={0}
                defaultValue={product?.stock ?? 1}
                className="w-full border border-border px-3 py-2.5 text-sm rounded outline-none focus:border-copper"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-charcoal-soft mb-1.5">
                Status
              </label>
              <select
                name="status"
                defaultValue={product?.status ?? "DRAFT"}
                className="w-full border border-border px-3 py-2.5 text-sm rounded outline-none focus:border-copper bg-white"
              >
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-charcoal-soft mb-1.5">
              Description
            </label>
            <textarea
              name="description"
              rows={3}
              defaultValue={product?.description ?? ""}
              className="w-full border border-border px-3 py-2.5 text-sm rounded outline-none focus:border-copper resize-none"
              placeholder="Describe the item — fabric, fit, any flaws..."
            />
          </div>

          {/* Featured */}
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              name="featured"
              type="checkbox"
              defaultChecked={product?.featured ?? false}
              className="accent-copper"
            />
            Feature on homepage
          </label>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={loading}
              className="flex-1"
            >
              {loading
                ? "Saving..."
                : isEditing
                  ? "Update Product"
                  : "Create Product"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
