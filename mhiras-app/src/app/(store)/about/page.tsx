import { Metadata } from "next";
import Image from "next/image";
import { Check, Recycle, BadgeDollarSign, Heart } from "lucide-react";
import { FaqAccordion, type FaqItem } from "@/components/store/faq-accordion";
import { getStoreSettings } from "@/lib/queries/settings";

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

const faqs: FaqItem[] = [
  {
    q: "How do you source your items?",
    a: "We curate every piece by hand from trusted UK and US suppliers and local sources, inspecting each item for quality before listing. Bales are graded UK ~55kg standard.",
  },
  {
    q: "What is your return policy?",
    a: "Because every retail piece is one-of-a-kind, returns are accepted within 48 hours of delivery for sizing or condition concerns. WhatsApp us with photos and your order number and we'll sort it out.",
  },
  {
    q: "How long does delivery take?",
    a: "Lagos and Abuja: 3–5 days. Other states: 3–7 days depending on the zone. You'll see the exact delivery fee and timing at checkout once you pick your state. Once in a while transport services run slow and a delivery might take longer than the estimate — rest assured your order will still get to you, and we'll keep you posted if anything's held up.",
  },
  {
    q: "Can I pay on delivery?",
    a: "We currently accept secure card payment via Paystack. Pay-on-delivery isn't available across all zones yet — we'll add it as we expand.",
  },
  {
    q: "Do you accept bulk orders?",
    a: "Yes — head to the Bales section for our wholesale catalogue. Bales are UK ~55kg, sorted and graded, ideal for resellers and boutiques.",
  },
];

export default async function AboutPage() {
  const settings = await getStoreSettings();

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
              {settings.storeName} started as a passion project — curating
              beautiful pre-loved fashion pieces and sharing them on WhatsApp.
              What began as a small thrift page has grown into a community of
              fashion-forward individuals who believe style shouldn&apos;t break
              the bank, and great pieces deserve a second life.
            </p>
          </div>
          <div className="relative w-full min-h-[280px] md:min-h-[360px] rounded-lg overflow-hidden bg-charcoal-mid">
            <Image
              src="/founder.jpeg"
              alt={`${settings.storeName} founder`}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              priority
              unoptimized
              className="object-cover object-[center_30%]"
            />
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
                <v.icon size={22} className="text-copper" aria-hidden="true" />
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
      <section
        id="faq"
        className="max-w-6xl mx-auto px-6 py-12 scroll-mt-4"
      >
        <div className="grid md:grid-cols-2 gap-10">
          {/* Contact */}
          <div id="contact" className="scroll-mt-4">
            <h2 className="font-display text-2xl font-light italic mb-5">
              Get in Touch
            </h2>
            <div className="text-sm leading-loose text-charcoal-soft space-y-1">
              <p>
                <strong className="text-charcoal">WhatsApp:</strong>{" "}
                {settings.whatsappNumber}
              </p>
              <p>
                <strong className="text-charcoal">Email:</strong>{" "}
                {settings.contactEmail}
              </p>
              <p>
                <strong className="text-charcoal">Instagram:</strong>{" "}
                {settings.instagramHandle}
              </p>
              <p>
                <strong className="text-charcoal">Hours:</strong> Mon–Sat, 9 AM
                – 8 PM
              </p>
            </div>
          </div>

          {/* FAQ */}
          <div>
            <h2 className="font-display text-2xl font-light italic mb-5">
              FAQ
            </h2>
            <FaqAccordion items={faqs} />
          </div>
        </div>
      </section>
    </>
  );
}
