import { Button, Hr, Section, Text } from "@react-email/components";
import { EmailLayout, styles } from "./_layout";

export interface AdminRefundRequiredProps {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  total: string;
  paymentRef: string;
  paymentChannel: string;
  adminUrl: string;
}

export function AdminRefundRequiredEmail({
  orderNumber,
  customerName,
  customerEmail,
  customerPhone,
  total,
  paymentRef,
  paymentChannel,
  adminUrl,
}: AdminRefundRequiredProps) {
  return (
    <EmailLayout preview={`Refund required — ${orderNumber} (${total})`}>
      <Text style={styles.heading}>Refund required — {orderNumber}</Text>
      <Text style={styles.paragraph}>
        A payment landed on this order <strong>after it was cancelled</strong>,
        and the item had already sold to someone else — so it can&apos;t be
        fulfilled. The customer has been charged and needs a manual refund in
        Paystack.
      </Text>

      <Section
        style={{
          background: "#FBEAEA",
          borderRadius: 4,
          padding: 16,
          margin: "20px 0",
        }}
      >
        <Text style={{ margin: "0 0 6px", fontSize: 13, color: "#6B5E5A" }}>
          Customer
        </Text>
        <Text style={{ margin: 0, fontWeight: 600 }}>{customerName}</Text>
        <Text style={{ margin: 0, fontSize: 13, color: "#3D3330" }}>
          {customerEmail} · {customerPhone || "no phone"}
        </Text>
        <Hr style={{ borderColor: "#E0D5CE", margin: "12px 0" }} />
        <Text style={{ margin: "0 0 4px", fontSize: 13 }}>
          <strong>{total}</strong> charged via {paymentChannel}
        </Text>
        <Text style={{ margin: 0, fontSize: 13, color: "#3D3330" }}>
          Paystack ref: {paymentRef}
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
