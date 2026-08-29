import type { Metadata } from "next";
import SiteHeader from "@/components/petro/site-header";
import CommodityTicker from "@/components/petro/commodity-ticker";
import TopNewsStrip from "@/components/petro/top-news-strip";
import MagazineSection from "@/components/petro/magazine-section";
import LatestVideosSection from "@/components/petro/latest-videos-section";
import SocialEnergySection from "@/components/petro/social-energy-section";
import EconomyNewsSection from "@/components/petro/economy-news-section";
import MultimediaSection from "@/components/petro/multimedia-section";
import LatestArticlesSection from "@/components/petro/latest-articles-section";
import SiteFooter from "@/components/petro/site-footer";
import BackToTop from "@/components/petro/back-to-top";
import {
  getHomeSectionPosts,
  getLatestPosts,
  getMostViewedPosts,
  getNavCategories,
} from "@/lib/home-data";
import {
  absoluteUrl,
  rssAlternates,
  siteDescription,
  siteName,
  siteTagline,
  siteUrl,
} from "@/lib/site";

// homepage reflects the latest published content, cached briefly
export const revalidate = 60;

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "NewsMediaOrganization",
  name: siteName,
  url: siteUrl,
  logo: absoluteUrl("/og-default.png"),
  sameAs: [
    "https://twitter.com/bimenews",
    "https://www.facebook.com/bimenews",
    "https://t.me/bimenews",
    "https://www.youtube.com/bimenews",
    "https://www.linkedin.com/company/bimenews",
    "https://www.instagram.com/bimenews",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+98-21-8800-1234",
    contactType: "customer service",
    email: "info@bimenews.ir",
    areaServed: "IR",
    availableLanguage: "fa",
  },
};

export const metadata: Metadata = {
  title: `${siteName} | ${siteTagline}`,
  description: siteDescription,
  alternates: { canonical: absoluteUrl("/"), ...rssAlternates },
  openGraph: {
    type: "website",
    locale: "fa_IR",
    url: siteUrl,
    siteName,
    title: `${siteName} | ${siteTagline}`,
    description: siteDescription,
    images: [{ url: absoluteUrl("/og-default.png"), alt: siteName }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} | ${siteTagline}`,
    description: siteDescription,
    images: [absoluteUrl("/og-default.png")],
  },
};

export default async function Home() {
  const [breaking, hero, videos, energy, economy, magazine, gallery, latest, mostViewed, navItems] =
    await Promise.all([
      getHomeSectionPosts("breaking"),
      getHomeSectionPosts("hero"),
      getHomeSectionPosts("videos"),
      getHomeSectionPosts("energy"),
      getHomeSectionPosts("economy"),
      getHomeSectionPosts("magazine"),
      getHomeSectionPosts("gallery"),
      getLatestPosts(4),
      getMostViewedPosts(5),
      getNavCategories(),
    ]);

  // link "خواندن آخرین شماره" to the magazine category archive when it exists
  const magazineArchiveHref = navItems.some((i) => i.href === "/category/magazine")
    ? "/category/magazine"
    : "#";

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
      <SiteHeader navItems={navItems} />
      <CommodityTicker />
      <main className="flex-1">
        <h1 className="sr-only">{`${siteName} | ${siteTagline}`}</h1>
        <TopNewsStrip breaking={breaking} hero={hero[0] ?? null} />
        <MagazineSection items={magazine} archiveHref={magazineArchiveHref} />
        <LatestVideosSection videos={videos} />
        <SocialEnergySection items={energy} />
        <EconomyNewsSection items={economy} mostViewed={mostViewed} />
        <MultimediaSection items={gallery} />
        <LatestArticlesSection items={latest} />
      </main>
      <SiteFooter />
      <BackToTop />
    </>
  );
}
