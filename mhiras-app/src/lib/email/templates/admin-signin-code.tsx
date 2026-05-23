import { Section, Text } from "@react-email/components";
import { EmailLayout, styles } from "./_layout";

export interface AdminSigninCodeProps {
  adminName: string;
  code: string;
  expiresMinutes: number;
}

export function AdminSigninCodeEmail({
  adminName,
  code,
  expiresMinutes,
}: AdminSigninCodeProps) {
  return (
    <EmailLayout preview={`Mhiras Collection admin sign-in code: ${code}`}>
      <Text style={styles.heading}>Admin sign-in, {adminName}</Text>
      <Text style={styles.paragraph}>
        Use this code to finish signing into the Mhiras Collection admin. It
        expires in {expiresMinutes} minutes and can only be used once.
      </Text>
      <Section
        style={{
          textAlign: "center",
          margin: "28px 0",
          padding: "20px 0",
          background: "#F5F0EB",
          borderRadius: 4,
        }}
      >
        <Text
          style={{
            margin: 0,
            fontSize: 32,
            letterSpacing: 8,
            fontWeight: 600,
            color: "#1A1614",
            fontFamily: "monospace",
          }}
        >
          {code}
        </Text>
      </Section>
      <Text style={styles.paragraph}>
        Didn&apos;t try to sign in? Someone has your password — change it
        immediately and review recent orders.
      </Text>
    </EmailLayout>
  );
}
