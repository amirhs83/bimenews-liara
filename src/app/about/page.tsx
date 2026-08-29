import type { Metadata } from "next";
import SiteHeader from "@/components/petro/site-header";
import CommodityTicker from "@/components/petro/commodity-ticker";
import SiteFooter from "@/components/petro/site-footer";
import BackToTop from "@/components/petro/back-to-top";
import { getNavCategories } from "@/lib/home-data";
import { absoluteUrl, rssAlternates, siteDescription, siteName, siteTagline } from "@/lib/site";

export const metadata: Metadata = {
  title: "درباره ما",
  description: siteDescription,
  alternates: { canonical: absoluteUrl("/about"), ...rssAlternates },
};

export default async function AboutPage() {
  const navItems = await getNavCategories();
  return (
    <>
      <SiteHeader navItems={navItems} />
      <CommodityTicker />
      <main className="flex-1 bg-zinc-50">
        <div className="max-w-[900px] mx-auto px-4 lg:px-6 py-6 sm:py-10">
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 mb-6 border-b-2 border-petro-black pb-3">
            درباره {siteName}
          </h1>
          <div className="bg-white border border-zinc-200 rounded-xl p-6 sm:p-8 space-y-4 text-sm sm:text-base text-zinc-700 leading-relaxed">
            <p>
              {siteName}، پایگاه تخصصی اخبار و تحلیل صنعت بیمه ایران و جهان است که با
              هدف اطلاع‌رسانی دقیق و به‌موقع در حوزه بازار بیمه، تنظیم‌گری و اینشورتک
              فعالیت می‌کند.
            </p>
            <p>
              {siteTagline}؛ ما در {siteName} تلاش می‌کنیم آخرین اخبار، تحلیلها و
              گزارشهای تخصصی صنعت بیمه را با نگاهی حرفهای و بیطرفانه در اختیار
              مخاطبان قرار دهیم.
            </p>
          </div>
        </div>
      </main>
      <SiteFooter />
      <BackToTop />
    </>
  );
}