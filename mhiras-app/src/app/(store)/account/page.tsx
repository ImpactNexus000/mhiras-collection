import { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  Package,
  Heart,
  Star,
  MapPin,
  CreditCard,
  Bell,
  ChevronRight,
} from "lucide-react";
import { SignOutButton } from "@/components/auth/signout-button";

export const metadata: Metadata = {
  title: "My Account",
};

const menuItems = [
  { label: "Order History", href: "/account/orders", icon: Package },
  { label: "Saved Items", href: "/wishlist", icon: Heart },
  { label: "Delivery Addresses", href: "/account/addresses", icon: MapPin },
  { label: "Payment Methods", href: "/account/payments", icon: CreditCard },
  { label: "Notifications", href: "/account/notifications", icon: Bell },
];

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");

  const userId = session.user.id;

  const [orderCount, wishlistCount, reviewCount] = await Promise.all([
    db.order.count({ where: { userId } }),
    db.wishlistItem.count({ where: { userId } }),
    db.review.count({ where: { userId } }),
  ]);

  const stats = [
    { label: "Orders", value: orderCount, icon: Package },
    { label: "Wishlist", value: wishlistCount, icon: Heart },
    { label: "Reviews", value: reviewCount, icon: Star },
  ];

  const user = session.user;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 md:py-14">
      {/* Profile header */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 rounded-full bg-copper/20 flex items-center justify-center mx-auto mb-4">
          <span className="font-display text-3xl text-copper italic">
            {user.firstName?.[0] ?? "U"}
          </span>
        </div>
        <h1 className="font-display text-3xl font-light italic mb-1">
          {user.firstName} {user.lastName}
        </h1>
        <p className="text-sm text-charcoal-soft">{user.email}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-cream-dark rounded-lg p-4 text-center"
          >
            <s.icon size={20} className="mx-auto text-copper mb-2" />
            <div className="text-2xl font-medium">{s.value}</div>
            <div className="text-xs text-charcoal-soft uppercase tracking-wider">
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Menu */}
      <div className="border border-border rounded-lg overflow-hidden mb-6">
        {menuItems.map((item, i) => (
          <Link
            key={item.label}
            href={item.href}
            className={`flex items-center justify-between px-5 py-4 hover:bg-cream-dark transition-colors ${
              i < menuItems.length - 1 ? "border-b border-border" : ""
            }`}
          >
            <div className="flex items-center gap-3">
              <item.icon size={18} className="text-charcoal-soft" />
              <span className="text-base">{item.label}</span>
            </div>
            <ChevronRight size={16} className="text-charcoal-soft" />
          </Link>
        ))}
      </div>

      {/* Sign out */}
      <SignOutButton />
    </div>
  );
}
