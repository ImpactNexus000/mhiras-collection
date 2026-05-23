import { Button, Section, Text } from "@react-email/components";
import { EmailLayout, formatNaira, styles } from "./_layout";

export interface PaymentConfirmedProps {
  customerName: string;
  orderNumber: string;
  total: number;
  channel?: string | null;
  fulfillmentType: "IMMEDIATE" | "STOCKPILE";
  orderUrl: string;
}

export function PaymentConfirmedEmail({
  customerName,
  orderNumber,
  total,
  channel,
  fulfillmentType,
  orderUrl,
}: PaymentConfirmedProps) {
  const isStockpile = fulfillmentType === "STOCKPILE";

  return (
    <EmailLayout preview={`Payment received for ${orderNumber}`}>
      <Text style={styles.heading}>Payment received</Text>
      <Text style={styles.paragraph}>
        Hi {customerName}, we&apos;ve confirmed your payment of{" "}
        <strong>{formatNaira(total)}</strong> for order{" "}
        <strong>{orderNumber}</strong>
        {channel ? ` (via ${channel})` : ""}.
      </Text>

      <Text style={styles.paragraph}>
        {isStockpile
          ? `Your items are now in your stockpile. You can request delivery whenever you're ready from your account.`
          : `Your order is now confirmed and will be prepared for delivery shortly. We'll let you know as soon as it ships.`}
      </Text>

      <Section style={{ textAlign: "center", margin: "24px 0 8px" }}>
        <Button href={orderUrl} style={styles.button}>
          {isStockpile ? "View your stockpile" : "Track your order"}
        </Button>
      </Section>
    </EmailLayout>
  );
}
