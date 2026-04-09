import { Metadata } from "next";
import Link from "next/link";
import {
  Package,
  Heart,
  Star,
  MapPin,
  CreditCard,
  Bell,
  ChevronRight,
  LogOut,
} from "lucide-react";

export const metadata: Metadata = {
  title: "My Account",
};

const stats = [
  { label: "Orders", value: "12", icon: Package },
  { label: "Wishlist", value: "5", icon: Heart },
  { label: "Reviews", value: "3", icon: Star },
];

const menuItems = [
  { label: "Order History", href: "/account/orders", icon: Package },
  { label: "Saved Items", href: "/wishlist", icon: Heart },
  { label: "Delivery Addresses", href: "/account/addresses", icon: MapPin },
  { label: "Payment Methods", href: "/account/payments", icon: CreditCard },
  { label: "Notifications", href: "/account/notifications", icon: Bell },
];

export default function AccountPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10 md:py-14">
      {/* Profile header */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 rounded-full bg-copper/20 flex items-center justify-center mx-auto mb-4">
          <span className="font-display text-3xl text-copper italic">A</span>
        </div>
        <h1 className="font-display text-3xl font-light italic mb-1">
          Amara Okonkwo
        </h1>
        <p className="text-sm text-charcoal-soft">
          amara@email.com &middot; +234 801 234 5678
        </p>
        <button className="text-xs text-copper hover:text-copper-dark mt-2 cursor-pointer">
          Edit Profile
        </button>
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
      <button className="flex items-center gap-2 text-sm text-charcoal-soft hover:text-danger transition-colors mx-auto cursor-pointer">
        <LogOut size={16} />
        Sign Out
      </button>
    </div>
  );
}
