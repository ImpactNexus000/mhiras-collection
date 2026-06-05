"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { Save } from "lucide-react";
import { updateNotificationPreferences } from "@/app/actions/notification-prefs";

export function NotificationPreferencesForm({
  marketingEmails,
}: {
  marketingEmails: boolean;
}) {
  const { success, error: toastError } = useToast();
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const result = await updateNotificationPreferences(
      new FormData(e.currentTarget)
    );
    setSaving(false);
    if (result && "error" in result) {
      toastError(result.error);
    } else {
      success("Preferences saved.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Transactional — display only */}
      <div className="bg-cream-dark border border-border rounded p-4">
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            checked
            disabled
            aria-label="Order updates (always on)"
            className="accent-copper mt-1 opacity-70"
          />
          <div>
            <div className="text-sm font-medium">Order updates</div>
            <p className="text-xs text-charcoal-soft mt-0.5 leading-relaxed">
              Order confirmation, payment, shipped, delivered, password
              resets. These are required to actually run your orders and
              can&apos;t be turned off.
            </p>
          </div>
        </div>
      </div>

      {/* Real toggle */}
      <label className="border border-border rounded p-4 flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          name="marketingEmails"
          defaultChecked={marketingEmails}
          className="accent-copper mt-1"
        />
        <div>
          <div className="text-sm font-medium">Marketing &amp; new arrivals</div>
          <p className="text-xs text-charcoal-soft mt-0.5 leading-relaxed">
            Welcome emails, occasional new-arrival drops, and special offers.
            Uncheck to opt out — we&apos;ll still send order updates.
          </p>
        </div>
      </label>

      <div className="flex items-center gap-3">
        <Button size="md" type="submit" disabled={saving}>
          <Save size={14} className="mr-1.5" aria-hidden="true" />
          {saving ? "Saving..." : "Save preferences"}
        </Button>
      </div>
    </form>
  );
}
