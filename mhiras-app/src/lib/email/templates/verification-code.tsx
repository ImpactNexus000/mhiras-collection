import { Section, Text } from "@react-email/components";
import { EmailLayout, styles } from "./_layout";

export interface VerificationCodeProps {
  customerName: string;
  code: string;
  expiresMinutes: number;
}

export function VerificationCodeEmail({
  customerName,
  code,
  expiresMinutes,
}: VerificationCodeProps) {
  return (
    <EmailLayout preview={`Your Mhiras Collection verification code: ${code}`}>
      <Text style={styles.heading}>Verify your email, {customerName}</Text>
      <Text style={styles.paragraph}>
        Use the code below to finish setting up your Mhiras Collection account.
        It expires in {expiresMinutes} minutes.
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
        If you didn&apos;t create an account, you can safely ignore this email.
      </Text>
    </EmailLayout>
  );
}
