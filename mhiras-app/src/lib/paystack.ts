const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;
const PAYSTACK_BASE_URL = "https://api.paystack.co";

interface PaystackInitializeParams {
  email: string;
  amount: number; // in kobo (NGN × 100)
  reference: string;
  callback_url: string;
  metadata?: Record<string, unknown>;
}

interface PaystackInitializeResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

/**
 * Subset of the authorization Paystack returns alongside a successful
 * charge. We persist the bits needed to re-charge later + display the card.
 */
export interface PaystackAuthorization {
  authorization_code: string;
  bin?: string;
  last4: string;
  exp_month: string;
  exp_year: string;
  channel: string;
  card_type: string; // "visa", "mastercard", "verve", ...
  bank?: string | null;
  brand?: string;
  reusable: boolean;
}

interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    status: string; // "success", "failed", "abandoned"
    reference: string;
    amount: number;
    currency: string;
    channel: string;
    paid_at: string;
    customer: {
      email: string;
    };
    authorization?: PaystackAuthorization;
    metadata: Record<string, unknown>;
  };
}

interface ChargeAuthorizationParams {
  email: string;
  amount: number; // kobo
  authorization_code: string;
  reference: string;
  metadata?: Record<string, unknown>;
}

interface ChargeAuthorizationResponse {
  status: boolean;
  message: string;
  data?: {
    status: string; // "success" | "failed" | "send_otp" | "send_pin" | ...
    reference: string;
    amount: number;
    channel: string;
    paid_at?: string;
    authorization?: PaystackAuthorization;
  };
}

/**
 * Re-charge a returning customer with a stored Paystack authorization.
 * Use only when SavedCard.reusable === true (Paystack flags non-reusable
 * authorizations like USSD / bank-transfer charges).
 */
export async function chargeAuthorization(
  params: ChargeAuthorizationParams
): Promise<ChargeAuthorizationResponse> {
  const res = await fetch(`${PAYSTACK_BASE_URL}/transaction/charge_authorization`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  return res.json();
}

export async function initializeTransaction(
  params: PaystackInitializeParams
): Promise<PaystackInitializeResponse> {
  const res = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Paystack initialization failed: ${error}`);
  }

  return res.json();
}

export async function verifyTransaction(
  reference: string
): Promise<PaystackVerifyResponse> {
  const res = await fetch(
    `${PAYSTACK_BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
    }
  );

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Paystack verification failed: ${error}`);
  }

  return res.json();
}
