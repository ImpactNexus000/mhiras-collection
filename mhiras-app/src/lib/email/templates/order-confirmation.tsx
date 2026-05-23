import { Button, Section, Text } from "@react-email/components";
import { EmailLayout, formatNaira, styles } from "./_layout";

export interface OrderConfirmationItem {
  name: string;
  quantity: number;
  size?: string | null;
  price: number;
}

export interface OrderConfirmationProps {
  customerName: string;
  orderNumber: string;
  items: OrderConfirmationItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  fulfillmentType: "IMMEDIATE" | "STOCKPILE";
  stockpileExpiresAt?: Date | null;
  orderUrl: string;
}

export function OrderConfirmationEmail({
  customerName,
  orderNumber,
  items,
  subtotal,
  deliveryFee,
  discount,
  total,
  fulfillmentType,
  stockpileExpiresAt,
  orderUrl,
}: OrderConfirmationProps) {
  const isStockpile = fulfillmentType === "STOCKPILE";
  const preview = isStockpile
    ? `Your stockpile order ${orderNumber} is confirmed`
    : `Your order ${orderNumber} is confirmed`;

  return (
    <EmailLayout preview={preview}>
      <Text style={styles.heading}>Thanks, {customerName}!</Text>
      <Text style={styles.paragraph}>
        {isStockpile
          ? `We've received your stockpile order ${orderNumber}. Your items are safely held with us until you're ready to request delivery.`
          : `We've received your order ${orderNumber} and it's being prepared for delivery.`}
      </Text>

      {isStockpile && stockpileExpiresAt && (
        <Section style={styles.card}>
          <Text style={{ ...styles.small, fontWeight: 600 }}>
            Stockpile window
          </Text>
          <Text style={styles.itemRow}>
            Request delivery any time before{" "}
            <strong>
              {stockpileExpiresAt.toLocaleDateString("en-NG", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </strong>
            .
          </Text>
        </Section>
      )}

      <Section style={styles.card}>
        {items.map((item, i) => (
          <Text key={i} style={styles.itemRow}>
            • {item.name}
            {item.size ? ` (size ${item.size})` : ""} × {item.quantity} —{" "}
            {formatNaira(item.price * item.quantity)}
          </Text>
        ))}
        <Text style={styles.cardRow}>
          <span>Subtotal</span>
          <span>{formatNaira(subtotal)}</span>
        </Text>
        {!isStockpile && (
          <Text style={styles.cardRow}>
            <span>Delivery</span>
            <span>{formatNaira(deliveryFee)}</span>
          </Text>
        )}
        {discount > 0 && (
          <Text style={styles.cardRow}>
            <span>Discount</span>
            <span>− {formatNaira(discount)}</span>
          </Text>
        )}
        <Text style={styles.totalRow}>
          <span>Total</span>
          <span>{formatNaira(total)}</span>
        </Text>
      </Section>

      <Section style={{ textAlign: "center", margin: "24px 0 8px" }}>
        <Button href={orderUrl} style={styles.button}>
          View your order
        </Button>
      </Section>
    </EmailLayout>
  );
}
