import "server-only";

type CinetPayConfig = { apiKey: string; siteId: string; baseUrl: string };
export type PaymentInitInput = {
  transactionId: string;
  amount: number;
  currency: "XOF" | "XAF" | "GNF" | "CDF";
  description: string;
  customerEmail: string;
  customerName: string;
  returnUrl: string;
  notifyUrl: string;
  country: string;
};

function getConfig(): CinetPayConfig {
  const apiKey = process.env.CINETPAY_API_KEY;
  const siteId = process.env.CINETPAY_SITE_ID;
  if (!apiKey || !siteId) throw new Error("CinetPay is not configured on the server.");
  return { apiKey, siteId, baseUrl: process.env.CINETPAY_BASE_URL || "https://api-checkout.cinetpay.com" };
}

/**
 * Safe integration boundary only. Real checkout is intentionally disabled until
 * the official API flow, persisted order, idempotency and server notification
 * verification are implemented and tested with merchant credentials.
 */
export async function initializeCinetPayPayment(input: PaymentInitInput): Promise<never> {
  void input;
  getConfig();
  throw new Error("Checkout is not enabled yet. Implement and test the official CinetPay flow before accepting real payments.");
}
export function isCinetPayConfigured(): boolean {
  return Boolean(process.env.CINETPAY_API_KEY && process.env.CINETPAY_SITE_ID);
}