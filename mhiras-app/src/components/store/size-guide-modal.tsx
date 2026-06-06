"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Ruler, X } from "lucide-react";
import { SizeGuideContent } from "./size-guide-content";

/** "Size Guide" link + popup for the product page. */
export function SizeGuideModal() {
  const [open, setOpen] = useState(false);

  // Close on Escape and lock background scroll while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs text-copper hover:text-copper-dark underline underline-offset-2 cursor-pointer"
      >
        <Ruler size={13} aria-hidden="true" />
        Size Guide
      </button>

      {open &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Size guide"
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
          >
            <div
              className="absolute inset-0 bg-charcoal/60"
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />
            <div className="relative bg-white w-full sm:max-w-2xl max-h-[85vh] overflow-y-auto rounded-t-2xl sm:rounded-lg shadow-xl">
              <div className="sticky top-0 z-10 bg-white flex items-center justify-between px-5 py-4 border-b border-border">
                <h2 className="font-display text-2xl font-light italic">
                  Size Guide
                </h2>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close size guide"
                  className="text-charcoal-soft hover:text-charcoal cursor-pointer"
                >
                  <X size={20} aria-hidden="true" />
                </button>
              </div>
              <div className="p-5">
                <SizeGuideContent />
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
