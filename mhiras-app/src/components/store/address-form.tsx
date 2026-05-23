"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createAddress, updateAddress } from "@/app/actions/addresses";
import { NG_STATES } from "@/lib/ng-states";

export interface AddressFormValues {
  id?: string;
  label: string | null;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  lga: string | null;
  isDefault: boolean;
}

interface AddressFormProps {
  /** Pre-populated values when editing. Omit for a new address. */
  initial?: AddressFormValues;
  /** Whether to force the "make default" checkbox checked + disabled (first address). */
  forceDefault?: boolean;
}

export function AddressForm({ initial, forceDefault }: AddressFormProps) {
  const router = useRouter();
  const isEdit = !!initial?.id;
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const formData = new FormData(e.currentTarget);
    if (forceDefault) formData.set("isDefault", "on");

    startTransition(async () => {
      const result =
        isEdit && initial?.id
          ? await updateAddress(initial.id, formData)
          : await createAddress(formData);
      if (result && "error" in result) {
        setError(result.error);
        return;
      }
      router.push("/account/addresses");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {error && (
        <div
          role="alert"
          className="mb-4 p-3 bg-red-50 border border-red-200 text-sm text-red-700 rounded"
        >
          {error}
        </div>
      )}

      <div className="mb-3">
        <label
          htmlFor="addr-label"
          className="text-xs uppercase tracking-wider text-charcoal-soft mb-1 block"
        >
          Label <span className="text-charcoal-soft/60">(optional)</span>
        </label>
        <input
          id="addr-label"
          name="label"
          defaultValue={initial?.label ?? ""}
          placeholder="Home, Office..."
          className="input-base"
        />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label
            htmlFor="addr-firstName"
            className="text-xs uppercase tracking-wider text-charcoal-soft mb-1 block"
          >
            First Name
          </label>
          <input
            id="addr-firstName"
            name="firstName"
            autoComplete="given-name"
            defaultValue={initial?.firstName ?? ""}
            required
            className="input-base"
          />
        </div>
        <div>
          <label
            htmlFor="addr-lastName"
            className="text-xs uppercase tracking-wider text-charcoal-soft mb-1 block"
          >
            Last Name
          </label>
          <input
            id="addr-lastName"
            name="lastName"
            autoComplete="family-name"
            defaultValue={initial?.lastName ?? ""}
            required
            className="input-base"
          />
        </div>
      </div>

      <div className="mb-3">
        <label
          htmlFor="addr-phone"
          className="text-xs uppercase tracking-wider text-charcoal-soft mb-1 block"
        >
          Phone Number
        </label>
        <input
          id="addr-phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          defaultValue={initial?.phone ?? ""}
          required
          className="input-base"
        />
      </div>

      <div className="mb-3">
        <label
          htmlFor="addr-address"
          className="text-xs uppercase tracking-wider text-charcoal-soft mb-1 block"
        >
          Street Address
        </label>
        <input
          id="addr-address"
          name="address"
          autoComplete="street-address"
          defaultValue={initial?.address ?? ""}
          required
          className="input-base"
        />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label
            htmlFor="addr-city"
            className="text-xs uppercase tracking-wider text-charcoal-soft mb-1 block"
          >
            City
          </label>
          <input
            id="addr-city"
            name="city"
            autoComplete="address-level2"
            defaultValue={initial?.city ?? ""}
            required
            className="input-base"
          />
        </div>
        <div>
          <label
            htmlFor="addr-lga"
            className="text-xs uppercase tracking-wider text-charcoal-soft mb-1 block"
          >
            LGA <span className="text-charcoal-soft/60">(optional)</span>
          </label>
          <input
            id="addr-lga"
            name="lga"
            defaultValue={initial?.lga ?? ""}
            className="input-base"
          />
        </div>
      </div>

      <div className="mb-4">
        <label
          htmlFor="addr-state"
          className="text-xs uppercase tracking-wider text-charcoal-soft mb-1 block"
        >
          State
        </label>
        <select
          id="addr-state"
          name="state"
          autoComplete="address-level1"
          defaultValue={initial?.state ?? ""}
          required
          className="input-base"
        >
          <option value="">Select state</option>
          {NG_STATES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <label className="flex items-center gap-2 text-sm text-charcoal-soft mb-5 cursor-pointer">
        <input
          type="checkbox"
          name="isDefault"
          defaultChecked={initial?.isDefault ?? forceDefault ?? false}
          disabled={forceDefault}
          className="accent-copper"
        />
        Make this my default address
        {forceDefault && (
          <span className="text-xs text-charcoal-soft/70">
            (first address is always default)
          </span>
        )}
      </label>

      <div className="flex items-center gap-3">
        <Button variant="primary" size="lg" type="submit" disabled={pending}>
          {pending ? "Saving..." : isEdit ? "Update address" : "Save address"}
        </Button>
        <Link
          href="/account/addresses"
          className="text-sm text-charcoal-soft hover:text-charcoal"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
