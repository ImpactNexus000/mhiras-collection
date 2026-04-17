"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { DeliveryForm, type ZoneData } from "@/components/admin/delivery-form";
import {
  toggleDeliveryZone,
  deleteDeliveryZone,
} from "@/app/actions/delivery-zones";
import { Button } from "@/components/ui/button";
import { Plus, MapPin } from "lucide-react";

interface DeliveryClientProps {
  zones: ZoneData[];
  stats: { label: string; value: string }[];
}

export function DeliveryClient({ zones, stats }: DeliveryClientProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ZoneData | undefined>(undefined);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function handleNew() {
    setEditing(undefined);
    setShowForm(true);
  }

  function handleEdit(zone: ZoneData) {
    setEditing(zone);
    setShowForm(true);
  }

  function handleClose() {
    setShowForm(false);
    setEditing(undefined);
  }

  function handleToggle(id: string) {
    setPendingId(id);
    startTransition(async () => {
      await toggleDeliveryZone(id);
      router.refresh();
      setPendingId(null);
    });
  }

  function handleDelete(id: string, name: string) {
    if (!confirm(`Delete zone "${name}"? This cannot be undone.`)) return;
    setPendingId(id);
    startTransition(async () => {
      await deleteDeliveryZone(id);
      router.refresh();
      setPendingId(null);
    });
  }

  return (
    <>
      <div className="flex justify-between items-center mb-5">
        <h1 className="font-display text-3xl md:text-4xl font-light italic">
          Delivery Zones
        </h1>
        <Button size="sm" onClick={handleNew}>
          <Plus size={14} className="mr-1.5" />
          Add Zone
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-white border border-border rounded-lg p-4"
          >
            <div className="text-xs uppercase tracking-wider text-charcoal-soft mb-1.5">
              {s.label}
            </div>
            <div className="text-3xl font-medium">{s.value}</div>
          </div>
        ))}
      </div>

      {zones.length === 0 ? (
        <div className="bg-white border border-border rounded-lg p-10 text-center">
          <MapPin
            size={28}
            className="mx-auto mb-3 text-charcoal-soft opacity-60"
          />
          <p className="text-charcoal-soft mb-4">No delivery zones yet.</p>
          <Button size="sm" onClick={handleNew}>
            <Plus size={14} className="mr-1.5" />
            Add your first zone
          </Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {zones.map((zone) => {
            const isPending = pendingId === zone.id;
            const stateList = zone.states
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean);

            return (
              <div
                key={zone.id}
                className="bg-white border border-border rounded-lg p-5 hover:border-copper/40 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-display text-lg italic mb-1">
                      {zone.name}
                    </h3>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        zone.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {zone.isActive ? "active" : "inactive"}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-medium text-copper">
                      ₦{zone.fee.toLocaleString()}
                    </div>
                    <div className="text-xs text-charcoal-soft">
                      {zone.estimateDays}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-border">
                  <div className="text-xs text-charcoal-soft mb-1.5">
                    Covers {stateList.length} state
                    {stateList.length === 1 ? "" : "s"}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {stateList.slice(0, 8).map((state) => (
                      <span
                        key={state}
                        className="text-xs px-2 py-0.5 bg-cream rounded"
                      >
                        {state}
                      </span>
                    ))}
                    {stateList.length > 8 && (
                      <span className="text-xs px-2 py-0.5 text-charcoal-soft">
                        +{stateList.length - 8} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 mt-4 items-center">
                  <button
                    type="button"
                    onClick={() => handleEdit(zone)}
                    disabled={isPending}
                    className="text-xs text-copper hover:text-copper-dark cursor-pointer disabled:opacity-50"
                  >
                    Edit
                  </button>
                  <span className="text-border">|</span>
                  <button
                    type="button"
                    onClick={() => handleToggle(zone.id)}
                    disabled={isPending}
                    className="text-xs text-charcoal-soft hover:text-charcoal cursor-pointer disabled:opacity-50"
                  >
                    {zone.isActive ? "Deactivate" : "Activate"}
                  </button>
                  <span className="text-border">|</span>
                  <button
                    type="button"
                    onClick={() => handleDelete(zone.id, zone.name)}
                    disabled={isPending}
                    className="text-xs text-charcoal-soft hover:text-danger cursor-pointer disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && <DeliveryForm zone={editing} onClose={handleClose} />}
    </>
  );
}
