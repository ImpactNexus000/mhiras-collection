"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addOrderNote } from "@/app/actions/admin-orders";
import { Button } from "@/components/ui/button";

interface OrderNotesProps {
  orderId: string;
}

export function OrderNotes({ orderId }: OrderNotesProps) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    if (!note.trim()) return;
    setLoading(true);
    const result = await addOrderNote(orderId, note);
    if (!result.error) {
      setNote("");
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <div className="bg-white border border-border rounded-lg p-5">
      <h3 className="text-sm font-medium mb-3">Internal Notes</h3>
      <textarea
        rows={3}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Add a note about this order..."
        className="w-full border border-border rounded px-3 py-2 text-sm outline-none focus:border-copper resize-none"
      />
      <div className="flex justify-end mt-2">
        <Button
          size="sm"
          variant="outline"
          onClick={handleSave}
          disabled={loading || !note.trim()}
        >
          {loading ? "Saving..." : "Save Note"}
        </Button>
      </div>
    </div>
  );
}
