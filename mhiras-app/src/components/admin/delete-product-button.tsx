"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteProduct } from "@/app/actions/products";
import { useToast } from "@/components/ui/toast";
import { Loader2, Trash2 } from "lucide-react";

export function DeleteProductButton({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    const result = await deleteProduct(productId);
    setLoading(false);
    setConfirming(false);
    if (result.error) {
      toastError(result.error);
      return;
    }
    if (result.archived) {
      success(
        `"${productName}" has past orders, so it was archived (hidden from the shop) instead of deleted.`
      );
    } else {
      success(`"${productName}" deleted.`);
    }
    router.refresh();
  }

  if (loading) {
    return (
      <span className="inline-flex items-center gap-1 text-sm text-charcoal-soft">
        <Loader2 size={14} aria-hidden="true" className="animate-spin" />
        Deleting…
      </span>
    );
  }

  if (confirming) {
    return (
      <span className="inline-flex items-center gap-2 text-sm">
        <button
          type="button"
          onClick={handleDelete}
          className="font-medium text-danger hover:underline cursor-pointer"
        >
          Confirm
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="text-charcoal-soft hover:underline cursor-pointer"
        >
          Cancel
        </button>
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      aria-label={`Delete ${productName}`}
      className="inline-flex items-center gap-1 text-sm text-charcoal-soft hover:text-danger cursor-pointer"
    >
      <Trash2 size={14} aria-hidden="true" />
      Delete
    </button>
  );
}
