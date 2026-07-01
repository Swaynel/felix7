// lib/paystack.ts
import crypto from "crypto";

const PAYSTACK_BASE = "https://api.paystack.co";

/**
 * Initializes a Paystack transaction server-side. Returns the authorization_url
 * to redirect the customer to. Never trust amounts sent from the client —
 * recompute totalMinor from the Order record server-side before calling this.
 */
export async function initializePaystackTransaction(params: {
  email: string;
  amountMinor: number; // Paystack expects amount in the smallest currency unit (kobo for NGN)
  reference: string;   // must match Order.paystackReference, generated server-side
  currency?: string;
  callbackUrl: string;
}) {
  const res = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: params.email,
      amount: params.amountMinor,
      reference: params.reference,
      currency: params.currency || "NGN",
      callback_url: params.callbackUrl,
    }),
  });

  if (!res.ok) {
    throw new Error(`Paystack initialize failed: ${res.status} ${await res.text()}`);
  }
  return res.json() as Promise<{
    status: boolean;
    data: { authorization_url: string; access_code: string; reference: string };
  }>;
}

/**
 * Verifies a webhook payload's signature against Paystack's secret key.
 * CRITICAL: do not process any webhook body whose signature fails this
 * check. This is what prevents an attacker from POSTing a fake
 * "charge.success" event directly to your webhook endpoint to unlock
 * free downloads.
 */
export function verifyPaystackSignature(rawBody: string, signatureHeader: string | null): boolean {
  if (!signatureHeader) return false;
  const hash = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!)
    .update(rawBody)
    .digest("hex");
  return hash === signatureHeader;
}

/**
 * Server-to-server verification of a transaction, used as a second check
 * in addition to webhook signature verification — belt and suspenders for
 * a payment-critical path. Call this inside the webhook handler before
 * trusting charge.success.
 */
export async function verifyPaystackTransaction(reference: string) {
  const res = await fetch(`${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
  });
  if (!res.ok) {
    throw new Error(`Paystack verify failed: ${res.status} ${await res.text()}`);
  }
  return res.json() as Promise<{
    status: boolean;
    data: { status: string; reference: string; amount: number; currency: string };
  }>;
}
