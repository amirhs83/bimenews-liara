import type { Metadata } from "next";
import SiteHeader from "@/components/petro/site-header";
import CommodityTicker from "@/components/petro/commodity-ticker";
import SiteFooter from "@/components/petro/site-footer";
import BackToTop from "@/components/petro/back-to-top";
import { getNavCategories } from "@/lib/home-data";
import { absoluteUrl, rssAlternates, siteName } from "@/lib/site";
import { Mail, Phone, MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "تماس با ما",
  description: `راه‌های ارتباط با تحریریه و بخش تبلیغات ${siteName}`,
  alternates: { canonical: absoluteUrl("/contact"), ...rssAlternates },
};

export default async function ContactPage() {
  const navItems = await getNavCategories();
  return (
    <>
      <SiteHeader navItems={navItems} />
      <CommodityTicker />
      <main className="flex-1 bg-zinc-50">
        <div className="max-w-[900px] mx-auto px-4 lg:px-6 py-6 sm:py-10">
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 mb-6 border-b-2 border-petro-black pb-3">
            تماس با {siteName}
          </h1>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-zinc-200 rounded-xl p-6 flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-blue-700" />
              </div>
              <h2 className="font-bold text-sm text-zinc-900">آدرس</h2>
              <p className="text-xs text-zinc-600 leading-relaxed">
                تهران، خیابان ولیعصر، برج بیمه، طبقه ۱۲
              </p>
            </div>
            <div className="bg-white border border-zinc-200 rounded-xl p-6 flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                <Phone className="w-6 h-6 text-blue-700" />
              </div>
              <h2 className="font-bold text-sm text-zinc-900">تلفن</h2>
              <p dir="ltr" className="text-xs text-zinc-600">+98 21 8800 1234</p>
            </div>
            <div className="bg-white border border-zinc-200 rounded-xl p-6 flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                <Mail className="w-6 h-6 text-blue-700" />
              </div>
              <h2 className="font-bold text-sm text-zinc-900">ایمیل</h2>
              <p dir="ltr" className="text-xs text-zinc-600">info@bimenews.ir</p>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
      <BackToTop />
    </>
  );
}