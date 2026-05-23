import { Button, Section, Text } from "@react-email/components";
import { EmailLayout, styles } from "./_layout";

export interface PasswordResetProps {
  customerName: string;
  resetUrl: string;
  expiresMinutes: number;
}

export function PasswordResetEmail({
  customerName,
  resetUrl,
  expiresMinutes,
}: PasswordResetProps) {
  return (
    <EmailLayout preview="Reset your Mhiras Collection password">
      <Text style={styles.heading}>Reset your password, {customerName}</Text>
      <Text style={styles.paragraph}>
        Click the button below to choose a new password. The link expires in{" "}
        {expiresMinutes} minutes and can only be used once.
      </Text>
      <Section style={{ textAlign: "center", margin: "28px 0" }}>
        <Button href={resetUrl} style={styles.button}>
          Reset password
        </Button>
      </Section>
      <Text style={styles.paragraph}>
        If the button doesn&apos;t work, copy and paste this link into your
        browser:
      </Text>
      <Text style={{ ...styles.paragraph, wordBreak: "break-all", fontSize: 12 }}>
        {resetUrl}
      </Text>
      <Text style={styles.paragraph}>
        If you didn&apos;t request this, you can ignore the email — your
        password will stay the same.
      </Text>
    </EmailLayout>
  );
}
