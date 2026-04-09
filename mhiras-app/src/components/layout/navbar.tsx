import Link from "next/link";
import { Search, Heart } from "lucide-react";
import { CartBadge } from "./cart-badge";

export function Navbar() {
  return (
    <header>
      {/* Announcement Bar */}
      <div className="bg-copper text-white text-center text-sm tracking-wider py-2.5 px-4">
        New arrivals every week — Free delivery on orders over &#8358;15,000
      </div>

      {/* Desktop Nav */}
      <nav className="bg-charcoal text-cream hidden md:flex items-center justify-between px-6 h-16">
        <Link
          href="/"
          className="font-display text-2xl font-light tracking-widest uppercase text-cream"
        >
          Mhiras Collection
        </Link>

        <div className="flex gap-6 text-sm uppercase tracking-wider text-charcoal-soft">
          <Link href="/shop" className="hover:text-cream transition-colors">
            Shop
          </Link>
          <Link href="/shop?filter=new" className="hover:text-cream transition-colors">
            New In
          </Link>
          <Link href="/collections" className="hover:text-cream transition-colors">
            Collections
          </Link>
          <Link href="/about" className="hover:text-cream transition-colors">
            About
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/search" className="text-charcoal-soft hover:text-cream transition-colors">
            <Search size={18} />
          </Link>
          <Link href="/wishlist" className="text-cream hover:text-copper transition-colors relative">
            <Heart size={18} />
          </Link>
          <CartBadge className="text-cream hover:text-copper transition-colors" />
          <div className="w-px h-5 bg-charcoal-mid mx-1" />
          <Link
            href="/auth/signin"
            className="text-sm text-charcoal-soft hover:text-cream transition-colors"
          >
            Sign in
          </Link>
        </div>
      </nav>

      {/* Mobile Nav */}
      <nav className="bg-charcoal text-cream flex md:hidden items-center justify-between px-4 h-14">
        <Link
          href="/"
          className="font-display text-xl font-light tracking-widest uppercase text-cream"
        >
          Mhiras
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/search" className="text-charcoal-soft">
            <Search size={18} />
          </Link>
          <CartBadge className="text-charcoal-soft" />
        </div>
      </nav>
    </header>
  );
}
