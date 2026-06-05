import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Providers } from "@/components/providers";
import { SITE_URL, SITE_NAME } from "@/lib/site";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  style: ["normal", "italic"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

const SITE_TITLE = "Mhiras Collection — Curated Thrift Fashion";
const SITE_DESCRIPTION =
  "Handpicked pre-loved fashion pieces, curated and elevated. Shop unique thrift finds delivered nationwide across Nigeria.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s | Mhiras Collection",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "thrift",
    "fashion",
    "pre-loved",
    "Nigeria",
    "vintage",
    "curated fashion",
    "Mhiras Collection",
    "Mhira",
    "Mhira's",
    "Thrift wears",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    locale: "en_NG",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  verification: {
    // Google Search Console — renders <meta name="google-site-verification">.
    google: "MkBOvggj2_xadFluoRewmDsqBxw4IN1LXTTQPEtVgGQ",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col font-body">
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
