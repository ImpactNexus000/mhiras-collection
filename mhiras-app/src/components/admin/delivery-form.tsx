"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createDeliveryZone,
  updateDeliveryZone,
} from "@/app/actions/delivery-zones";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export interface ZoneData {
  id: string;
  name: string;
  states: string;
  fee: number;
  estimateDays: string;
  isActive: boolean;
  sortOrder: number;
}

interface DeliveryFormProps {
  zone?: ZoneData;
  onClose: () => void;
}

export function DeliveryForm({ zone, onClose }: DeliveryFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const isEditing = !!zone;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    const result = isEditing
      ? await updateDeliveryZone(zone!.id, formData)
      : await createDeliveryZone(formData);

    if ("error" in result && result.error) {
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
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-white z-10">
          <h2 className="font-display text-xl font-light italic">
            {isEditing ? "Edit Delivery Zone" : "New Delivery Zone"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center hover:bg-cream-dark rounded cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="text-sm text-danger bg-danger/10 px-3 py-2 rounded">
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-charcoal-soft mb-1.5">
              Zone Name *
            </label>
            <input
              name="name"
              type="text"
              required
              defaultValue={zone?.name ?? ""}
              className="w-full border border-border px-3 py-2.5 text-sm rounded outline-none focus:border-copper"
              placeholder="e.g. Lagos Mainland"
            />
          </div>

          {/* States */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-charcoal-soft mb-1.5">
              States *
            </label>
            <textarea
              name="states"
              required
              rows={3}
              defaultValue={zone?.states ?? ""}
              className="w-full border border-border px-3 py-2.5 text-sm rounded outline-none focus:border-copper resize-none"
              placeholder="Comma-separated: Lagos, Ogun, Oyo"
            />
            <p className="text-xs text-charcoal-soft mt-1">
              Separate each state with a comma.
            </p>
          </div>

          {/* Fee + estimate */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs uppercase tracking-wider text-charcoal-soft mb-1.5">
                Fee (₦) *
              </label>
              <input
                name="fee"
                type="number"
                required
                min={0}
                defaultValue={zone?.fee ?? ""}
                className="w-full border border-border px-3 py-2.5 text-sm rounded outline-none focus:border-copper"
                placeholder="1500"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-charcoal-soft mb-1.5">
                Estimate *
              </label>
              <input
                name="estimateDays"
                type="text"
                required
                defaultValue={zone?.estimateDays ?? ""}
                className="w-full border border-border px-3 py-2.5 text-sm rounded outline-none focus:border-copper"
                placeholder="1-2 days"
              />
            </div>
          </div>

          {/* Sort order */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-charcoal-soft mb-1.5">
              Sort Order
            </label>
            <input
              name="sortOrder"
              type="number"
              defaultValue={zone?.sortOrder ?? 0}
              className="w-full border border-border px-3 py-2.5 text-sm rounded outline-none focus:border-copper"
              placeholder="0"
            />
            <p className="text-xs text-charcoal-soft mt-1">
              Lower numbers appear first in the checkout list.
            </p>
          </div>

          {/* Active */}
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              name="isActive"
              type="checkbox"
              defaultChecked={zone?.isActive ?? true}
              className="accent-copper"
            />
            Active
          </label>

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
                  ? "Update Zone"
                  : "Create Zone"}
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
