import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { MobileNav } from "@/components/layout/mobile-nav";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-charcoal focus:text-cream focus:px-4 focus:py-2 focus:rounded"
      >
        Skip to main content
      </a>
      <Navbar />
      <main
        id="main-content"
        className="flex-1 pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0"
      >
        {children}
      </main>
      <Footer />
      <MobileNav />
    </>
  );
}
