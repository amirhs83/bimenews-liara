export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import "@fontsource/vazirmatn/400.css";
import "@fontsource/vazirmatn/500.css";
import "@fontsource/vazirmatn/600.css";
import "@fontsource/vazirmatn/700.css";
import "@fontsource/vazirmatn/800.css";
import "@fontsource/vazirmatn/900.css";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import {
  absoluteUrl,
  rssAlternates,
  siteDescription,
  siteKeywords,
  siteName,
  siteTagline,
  siteUrl,
} from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} | ${siteTagline}`,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  keywords: siteKeywords,
  authors: [{ name: siteName }],
  alternates: {
    ...rssAlternates,
  },
  openGraph: {
    type: "website",
    siteName,
    locale: "fa_IR",
    title: `${siteName} | ${siteTagline}`,
    description: siteDescription,
    url: siteUrl,
    images: [{ url: absoluteUrl("/og-default.png"), alt: siteName }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@bimenews",
    title: `${siteName} | ${siteTagline}`,
    description: siteDescription,
    images: [absoluteUrl("/og-default.png")],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body className="font-vazir antialiased bg-white text-zinc-900 min-h-screen flex flex-col">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
