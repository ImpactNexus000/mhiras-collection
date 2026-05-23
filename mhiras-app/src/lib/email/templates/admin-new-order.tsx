import { Button, Hr, Section, Text } from "@react-email/components";
import { EmailLayout, styles } from "./_layout";

export interface AdminNewOrderProps {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  itemCount: number;
  total: string;
  fulfillmentType: "IMMEDIATE" | "STOCKPILE";
  paymentChannel: string;
  adminUrl: string;
}

export function AdminNewOrderEmail({
  orderNumber,
  customerName,
  customerEmail,
  customerPhone,
  itemCount,
  total,
  fulfillmentType,
  paymentChannel,
  adminUrl,
}: AdminNewOrderProps) {
  const isStockpile = fulfillmentType === "STOCKPILE";
  return (
    <EmailLayout preview={`Paid order ${orderNumber} — ${total}`}>
      <Text style={styles.heading}>
        {isStockpile ? "Stockpile order paid" : "New paid order"} —{" "}
        {orderNumber}
      </Text>
      <Text style={styles.paragraph}>
        Payment confirmed via {paymentChannel}. Open the dashboard to see the
        items and start fulfillment.
      </Text>

      <Section style={{ background: "#F5F0EB", borderRadius: 4, padding: 16, margin: "20px 0" }}>
        <Text style={{ margin: "0 0 6px", fontSize: 13, color: "#6B5E5A" }}>Customer</Text>
        <Text style={{ margin: 0, fontWeight: 600 }}>{customerName}</Text>
        <Text style={{ margin: 0, fontSize: 13, color: "#3D3330" }}>
          {customerEmail} · {customerPhone || "no phone"}
        </Text>
        <Hr style={{ borderColor: "#E0D5CE", margin: "12px 0" }} />
        <Text style={{ margin: "0 0 4px", fontSize: 13 }}>
          <strong>{itemCount}</strong> item{itemCount === 1 ? "" : "s"} ·{" "}
          <strong>{total}</strong> total
        </Text>
        <Text style={{ margin: 0, fontSize: 13, color: "#3D3330" }}>
          {isStockpile
            ? "Hold these items — customer will request delivery from their stockpile."
            : "Customer is waiting for delivery."}
        </Text>
      </Section>

      <Section style={{ textAlign: "center", margin: "20px 0 8px" }}>
        <Button href={adminUrl} style={styles.button}>
          Open order in admin
        </Button>
      </Section>
    </EmailLayout>
  );
}
