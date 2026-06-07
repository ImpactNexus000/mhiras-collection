"use client";

import { forwardRef, useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** When true, shows a green check at the right edge (e.g. confirm matches). */
  valid?: boolean;
}

/**
 * Password field with a show/hide eye toggle. Optionally renders a green
 * check (via `valid`) to the left of the toggle — used on the confirm field
 * to signal a live match. The toggle only changes the input type client-side;
 * the value still submits under the field's `name` as normal.
 */
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput({ className, valid, ...props }, ref) {
    const [shown, setShown] = useState(false);

    return (
      <div className="relative">
        <input
          ref={ref}
          type={shown ? "text" : "password"}
          className={cn("input-base pr-14", className)}
          {...props}
        />
        <div className="absolute inset-y-0 right-0 flex items-center gap-1 pr-2">
          {valid && (
            <CheckCircle2
              className="h-[18px] w-[18px] text-green-600"
              aria-label="Passwords match"
            />
          )}
          <button
            type="button"
            onClick={() => setShown((s) => !s)}
            className="p-1.5 text-charcoal-soft hover:text-charcoal transition-colors"
            aria-label={shown ? "Hide password" : "Show password"}
            aria-pressed={shown}
          >
            {shown ? (
              <EyeOff className="h-[18px] w-[18px]" />
            ) : (
              <Eye className="h-[18px] w-[18px]" />
            )}
          </button>
        </div>
      </div>
    );
  }
);
