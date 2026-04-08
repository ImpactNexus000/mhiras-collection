import { Metadata } from "next";
import { Check, Recycle, BadgeDollarSign, Heart } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Mhiras Collection — our story, values, and mission to make curated thrift fashion accessible.",
};

const values = [
  {
    icon: Check,
    title: "Quality First",
    description:
      "Every item is hand-inspected. We only list pieces we'd wear ourselves.",
  },
  {
    icon: Recycle,
    title: "Sustainable Fashion",
    description:
      "Pre-loved fashion reduces waste. Every purchase is a step towards a greener future.",
  },
  {
    icon: BadgeDollarSign,
    title: "Honest Pricing",
    description:
      "Premium pieces at fair prices. No hidden fees, no inflated markups.",
  },
  {
    icon: Heart,
    title: "Community Driven",
    description:
      "Built by our customers' feedback. Your voice shapes what we curate next.",
  },
];

const stats = [
  { value: "2,400+", label: "Items Sold" },
  { value: "800+", label: "Happy Customers" },
  { value: "4.8", label: "Average Rating" },
  { value: "36", label: "States Delivered" },
];

const faqs = [
  "How do you source your items?",
  "What is your return policy?",
  "How long does delivery take?",
  "Can I pay on delivery?",
  "Do you accept bulk orders?",
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-charcoal">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 px-6 py-12 md:py-16">
          <div className="flex flex-col justify-center">
            <span className="text-xs tracking-widest uppercase text-copper mb-3">
              Our Story
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-light text-cream italic leading-tight mb-5">
              Fashion Deserves
              <br />a <em className="text-gold">Second Life</em>
            </h1>
            <p className="text-sm md:text-base text-charcoal-soft leading-relaxed max-w-md">
              Mhiras Collection started as a passion project — curating beautiful
              pre-loved fashion pieces and sharing them on WhatsApp. What began as
              a small thrift page has grown into a community of fashion-forward
              individuals who believe style shouldn&apos;t break the bank, and
              great pieces deserve a second life.
            </p>
          </div>
          <div className="bg-gradient-to-br from-[#3D2E28] to-[#2A1F1C] rounded-lg flex items-center justify-center min-h-[280px]">
            <div className="text-center">
              <div className="font-display text-8xl font-light text-gold/30 italic">
                M
              </div>
              <div className="text-[10px] tracking-widest uppercase text-charcoal-soft mt-2">
                Founder Photo
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="font-display text-3xl font-light italic text-center mb-10">
          What We Stand For
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {values.map((v) => (
            <div key={v.title} className="text-center">
              <div className="w-14 h-14 rounded-full bg-copper-light flex items-center justify-center mx-auto mb-3">
                <v.icon size={22} className="text-copper" />
              </div>
              <h3 className="text-sm font-medium mb-2">{v.title}</h3>
              <p className="text-sm text-charcoal-soft leading-relaxed">
                {v.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="bg-copper-light">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 text-center py-8 px-6 gap-6">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="font-display text-4xl font-light text-copper-dark">
                {s.value}
              </div>
              <div className="text-xs uppercase tracking-wider text-charcoal-soft mt-1">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact + FAQ */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 gap-10">
          {/* Contact */}
          <div>
            <h2 className="font-display text-2xl font-light italic mb-5">
              Get in Touch
            </h2>
            <div className="text-sm leading-loose text-charcoal-soft space-y-1">
              <p>
                <strong className="text-charcoal">WhatsApp:</strong> +234 801 234
                5678
              </p>
              <p>
                <strong className="text-charcoal">Email:</strong>{" "}
                hello@mhirascollection.com
              </p>
              <p>
                <strong className="text-charcoal">Instagram:</strong>{" "}
                @mhirascollection
              </p>
              <p>
                <strong className="text-charcoal">Hours:</strong> Mon–Sat, 9 AM –
                8 PM
              </p>
            </div>
          </div>

          {/* FAQ */}
          <div>
            <h2 className="font-display text-2xl font-light italic mb-5">
              FAQ
            </h2>
            <div className="border border-border rounded overflow-hidden">
              {faqs.map((q, i) => (
                <div
                  key={q}
                  className={`flex justify-between items-center px-4 py-3.5 text-sm cursor-pointer hover:bg-cream-dark transition-colors ${
                    i < faqs.length - 1 ? "border-b border-border" : ""
                  }`}
                >
                  <span>{q}</span>
                  <span className="text-copper text-lg">+</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
