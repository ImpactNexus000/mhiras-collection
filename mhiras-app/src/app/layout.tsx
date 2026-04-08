import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
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

export const metadata: Metadata = {
  title: {
    default: "Mhiras Collection — Curated Thrift Fashion",
    template: "%s | Mhiras Collection",
  },
  description:
    "Handpicked pre-loved fashion pieces, curated and elevated. Shop unique thrift finds delivered nationwide across Nigeria.",
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
    "Thrift wears"
  ],
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
      <body className="min-h-full flex flex-col font-body">{children}</body>
    </html>
  );
}
