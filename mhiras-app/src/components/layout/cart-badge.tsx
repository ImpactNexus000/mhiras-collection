"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/context/cart-context";

export function CartBadge({ className = "" }: { className?: string }) {
  const { itemCount } = useCart();

  return (
    <Link href="/cart" className={`relative ${className}`}>
      <ShoppingBag size={18} />
      <span className="absolute -top-2 -right-2 bg-copper text-white text-[10px] rounded-full w-4.5 h-4.5 flex items-center justify-center">
        {itemCount}
      </span>
    </Link>
  );
}
