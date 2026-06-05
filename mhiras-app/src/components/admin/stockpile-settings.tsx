"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { Save } from "lucide-react";
import { updateStockpileSettings } from "@/app/actions/admin-stockpile";

export function StockpileSettings({
  stockpileExpiryDays,
}: {
  stockpileExpiryDays: number;
}) {
  const { success, error: toastError } = useToast();
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const result = await updateStockpileSettings(new FormData(e.currentTarget));
    setSaving(false);
    if (result?.error) toastError(result.error);
    else success("Stockpile settings saved.");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-border rounded-lg p-5"
    >
      <h3 className="text-sm font-medium mb-1">Stockpile</h3>
      <p className="text-xs text-charcoal-soft mb-4">
        How long a customer&apos;s paid stockpile items are held before they
        need to request delivery. Applies to new stockpile orders.
      </p>
      <div className="flex items-end gap-3 flex-wrap">
        <div>
          <label className="text-xs uppercase tracking-wider text-charcoal-soft mb-1 block">
            Holding period (days)
          </label>
          <input
            name="stockpileExpiryDays"
            type="number"
            min={1}
            max={365}
            defaultValue={stockpileExpiryDays}
            className="input-base w-32"
          />
        </div>
        <Button size="sm" type="submit" disabled={saving}>
          <Save size={14} className="mr-1.5" />
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  );
}
