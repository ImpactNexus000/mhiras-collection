import { Button, Section, Text } from "@react-email/components";
import { EmailLayout, formatNaira, styles } from "./_layout";

export interface AdminDeliveryRequestItem {
  name: string;
  quantity: number;
  size?: string | null;
}

export interface AdminDeliveryRequestProps {
  requestNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  itemCount: number;
  items: AdminDeliveryRequestItem[];
  deliveryFee: number;
  addressLine: string;
  city: string;
  state: string;
  adminUrl: string;
}

export function AdminDeliveryRequestEmail({
  requestNumber,
  customerName,
  customerEmail,
  customerPhone,
  itemCount,
  items,
  deliveryFee,
  addressLine,
  city,
  state,
  adminUrl,
}: AdminDeliveryRequestProps) {
  return (
    <EmailLayout preview={`New stockpile delivery request ${requestNumber}`}>
      <Text style={styles.heading}>New delivery request</Text>
      <Text style={styles.paragraph}>
        <strong>{customerName}</strong> has requested delivery of{" "}
        <strong>{itemCount}</strong> item{itemCount === 1 ? "" : "s"} from their
        stockpile. Request <strong>{requestNumber}</strong>.
      </Text>

      <Section style={styles.card}>
        <Text style={{ ...styles.small, fontWeight: 600 }}>Customer</Text>
        <Text style={styles.itemRow}>{customerName}</Text>
        <Text style={styles.itemRow}>{customerEmail}</Text>
        <Text style={styles.itemRow}>{customerPhone}</Text>
      </Section>

      <Section style={styles.card}>
        <Text style={{ ...styles.small, fontWeight: 600 }}>Deliver to</Text>
        <Text style={styles.itemRow}>{addressLine}</Text>
        <Text style={styles.itemRow}>
          {city}, {state}
        </Text>
        <Text style={styles.itemRow}>
          Delivery fee: <strong>{formatNaira(deliveryFee)}</strong> (customer
          pays separately)
        </Text>
      </Section>

      <Section style={styles.card}>
        <Text style={{ ...styles.small, fontWeight: 600 }}>Items</Text>
        {items.map((it, i) => (
          <Text key={i} style={styles.itemRow}>
            • {it.name}
            {it.size ? ` (size ${it.size})` : ""} × {it.quantity}
          </Text>
        ))}
      </Section>

      <Section style={{ textAlign: "center", margin: "24px 0 8px" }}>
        <Button href={adminUrl} style={styles.button}>
          Open in admin
        </Button>
      </Section>
    </EmailLayout>
  );
}
