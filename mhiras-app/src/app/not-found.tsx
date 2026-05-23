import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-surface px-6 py-20 text-center">
      <Image
        src="/logo-nav.png"
        alt="Mhiras Collection"
        width={843}
        height={273}
        unoptimized
        className="h-9 w-auto opacity-90"
      />

      <p className="mt-12 font-display text-[110px] font-light leading-none text-copper md:text-[150px]">
        404
      </p>
      <h1 className="font-display text-3xl font-light italic text-charcoal md:text-4xl">
        This piece has been thrifted.
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-charcoal-soft">
        The page you&apos;re looking for doesn&apos;t exist — it may have sold
        out, moved, or never existed. Every item here is one of a kind, after
        all.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href="/shop">
          <Button variant="primary">Shop the Collection</Button>
        </Link>
        <Link href="/">
          <Button variant="outline">Back to Home</Button>
        </Link>
      </div>
    </div>
  );
}
