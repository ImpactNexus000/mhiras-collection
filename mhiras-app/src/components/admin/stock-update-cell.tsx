"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateStock } from "@/app/actions/inventory";
import { Check, X, Loader2 } from "lucide-react";

interface StockUpdateCellProps {
  productId: string;
  currentStock: number;
}

export function StockUpdateCell({
  productId,
  currentStock,
}: StockUpdateCellProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(currentStock));
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    const newStock = parseInt(value, 10);
    if (isNaN(newStock) || newStock < 0) return;
    if (newStock === currentStock) {
      setEditing(false);
      return;
    }

    setLoading(true);
    const result = await updateStock(productId, newStock);
    setLoading(false);

    if (!result.error) {
      setEditing(false);
      router.refresh();
    }
  }

  if (editing) {
    return (
      <div className="flex items-center gap-1">
        <input
          type="number"
          min={0}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") setEditing(false);
          }}
          className="w-14 border border-copper rounded px-2 py-1 text-sm text-center outline-none"
          autoFocus
        />
        {loading ? (
          <Loader2 size={14} className="animate-spin text-copper" />
        ) : (
          <>
            <button
              onClick={handleSave}
              className="text-success hover:text-success/80 cursor-pointer"
            >
              <Check size={14} />
            </button>
            <button
              onClick={() => {
                setValue(String(currentStock));
                setEditing(false);
              }}
              className="text-charcoal-soft hover:text-danger cursor-pointer"
            >
              <X size={14} />
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className={`cursor-pointer hover:underline ${
        currentStock === 0 ? "text-danger font-medium" : ""
      }`}
    >
      {currentStock}
    </button>
  );
}
