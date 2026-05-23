"use client";

import { useState, useTransition } from "react";
import { anonymizeCustomer } from "@/app/actions/admin-customers";
import { Loader2 } from "lucide-react";

interface AnonymizeCustomerButtonProps {
  userId: string;
  customerName: string;
}

export function AnonymizeCustomerButton({
  userId,
  customerName,
}: AnonymizeCustomerButtonProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleClick() {
    setError("");
    const ok = window.confirm(
      `Anonymize ${customerName}?\n\nTheir name, email, phone, and addresses will be stripped from the database. Their orders + reviews will stay (we need them for accounting) but show as "Deleted Customer". This can't be undone.`
    );
    if (!ok) return;

    startTransition(async () => {
      const formData = new FormData();
      formData.set("userId", userId);
      const result = await anonymizeCustomer(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="text-right">
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className="text-xs text-danger hover:underline cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1"
      >
        {pending && <Loader2 size={11} className="animate-spin" aria-hidden="true" />}
        {pending ? "Anonymizing..." : "Anonymize"}
      </button>
      {error && (
        <div role="alert" className="text-xs text-danger mt-1">
          {error}
        </div>
      )}
    </div>
  );
}
