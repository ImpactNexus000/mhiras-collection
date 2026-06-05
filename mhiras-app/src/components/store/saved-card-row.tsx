"use client";

import { useState, useTransition } from "react";
import { deleteSavedCard, setDefaultSavedCard } from "@/app/actions/saved-cards";
import { useToast } from "@/components/ui/toast";
import { CreditCard, Loader2 } from "lucide-react";

interface SavedCardRowProps {
  cardId: string;
  cardType: string;
  last4: string;
  expMonth: string;
  expYear: string;
  bank: string | null;
  isDefault: boolean;
}

function brandLabel(cardType: string): string {
  const lower = cardType.toLowerCase();
  if (lower === "visa") return "Visa";
  if (lower === "mastercard") return "Mastercard";
  if (lower === "verve") return "Verve";
  return cardType.charAt(0).toUpperCase() + cardType.slice(1);
}

export function SavedCardRow({
  cardId,
  cardType,
  last4,
  expMonth,
  expYear,
  bank,
  isDefault,
}: SavedCardRowProps) {
  const { success, error: toastError } = useToast();
  const [pending, startTransition] = useTransition();
  const [action, setAction] = useState<"none" | "default" | "delete">("none");

  function handleDefault() {
    setAction("default");
    const formData = new FormData();
    formData.set("cardId", cardId);
    startTransition(async () => {
      const result = await setDefaultSavedCard(formData);
      if (result && "error" in result) toastError(result.error);
      else success("Default card updated.");
      setAction("none");
    });
  }

  function handleDelete() {
    const ok = window.confirm(
      `Remove ${brandLabel(cardType)} ending in ${last4}?`
    );
    if (!ok) return;
    setAction("delete");
    const formData = new FormData();
    formData.set("cardId", cardId);
    startTransition(async () => {
      const result = await deleteSavedCard(formData);
      if (result && "error" in result) toastError(result.error);
      else success("Card removed.");
      setAction("none");
    });
  }

  const expired =
    Number(expYear) < new Date().getFullYear() ||
    (Number(expYear) === new Date().getFullYear() &&
      Number(expMonth) < new Date().getMonth() + 1);

  return (
    <div className="border border-border rounded-lg p-4 bg-white">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-full bg-copper/15 flex items-center justify-center flex-shrink-0">
            <CreditCard size={16} aria-hidden="true" className="text-copper" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium">
                {brandLabel(cardType)} •••• {last4}
              </span>
              {isDefault && (
                <span className="text-[10px] uppercase tracking-wider bg-copper-light text-copper-dark px-2 py-0.5 rounded">
                  Default
                </span>
              )}
              {expired && (
                <span className="text-[10px] uppercase tracking-wider bg-danger/10 text-danger px-2 py-0.5 rounded">
                  Expired
                </span>
              )}
            </div>
            <div className="text-xs text-charcoal-soft mt-0.5">
              Expires {expMonth}/{expYear}
              {bank && ` · ${bank}`}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs">
        {!isDefault && !expired && (
          <button
            type="button"
            onClick={handleDefault}
            disabled={pending}
            className="text-copper hover:text-copper-dark cursor-pointer disabled:opacity-50 inline-flex items-center gap-1"
          >
            {pending && action === "default" && (
              <Loader2 size={11} aria-hidden="true" className="animate-spin" />
            )}
            Make default
          </button>
        )}
        <button
          type="button"
          onClick={handleDelete}
          disabled={pending}
          className="text-danger hover:underline cursor-pointer disabled:opacity-50 inline-flex items-center gap-1"
        >
          {pending && action === "delete" && (
            <Loader2 size={11} aria-hidden="true" className="animate-spin" />
          )}
          Remove
        </button>
      </div>
    </div>
  );
}
