"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { Loader2 } from "lucide-react";
import { subscribeToNewsletter } from "@/app/actions/newsletter";

interface NewsletterFormProps {
  /** Where the signup came from — saved on the Subscriber row for analytics. */
  source: string;
  /** Visual variant. "dark" reads on the charcoal footer, "light" on copper sections. */
  variant?: "dark" | "light";
}

export function NewsletterForm({ source, variant = "light" }: NewsletterFormProps) {
  const { success, error: toastError } = useToast();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");

    const formData = new FormData(e.currentTarget);
    const result = await subscribeToNewsletter(formData);
    setStatus("idle");

    if (result.error) {
      toastError(result.error);
      return;
    }

    setEmail("");
    success("You're on the list — we'll email you when new pieces drop.");
  }

  const inputId = `newsletter-${source}`;
  const isDark = variant === "dark";

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <input type="hidden" name="source" value={source} />
      <div className="flex">
        <label htmlFor={inputId} className="sr-only">
          Your email address
        </label>
        <input
          id={inputId}
          type="email"
          name="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          disabled={status === "loading"}
          className={
            isDark
              ? "flex-1 bg-charcoal-mid border border-charcoal-mid px-3 py-2.5 text-sm text-cream outline-none focus:border-copper disabled:opacity-60"
              : "input-base flex-1 md:w-60 disabled:opacity-60"
          }
        />
        <Button
          variant="primary"
          type="submit"
          disabled={status === "loading"}
          className={isDark ? "px-4 py-2.5 text-xs" : "px-5"}
        >
          {status === "loading" ? (
            <Loader2 size={14} aria-hidden="true" className="animate-spin" />
          ) : (
            "Notify Me"
          )}
        </Button>
      </div>
    </form>
  );
}
