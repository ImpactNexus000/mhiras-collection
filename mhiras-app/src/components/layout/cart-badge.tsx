"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/context/cart-context";

export function CartBadge({ className = "" }: { className?: string }) {
  const { itemCount } = useCart();

  const label =
    itemCount === 0
      ? "Cart, empty"
      : `Cart, ${itemCount} item${itemCount === 1 ? "" : "s"}`;

  return (
    <Link href="/cart" aria-label={label} className={`relative ${className}`}>
      <ShoppingBag size={18} aria-hidden="true" />
      <span
        aria-hidden="true"
        className="absolute -top-2 -right-2 bg-copper text-white text-[10px] rounded-full w-4.5 h-4.5 flex items-center justify-center"
      >
        {itemCount}
      </span>
    </Link>
  );
}
