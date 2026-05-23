import { Button, Section, Text } from "@react-email/components";
import { EmailLayout, styles } from "./_layout";

export interface WelcomeProps {
  customerName: string;
  shopUrl: string;
}

export function WelcomeEmail({ customerName, shopUrl }: WelcomeProps) {
  return (
    <EmailLayout preview="Welcome to Mhiras Collection">
      <Text style={styles.heading}>Welcome, {customerName}!</Text>
      <Text style={styles.paragraph}>
        Thanks for joining Mhiras Collection. We curate quality thrift pieces —
        sexy dresses, sun dresses, jean gowns and more — and pick out only the
        best for our customers.
      </Text>
      <Text style={styles.paragraph}>
        New arrivals drop regularly, and you can also explore our wholesale
        bales if you&apos;re a reseller. We&apos;re glad to have you with us.
      </Text>
      <Section style={{ textAlign: "center", margin: "24px 0 8px" }}>
        <Button href={shopUrl} style={styles.button}>
          Start shopping
        </Button>
      </Section>
    </EmailLayout>
  );
}
