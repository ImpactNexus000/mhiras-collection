"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  Users,
  CreditCard,
  Boxes,
  Megaphone,
  Truck,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/products", icon: Package, label: "Products" },
  { href: "/admin/orders", icon: ClipboardList, label: "Orders" },
  { href: "/admin/customers", icon: Users, label: "Customers" },
  { href: "/admin/payments", icon: CreditCard, label: "Payments" },
  { href: "/admin/inventory", icon: Boxes, label: "Inventory" },
  { href: "/admin/promotions", icon: Megaphone, label: "Promotions" },
  { href: "/admin/delivery", icon: Truck, label: "Delivery" },
  { href: "/admin/settings", icon: Settings, label: "Settings" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[220px] bg-charcoal min-h-screen flex-shrink-0">
      {/* Logo */}
      <div className="font-display text-xl font-light tracking-widest text-cream uppercase px-5 py-4 border-b border-charcoal-mid">
        Mhiras <span className="text-copper italic">Admin</span>
      </div>

      {/* Nav */}
      <nav className="py-2">
        {navItems.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-5 py-3 text-sm transition-colors",
                isActive
                  ? "text-cream bg-charcoal-mid border-l-2 border-copper"
                  : "text-charcoal-soft hover:text-cream hover:bg-charcoal-mid/50"
              )}
            >
              <item.icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Admin user */}
      <div className="mt-auto px-5 py-4 border-t border-charcoal-mid">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-copper flex items-center justify-center text-xs font-medium text-white">
            MC
          </div>
          <span className="text-sm text-charcoal-soft">Admin &middot; Mhiras</span>
        </div>
      </div>
    </aside>
  );
}
