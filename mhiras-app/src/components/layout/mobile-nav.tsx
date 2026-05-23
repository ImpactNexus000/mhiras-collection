"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Package, Heart, ShoppingBag, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/shop", icon: Search, label: "Shop" },
  { href: "/wholesale", icon: Package, label: "Bales" },
  { href: "/wishlist", icon: Heart, label: "Saved" },
  { href: "/cart", icon: ShoppingBag, label: "Cart" },
  { href: "/account", icon: User, label: "Account" },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="md:hidden fixed bottom-0 left-0 right-0 bg-charcoal z-50 flex pt-2.5 pb-[calc(1rem+env(safe-area-inset-bottom))]"
    >
      {navItems.map((item) => {
        const isActive =
          item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex-1 flex flex-col items-center gap-1 text-[10px] uppercase tracking-wider transition-colors",
              isActive ? "text-copper" : "text-charcoal-soft"
            )}
          >
            <item.icon size={18} aria-hidden="true" />
            {item.label}
            {isActive && (
              <div aria-hidden="true" className="w-1 h-1 rounded-full bg-copper" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
