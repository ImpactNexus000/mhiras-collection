"use client"; // Error boundaries must be Client Components

// global-error replaces the root layout, so it must bring its own
// <html>/<body> and global styles.
import "./globals.css";

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center bg-surface px-6 text-center">
        <title>Something went wrong — Mhiras Collection</title>

        <h1 className="text-3xl font-light text-charcoal">
          Something went wrong
        </h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-charcoal-soft">
          We&apos;re having trouble loading Mhiras Collection right now. Please
          try again in a moment.
        </p>
        {error.digest ? (
          <p className="mt-2 text-xs text-charcoal-soft/70">
            Reference: {error.digest}
          </p>
        ) : null}

        <button
          onClick={() => unstable_retry()}
          className="mt-8 cursor-pointer bg-copper px-6 py-3 text-sm font-medium uppercase tracking-wider text-white transition-colors hover:bg-copper-dark"
        >
          Try Again
        </button>
      </body>
    </html>
  );
}
