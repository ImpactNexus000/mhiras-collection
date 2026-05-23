"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { updateBankDetails } from "@/app/actions/admin-settings";

interface BankDetailsSettingsProps {
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
}

export function BankDetailsSettings({
  bankName,
  bankAccountNumber,
  bankAccountName,
}: BankDetailsSettingsProps) {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    const result = await updateBankDetails(new FormData(e.currentTarget));
    setSaving(false);
    if (result?.error) setMessage({ type: "err", text: result.error });
    else setMessage({ type: "ok", text: "Saved." });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-border rounded-lg p-5"
    >
      <h3 className="text-sm font-medium mb-1">Bank Transfer Details</h3>
      <p className="text-xs text-charcoal-soft mb-4">
        Shown to customers who pick &quot;Bank Transfer&quot; at checkout, and
        on order confirmation pages waiting for payment.
      </p>

      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <label
            htmlFor="bankName"
            className="text-xs uppercase tracking-wider text-charcoal-soft mb-1 block"
          >
            Bank Name
          </label>
          <input
            id="bankName"
            name="bankName"
            defaultValue={bankName}
            className="input-base"
          />
        </div>
        <div>
          <label
            htmlFor="bankAccountNumber"
            className="text-xs uppercase tracking-wider text-charcoal-soft mb-1 block"
          >
            Account Number
          </label>
          <input
            id="bankAccountNumber"
            name="bankAccountNumber"
            inputMode="numeric"
            defaultValue={bankAccountNumber}
            className="input-base"
          />
        </div>
        <div>
          <label
            htmlFor="bankAccountName"
            className="text-xs uppercase tracking-wider text-charcoal-soft mb-1 block"
          >
            Account Name
          </label>
          <input
            id="bankAccountName"
            name="bankAccountName"
            defaultValue={bankAccountName}
            className="input-base"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 mt-4">
        <Button size="sm" type="submit" disabled={saving}>
          <Save size={14} className="mr-1.5" aria-hidden="true" />
          {saving ? "Saving..." : "Save"}
        </Button>
        {message && (
          <span
            role={message.type === "err" ? "alert" : undefined}
            className={`text-xs ${
              message.type === "ok" ? "text-success" : "text-danger"
            }`}
          >
            {message.text}
          </span>
        )}
      </div>
    </form>
  );
}
