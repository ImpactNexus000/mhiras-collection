import Link from "next/link";
import { getStoreSettings } from "@/lib/queries/settings";
import { NewsletterForm } from "@/components/store/newsletter-form";

export async function Footer() {
  const settings = await getStoreSettings();

  return (
    <footer className="bg-charcoal text-charcoal-soft mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="font-display text-3xl font-light text-cream italic mb-3">
              {settings.storeName}
            </div>
            <p className="text-sm leading-relaxed">
              Curated thrift fashion — handpicked, pre-loved, and premium.
              Every item is unique.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-cream mb-4 font-medium">
              Shop
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/shop?filter=new" className="hover:text-cream transition-colors">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-cream transition-colors">
                  All Retail
                </Link>
              </li>
              <li>
                <Link href="/wholesale" className="hover:text-cream transition-colors">
                  Wholesale Bales
                </Link>
              </li>
              <li className="text-charcoal-soft/70 cursor-default">
                Men <span className="text-[10px] uppercase tracking-wider text-copper/80 ml-1">soon</span>
              </li>
              <li className="text-charcoal-soft/70 cursor-default">
                Bags &amp; Accessories <span className="text-[10px] uppercase tracking-wider text-copper/80 ml-1">soon</span>
              </li>
              <li className="text-charcoal-soft/70 cursor-default">
                Shoes <span className="text-[10px] uppercase tracking-wider text-copper/80 ml-1">soon</span>
              </li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-cream mb-4 font-medium">
              Help
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/about#faq" className="hover:text-cream transition-colors">FAQ</Link></li>
              <li><Link href="/about#returns" className="hover:text-cream transition-colors">Return Policy</Link></li>
              <li><Link href="/about#delivery" className="hover:text-cream transition-colors">Delivery Info</Link></li>
              <li><Link href="/about#contact" className="hover:text-cream transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-cream mb-4 font-medium">
              Connect
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>WhatsApp: {settings.whatsappNumber}</li>
              <li>Email: {settings.contactEmail}</li>
              <li>Instagram: {settings.instagramHandle}</li>
            </ul>
            {/* Newsletter */}
            <div className="mt-4">
              <p className="text-xs uppercase tracking-wider text-cream mb-2">
                Never miss a drop
              </p>
              <NewsletterForm source="footer" variant="dark" />
            </div>
          </div>
        </div>

        <div className="border-t border-charcoal-mid mt-8 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs">
            &copy; {new Date().getFullYear()} {settings.storeName}. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs">
            <Link href="/privacy" className="hover:text-cream transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-cream transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
