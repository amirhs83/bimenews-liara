export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import localFont from "next/font/local";
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

const iransans = localFont({
  src: [
    {
      path: "./fonts/IRANSansWeb_Light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "./fonts/IRANSansWeb.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/IRANSansWeb_Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/IRANSansWeb_Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-iransans",
  display: "swap",
  preload: true,
  adjustFontFallback: "Arial",
});

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
    <html lang="fa" dir="rtl" suppressHydrationWarning className={iransans.variable}>
      <body
        className="text-justify antialiased bg-white text-zinc-900 min-h-screen flex flex-col"
        style={{ fontFamily: "var(--font-iransans), Tahoma, Arial, sans-serif" }}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
