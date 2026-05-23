import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { ReactNode } from "react";

const colors = {
  copper: "#C4683A",
  charcoal: "#1A1614",
  charcoalMid: "#3D3330",
  charcoalSoft: "#6B5E5A",
  cream: "#FAF7F4",
  surface: "#F5F0EB",
  border: "#E0D5CE",
};

const body = {
  backgroundColor: colors.cream,
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
  color: colors.charcoal,
  margin: 0,
  padding: 0,
};

const container = {
  maxWidth: "560px",
  margin: "0 auto",
  padding: "32px 24px",
};

const header = {
  textAlign: "center" as const,
  paddingBottom: "24px",
  borderBottom: `1px solid ${colors.border}`,
};

const brand = {
  fontSize: "22px",
  fontWeight: "700",
  letterSpacing: "0.08em",
  textTransform: "uppercase" as const,
  color: colors.copper,
  margin: 0,
};

const tagline = {
  fontSize: "12px",
  color: colors.charcoalSoft,
  letterSpacing: "0.04em",
  margin: "4px 0 0",
};

const footer = {
  paddingTop: "24px",
  borderTop: `1px solid ${colors.border}`,
  textAlign: "center" as const,
};

const footerText = {
  fontSize: "12px",
  color: colors.charcoalSoft,
  lineHeight: "1.6",
  margin: "4px 0",
};

interface Props {
  preview: string;
  children: ReactNode;
}

export function EmailLayout({ preview, children }: Props) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={header}>
            <Text style={brand}>Mhiras Collection</Text>
            <Text style={tagline}>Curated thrift, hand-picked for you</Text>
          </Section>
          <Section style={{ padding: "24px 0" }}>{children}</Section>
          <Hr style={{ borderColor: colors.border, margin: 0 }} />
          <Section style={footer}>
            <Text style={footerText}>
              Mhiras Collection · Lagos, Nigeria
            </Text>
            <Text style={footerText}>
              Questions? Reply to this email — we&apos;re here to help.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export const styles = {
  colors,
  heading: {
    fontSize: "20px",
    fontWeight: "600",
    color: colors.charcoal,
    margin: "0 0 12px",
  },
  paragraph: {
    fontSize: "15px",
    lineHeight: "1.6",
    color: colors.charcoalMid,
    margin: "0 0 16px",
  },
  small: {
    fontSize: "13px",
    color: colors.charcoalSoft,
    margin: 0,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: "8px",
    padding: "16px 20px",
    margin: "16px 0",
  },
  cardRow: {
    display: "flex",
    justifyContent: "space-between" as const,
    fontSize: "14px",
    color: colors.charcoalMid,
    margin: "6px 0",
  },
  totalRow: {
    display: "flex",
    justifyContent: "space-between" as const,
    fontSize: "16px",
    fontWeight: "600",
    color: colors.charcoal,
    margin: "12px 0 0",
    paddingTop: "12px",
    borderTop: `1px solid ${colors.border}`,
  },
  button: {
    display: "inline-block",
    backgroundColor: colors.copper,
    color: "#ffffff",
    padding: "12px 28px",
    borderRadius: "6px",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "600",
    letterSpacing: "0.04em",
  },
  itemRow: {
    fontSize: "14px",
    color: colors.charcoalMid,
    margin: "4px 0",
  },
};

export function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString("en-NG")}`;
}
