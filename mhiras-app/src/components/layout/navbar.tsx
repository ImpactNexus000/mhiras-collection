import Link from "next/link";
import Image from "next/image";
import { Search, Heart } from "lucide-react";
import { CartBadge } from "./cart-badge";
import { auth } from "@/lib/auth";
import { getStoreSettings } from "@/lib/queries/settings";

export async function Navbar() {
  const [session, settings] = await Promise.all([auth(), getStoreSettings()]);
  const user = session?.user;

  return (
    <header>
      {/* Announcement Bar — seamless scrolling marquee. Screen readers get a
          single clean copy; the looping visual track is aria-hidden. */}
      {settings.announcementVisible && settings.announcementText && (
        <div className="bg-copper text-white text-sm tracking-wider py-2.5 overflow-hidden">
          <span className="sr-only">{settings.announcementText}</span>
          <div className="marquee" aria-hidden="true">
            {[0, 1].map((group) => (
              <div key={group} className="flex shrink-0">
                {Array.from({ length: 4 }).map((_, i) => (
                  <span key={i} className="flex items-center">
                    <span className="px-6">{settings.announcementText}</span>
                    <span className="text-white/40">✦</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Desktop Nav */}
      <nav className="bg-charcoal text-cream hidden md:flex items-center justify-between pl-20 pr-6 h-16">
        <Link href="/" aria-label="Mhiras Collection — home">
          <Image
            src="/logo-nav.png"
            alt="Mhiras Collection"
            width={843}
            height={273}
            priority
            unoptimized
            className="h-12 w-auto"
          />
        </Link>

        <div className="flex gap-6 text-sm uppercase tracking-wider text-charcoal-soft">
          <Link href="/shop" className="hover:text-cream transition-colors">
            Shop
          </Link>
          <Link href="/wholesale" className="hover:text-cream transition-colors">
            Bales
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
          {user?.role === "ADMIN" && (
            <Link
              href="/admin"
              className="text-copper hover:text-copper-light transition-colors font-medium"
            >
              Admin
            </Link>
          )}
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/search"
            aria-label="Search products"
            className="text-charcoal-soft hover:text-cream transition-colors"
          >
            <Search size={18} aria-hidden="true" />
          </Link>
          <Link
            href="/wishlist"
            aria-label="View wishlist"
            className="text-cream hover:text-copper transition-colors relative"
          >
            <Heart size={18} aria-hidden="true" />
          </Link>
          <CartBadge className="text-cream hover:text-copper transition-colors" />
          <div className="w-px h-5 bg-charcoal-mid mx-1" />
          {user ? (
            <Link
              href="/account"
              className="flex items-center gap-2 text-sm text-charcoal-soft hover:text-cream transition-colors"
            >
              <span className="w-7 h-7 rounded-full bg-copper/80 flex items-center justify-center text-[11px] font-medium text-white">
                {user.firstName?.[0]}
                {user.lastName?.[0]}
              </span>
              {user.firstName}
            </Link>
          ) : (
            <Link
              href="/auth/signin"
              className="text-sm text-charcoal-soft hover:text-cream transition-colors"
            >
              Sign in
            </Link>
          )}
        </div>
      </nav>

      {/* Mobile Nav */}
      <nav className="bg-charcoal text-cream flex md:hidden items-center justify-between px-4 h-14">
        <Link href="/" aria-label="Mhiras Collection — home">
          <Image
            src="/logo-nav.png"
            alt="Mhiras Collection"
            width={843}
            height={273}
            priority
            unoptimized
            className="h-9 w-auto"
          />
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/search"
            aria-label="Search products"
            className="text-charcoal-soft"
          >
            <Search size={18} aria-hidden="true" />
          </Link>
          <CartBadge className="text-charcoal-soft" />
          {user?.role === "ADMIN" && (
            <Link
              href="/admin"
              aria-label="Admin dashboard"
              className="text-copper text-xs font-medium uppercase tracking-wider"
            >
              Admin
            </Link>
          )}
          {user ? (
            <Link
              href="/account"
              aria-label="My account"
              className="text-charcoal-soft hover:text-cream transition-colors"
            >
              <span
                aria-hidden="true"
                className="w-7 h-7 rounded-full bg-copper/80 flex items-center justify-center text-[11px] font-medium text-white"
              >
                {user.firstName?.[0]}
                {user.lastName?.[0]}
              </span>
            </Link>
          ) : (
            <Link href="/auth/signin" className="text-xs text-charcoal-soft hover:text-cream transition-colors">
              Sign in
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
