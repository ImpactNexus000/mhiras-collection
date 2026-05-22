import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/site";

// Default social-share image, used by any route that doesn't define its own.
export const alt = "Mhiras Collection — Curated Thrift Fashion";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#FAF7F4",
          color: "#1A1614",
          // Copper frame to echo the brand accent.
          borderTop: "16px solid #C4683A",
        }}
      >
        <div
          style={{
            fontSize: 30,
            letterSpacing: 8,
            textTransform: "uppercase",
            color: "#C4683A",
          }}
        >
          Curated Thrift Fashion
        </div>
        <div
          style={{
            fontSize: 96,
            fontWeight: 600,
            marginTop: 24,
            marginBottom: 24,
          }}
        >
          {SITE_NAME}
        </div>
        <div
          style={{
            fontSize: 30,
            color: "#6B5E5A",
            maxWidth: 760,
            textAlign: "center",
          }}
        >
          Handpicked pre-loved pieces, delivered nationwide across Nigeria.
        </div>
      </div>
    ),
    size,
  );
}
