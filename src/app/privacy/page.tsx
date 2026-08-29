import type { Metadata } from "next";
import SiteHeader from "@/components/petro/site-header";
import CommodityTicker from "@/components/petro/commodity-ticker";
import SiteFooter from "@/components/petro/site-footer";
import BackToTop from "@/components/petro/back-to-top";
import { getNavCategories } from "@/lib/home-data";
import { absoluteUrl, rssAlternates, siteName } from "@/lib/site";

export const metadata: Metadata = {
  title: "حریم خصوصی",
  description: `سیاست حریم خصوصی ${siteName}`,
  alternates: { canonical: absoluteUrl("/privacy"), ...rssAlternates },
  robots: { index: true },
};

export default async function PrivacyPage() {
  const navItems = await getNavCategories();
  return (
    <>
      <SiteHeader navItems={navItems} />
      <CommodityTicker />
      <main className="flex-1 bg-zinc-50">
        <div className="max-w-[900px] mx-auto px-4 lg:px-6 py-6 sm:py-10">
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 mb-6 border-b-2 border-petro-black pb-3">
            حریم خصوصی
          </h1>
          <div className="bg-white border border-zinc-200 rounded-xl p-6 sm:p-8 space-y-4 text-sm sm:text-base text-zinc-700 leading-relaxed">
            <p>
              اطلاعات مخاطبان {siteName} (شامل ایمیل ثبت‌شده در خبرنامه) تنها برای
              ارسال اخبار و اطلاع‌رسانی استفاده می‌شود و با هیچ شخص ثالثی به اشتراک
              گذاشته نمی‌شود.
            </p>
            <p>
              استفاده از محتوای این پایگاه خبری با ذکر منبع مجاز است. برای درخواست
              حذف یا اصلاح اطلاعات، با بخش پشتیبانی در تماس باشید.
            </p>
          </div>
        </div>
      </main>
      <SiteFooter />
      <BackToTop />
    </>
  );
}