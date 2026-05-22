"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    // Surface the error in logs / error reporting.
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-surface px-6 py-20 text-center">
      <p className="font-display text-[90px] font-light leading-none text-copper md:text-[120px]">
        Oops
      </p>
      <h1 className="font-display text-3xl font-light italic text-charcoal md:text-4xl">
        Something went wrong.
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-charcoal-soft">
        We hit an unexpected snag loading this page. Please try again — if it
        keeps happening, head back to the shop.
      </p>
      {error.digest ? (
        <p className="mt-2 text-xs text-charcoal-soft/70">
          Reference: {error.digest}
        </p>
      ) : null}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button variant="primary" onClick={() => unstable_retry()}>
          Try Again
        </Button>
        <Link href="/">
          <Button variant="outline">Back to Home</Button>
        </Link>
      </div>
    </div>
  );
}
