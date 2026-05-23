"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export interface FaqItem {
  q: string;
  a: string;
}

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <div className="border border-border rounded overflow-hidden">
      {items.map((item, i) => {
        const isOpen = openIdx === i;
        const panelId = `faq-panel-${i}`;
        const buttonId = `faq-trigger-${i}`;
        return (
          <div
            key={item.q}
            className={i < items.length - 1 ? "border-b border-border" : ""}
          >
            <button
              id={buttonId}
              type="button"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => setOpenIdx(isOpen ? null : i)}
              className="w-full flex justify-between items-center text-left px-4 py-3.5 text-sm hover:bg-cream-dark transition-colors cursor-pointer"
            >
              <span>{item.q}</span>
              <ChevronDown
                size={16}
                aria-hidden="true"
                className={`text-copper transition-transform ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {isOpen && (
              <div
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                className="px-4 pb-4 text-sm text-charcoal-soft leading-relaxed"
              >
                {item.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
