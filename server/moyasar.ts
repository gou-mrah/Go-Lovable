import { createHmac } from "crypto";
import { ENV } from "./_core/env";

const MOYASAR_BASE = "https://api.moyasar.com/v1";

function authHeader() {
  return "Basic " + Buffer.from(ENV.moyasarSecretKey + ":").toString("base64");
}

// ─── Invoice API (Hosted Checkout) ───────────────────────────────────────────
// Creates a hosted checkout page on checkout.moyasar.com — no SDK/iframe needed.
// User is redirected to the URL, pays there, then redirected back via callback_url.
export async function createInvoice(params: {
  amount: number;       // بالهللات (ريال × 100)
  currency: string;     // SAR
  description: string;
  callback_url: string;
  back_url?: string;
  success_url?: string;
  metadata?: Record<string, string>;
}) {
  const res = await fetch(`${MOYASAR_BASE}/invoices`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader(),
    },
    body: JSON.stringify({
      amount: params.amount,
      currency: params.currency,
      description: params.description,
      callback_url: params.callback_url,
      back_url: params.back_url,
      success_url: params.success_url,
      metadata: params.metadata ?? {},
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Moyasar createInvoice failed: ${err}`);
  }
  return res.json() as Promise<{
    id: string;
    status: "initiated" | "paid" | "failed";
    amount: number;
    currency: string;
    description: string;
    url: string;  // https://checkout.moyasar.com/invoices/:id
    callback_url: string;
    created_at: string;
    payments: Array<{ id: string; status: string; source: { type: string } }>;
  }>;
}

// جلب حالة الـ invoice
export async function getInvoice(invoiceId: string) {
  const res = await fetch(`${MOYASAR_BASE}/invoices/${invoiceId}`, {
    headers: { Authorization: authHeader() },
  });
  if (!res.ok) throw new Error("Moyasar getInvoice failed");
  return res.json() as Promise<{
    id: string;
    status: "initiated" | "paid" | "failed";
    amount: number;
    currency: string;
    payments: Array<{ id: string; status: string; source: { type: string } }>;
  }>;
}

// ─── Direct Payment API (legacy, kept for webhook verification) ───────────────
export async function createPayment(params: {
  amount: number;
  currency: string;
  description: string;
  callback_url: string;
  metadata?: Record<string, string>;
}) {
  const res = await fetch(`${MOYASAR_BASE}/payments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader(),
    },
    body: JSON.stringify({
      amount: params.amount,
      currency: params.currency,
      description: params.description,
      callback_url: params.callback_url,
      source: { type: "creditcard" },
      metadata: params.metadata ?? {},
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Moyasar createPayment failed: ${err}`);
  }
  return res.json() as Promise<{
    id: string;
    status: "initiated" | "paid" | "failed" | "authorized";
    amount: number;
    currency: string;
    source: { transaction_url?: string; company?: string; type: string };
  }>;
}

// جلب حالة الدفع المباشر
export async function getPayment(paymentId: string) {
  const res = await fetch(`${MOYASAR_BASE}/payments/${paymentId}`, {
    headers: { Authorization: authHeader() },
  });
  if (!res.ok) throw new Error("Moyasar getPayment failed");
  return res.json() as Promise<{
    id: string;
    status: "initiated" | "paid" | "failed" | "authorized" | "captured";
    amount: number;
    currency: string;
    metadata?: Record<string, string>;
  }>;
}

// التحقق من webhook signature
export function verifyWebhookSignature(payload: string, signature: string): boolean {
  const expected = createHmac("sha256", ENV.moyasarWebhookSecret)
    .update(payload)
    .digest("hex");
  return expected === signature;
}

// تحويل من SAR إلى هللات
export function sarToHalala(sar: number): number {
  return Math.round(sar * 100);
}
