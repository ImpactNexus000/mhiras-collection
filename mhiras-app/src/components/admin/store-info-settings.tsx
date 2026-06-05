"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { Save } from "lucide-react";
import { updateStoreInfo } from "@/app/actions/admin-settings";

interface StoreInfoSettingsProps {
  storeName: string;
  contactEmail: string;
  whatsappNumber: string;
  instagramHandle: string;
}

export function StoreInfoSettings({
  storeName,
  contactEmail,
  whatsappNumber,
  instagramHandle,
}: StoreInfoSettingsProps) {
  const { success, error: toastError } = useToast();
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const result = await updateStoreInfo(new FormData(e.currentTarget));
    setSaving(false);
    if (result?.error) toastError(result.error);
    else success("Store information saved.");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-border rounded-lg p-5"
    >
      <h3 className="text-sm font-medium mb-1">Store Information</h3>
      <p className="text-xs text-charcoal-soft mb-4">
        Shown in the site footer, contact links, and customer emails.
      </p>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="storeName"
            className="text-xs uppercase tracking-wider text-charcoal-soft mb-1 block"
          >
            Store Name
          </label>
          <input
            id="storeName"
            name="storeName"
            defaultValue={storeName}
            className="input-base"
          />
        </div>
        <div>
          <label
            htmlFor="contactEmail"
            className="text-xs uppercase tracking-wider text-charcoal-soft mb-1 block"
          >
            Contact Email
          </label>
          <input
            id="contactEmail"
            name="contactEmail"
            type="email"
            autoComplete="email"
            defaultValue={contactEmail}
            className="input-base"
          />
        </div>
        <div>
          <label
            htmlFor="whatsappNumber"
            className="text-xs uppercase tracking-wider text-charcoal-soft mb-1 block"
          >
            WhatsApp Number
          </label>
          <input
            id="whatsappNumber"
            name="whatsappNumber"
            type="tel"
            autoComplete="tel"
            defaultValue={whatsappNumber}
            className="input-base"
          />
        </div>
        <div>
          <label
            htmlFor="instagramHandle"
            className="text-xs uppercase tracking-wider text-charcoal-soft mb-1 block"
          >
            Instagram Handle
          </label>
          <input
            id="instagramHandle"
            name="instagramHandle"
            defaultValue={instagramHandle}
            className="input-base"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 mt-4">
        <Button size="sm" type="submit" disabled={saving}>
          <Save size={14} className="mr-1.5" aria-hidden="true" />
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  );
}
