import { Button, Section, Text } from "@react-email/components";
import { EmailLayout, styles } from "./_layout";

export type OrderStatusKind = "SHIPPED" | "DELIVERED" | "PROCESSING";

export interface OrderStatusProps {
  customerName: string;
  orderNumber: string;
  status: OrderStatusKind;
  note?: string | null;
  orderUrl: string;
}

const copy: Record<
  OrderStatusKind,
  { heading: string; body: string; cta: string; preview: string }
> = {
  PROCESSING: {
    heading: "Your order is being prepared",
    body: "We're packing your order now and it'll be on its way to you soon.",
    cta: "Track your order",
    preview: "Your order is being prepared",
  },
  SHIPPED: {
    heading: "Your order is on the way",
    body: "Great news — your order has been shipped and is on its way to you.",
    cta: "Track your order",
    preview: "Your order has shipped",
  },
  DELIVERED: {
    heading: "Your order has been delivered",
    body: "Your order has been marked as delivered. We hope you love your pieces — thanks for shopping with Mhiras Collection.",
    cta: "View order",
    preview: "Your order has been delivered",
  },
};

export function OrderStatusEmail({
  customerName,
  orderNumber,
  status,
  note,
  orderUrl,
}: OrderStatusProps) {
  const c = copy[status];
  return (
    <EmailLayout preview={c.preview}>
      <Text style={styles.heading}>{c.heading}</Text>
      <Text style={styles.paragraph}>
        Hi {customerName}, an update on order <strong>{orderNumber}</strong>:{" "}
        {c.body}
      </Text>
      {note && (
        <Section style={styles.card}>
          <Text style={styles.itemRow}>{note}</Text>
        </Section>
      )}
      <Section style={{ textAlign: "center", margin: "24px 0 8px" }}>
        <Button href={orderUrl} style={styles.button}>
          {c.cta}
        </Button>
      </Section>
    </EmailLayout>
  );
}
