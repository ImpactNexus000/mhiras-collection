"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { deleteAddress, setDefaultAddress } from "@/app/actions/addresses";
import { Loader2 } from "lucide-react";

interface AddressRowActionsProps {
  addressId: string;
  isDefault: boolean;
  /** Label used in the confirm dialog ("Delete Home — 123 Main St?"). */
  displayName: string;
}

export function AddressRowActions({
  addressId,
  isDefault,
  displayName,
}: AddressRowActionsProps) {
  const [pending, startTransition] = useTransition();
  const [action, setAction] = useState<"none" | "default" | "delete">("none");
  const [error, setError] = useState("");

  function handleDefault() {
    setError("");
    setAction("default");
    const formData = new FormData();
    formData.set("addressId", addressId);
    startTransition(async () => {
      const result = await setDefaultAddress(formData);
      if (result && "error" in result) setError(result.error);
      setAction("none");
    });
  }

  function handleDelete() {
    setError("");
    const ok = window.confirm(`Delete ${displayName}?\n\nThis can't be undone.`);
    if (!ok) return;
    setAction("delete");
    const formData = new FormData();
    formData.set("addressId", addressId);
    startTransition(async () => {
      const result = await deleteAddress(formData);
      if (result && "error" in result) setError(result.error);
      setAction("none");
    });
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 text-xs">
        {!isDefault && (
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
        <Link
          href={`/account/addresses/${addressId}/edit`}
          className="text-charcoal-soft hover:text-charcoal"
        >
          Edit
        </Link>
        <button
          type="button"
          onClick={handleDelete}
          disabled={pending}
          className="text-danger hover:underline cursor-pointer disabled:opacity-50 inline-flex items-center gap-1"
        >
          {pending && action === "delete" && (
            <Loader2 size={11} aria-hidden="true" className="animate-spin" />
          )}
          Delete
        </button>
      </div>
      {error && (
        <p role="alert" className="text-xs text-danger mt-1">
          {error}
        </p>
      )}
    </>
  );
}
