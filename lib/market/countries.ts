export const MARKET_COUNTRIES = {
  BJ: { name: "Bénin", currency: "XOF" },
  CI: { name: "Côte d’Ivoire", currency: "XOF" },
  SN: { name: "Sénégal", currency: "XOF" },
  BF: { name: "Burkina Faso", currency: "XOF" },
  ML: { name: "Mali", currency: "XOF" },
  TG: { name: "Togo", currency: "XOF" },
  NE: { name: "Niger", currency: "XOF" },
  GN: { name: "Guinée", currency: "GNF" },
  CM: { name: "Cameroun", currency: "XAF" },
  CD: { name: "République démocratique du Congo", currency: "CDF" }
} as const;
export type MarketCountryCode = keyof typeof MARKET_COUNTRIES;
export function isMarketCountryCode(value: string): value is MarketCountryCode {
  return Object.prototype.hasOwnProperty.call(MARKET_COUNTRIES, value);
}
