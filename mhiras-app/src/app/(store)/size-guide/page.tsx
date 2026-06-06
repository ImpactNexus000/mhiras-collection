import type { Metadata } from "next";
import { SizeGuideContent } from "@/components/store/size-guide-content";

export const metadata: Metadata = {
  title: "Size Guide",
  description:
    "Find your fit — UK/US/EU size conversions and body measurements for Mhiras Collection thrift fashion.",
};

export default function SizeGuidePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-10">
      <h1 className="font-display text-4xl font-light italic mb-2">Size Guide</h1>
      <p className="text-sm text-charcoal-soft mb-6">
        Find your fit before you buy.
      </p>
      <SizeGuideContent />
    </div>
  );
}
