import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://els-shop-marketplace.vercel.app");
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "ELS SHOP MARKETPLACE — Achetez et vendez en Afrique", template: "%s | ELS SHOP MARKETPLACE" },
  description: "Découvrez des produits physiques et numériques, comparez les offres et achetez auprès de vendeurs africains sur ELS SHOP MARKETPLACE.",
  applicationName: "ELS SHOP MARKETPLACE",
  keywords: ["marketplace africaine", "acheter en Afrique", "vendre en ligne", "Mobile Money", "produits numériques", "ELS SHOP"],
  openGraph: {
    type: "website", locale: "fr_FR", siteName: "ELS SHOP MARKETPLACE",
    title: "ELS SHOP MARKETPLACE — Le commerce africain, sans frontières",
    description: "Une place de marché pour découvrir, acheter et vendre des produits physiques et numériques."
  },
  robots: { index: true, follow: true }
};
export const viewport: Viewport = { themeColor: "#174B37", width: "device-width", initialScale: 1 };
export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <html lang="fr"><body>{children}</body></html>;
}