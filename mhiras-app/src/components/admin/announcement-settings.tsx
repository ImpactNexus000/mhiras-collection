"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { Save } from "lucide-react";
import { updateAnnouncement } from "@/app/actions/admin-settings";

interface AnnouncementSettingsProps {
  announcementText: string;
  announcementVisible: boolean;
}

export function AnnouncementSettings({
  announcementText,
  announcementVisible,
}: AnnouncementSettingsProps) {
  const { success, error: toastError } = useToast();
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const result = await updateAnnouncement(new FormData(e.currentTarget));
    setSaving(false);
    if (result?.error) toastError(result.error);
    else success("Announcement saved.");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-border rounded-lg p-5"
    >
      <h3 className="text-sm font-medium mb-1">Announcement Bar</h3>
      <p className="text-xs text-charcoal-soft mb-4">
        The copper strip across the top of every storefront page. Keep it
        short — 200 characters max.
      </p>

      <div>
        <label
          htmlFor="announcementText"
          className="text-xs uppercase tracking-wider text-charcoal-soft mb-1 block"
        >
          Message
        </label>
        <input
          id="announcementText"
          name="announcementText"
          defaultValue={announcementText}
          maxLength={200}
          className="input-base"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-charcoal-soft mt-3 cursor-pointer">
        <input
          type="checkbox"
          name="announcementVisible"
          defaultChecked={announcementVisible}
          className="accent-copper"
        />
        Show announcement bar
      </label>

      <div className="flex items-center gap-3 mt-4">
        <Button size="sm" type="submit" disabled={saving}>
          <Save size={14} className="mr-1.5" aria-hidden="true" />
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  );
}
