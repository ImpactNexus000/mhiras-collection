"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ProductForm } from "@/components/admin/product-form";
import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react";

interface Category {
  id: string;
  name: string;
}

interface ProductImage {
  id: string;
  url: string;
  alt: string | null;
  sortOrder: number;
  isPrimary: boolean;
}

interface EditProduct {
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
  images?: ProductImage[];
}

interface ProductsClientProps {
  categories: Category[];
  showNewForm?: boolean;
  editProduct?: EditProduct | null;
  children: React.ReactNode;
}

export function ProductsClient({
  categories,
  showNewForm = false,
  editProduct = null,
  children,
}: ProductsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showForm, setShowForm] = useState(showNewForm || !!editProduct);
  const [productToEdit, setProductToEdit] = useState<EditProduct | undefined>(
    editProduct ?? undefined
  );
  const [searchValue, setSearchValue] = useState(
    searchParams.get("search") ?? ""
  );

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const params = new URLSearchParams(searchParams.toString());
      if (searchValue) {
        params.set("search", searchValue);
      } else {
        params.delete("search");
      }
      params.delete("page");
      router.push(`/admin/products?${params.toString()}`);
    },
    [searchValue, searchParams, router]
  );

  const handleCloseForm = useCallback(() => {
    setShowForm(false);
    setProductToEdit(undefined);
    // Remove action/edit params from URL
    const params = new URLSearchParams(searchParams.toString());
    params.delete("action");
    params.delete("edit");
    router.replace(`/admin/products?${params.toString()}`);
  }, [searchParams, router]);

  const handleNewProduct = useCallback(() => {
    setProductToEdit(undefined);
    setShowForm(true);
  }, []);

  return (
    <>
      {/* Inject Add button into the header */}
      <div className="flex justify-between items-center mb-5">
        <h1 className="font-display text-3xl md:text-4xl font-light italic">
          Products
        </h1>
        <Button size="sm" onClick={handleNewProduct}>
          <Plus size={14} className="mr-1.5" />
          Add Product
        </Button>
      </div>

      {/* Search bar */}
      <form
        onSubmit={handleSearch}
        className="bg-white border border-border rounded-lg p-3 flex items-center gap-3 mb-4"
      >
        <div className="flex-1 flex items-center gap-2 border border-border rounded px-3 py-2">
          <Search size={14} className="text-charcoal-soft" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search products by name..."
            className="flex-1 text-sm outline-none bg-transparent"
          />
        </div>
        <Button type="submit" variant="secondary" size="sm">
          Search
        </Button>
      </form>

      {/* Server-rendered content (tabs + table) — skip the duplicate header */}
      <div className="[&>div:first-child]:hidden">{children}</div>

      {/* Product form modal */}
      {showForm && (
        <ProductForm
          categories={categories}
          product={productToEdit}
          onClose={handleCloseForm}
        />
      )}
    </>
  );
}
