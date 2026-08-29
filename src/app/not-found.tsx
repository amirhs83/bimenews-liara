import Link from "next/link";
import SiteHeader from "@/components/petro/site-header";
import SiteFooter from "@/components/petro/site-footer";
import BackToTop from "@/components/petro/back-to-top";
import { getNavCategories } from "@/lib/home-data";
import { Home } from "lucide-react";

export const metadata = {
  title: "صفحه یافت نشد | بیمه نیوز",
  robots: { index: false },
};

export default async function NotFound() {
  const navItems = await getNavCategories();
  return (
    <>
      <SiteHeader navItems={navItems} />
      <main className="flex-1 bg-zinc-50 flex items-center justify-center px-4 py-20">
        <div className="text-center">
          <div className="text-7xl sm:text-8xl font-black text-zinc-200 mb-4">404</div>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 mb-3">
            صفحه‌ای که دنبالش بودید پیدا نشد
          </h1>
          <p className="text-sm sm:text-base text-zinc-500 mb-8 max-w-md mx-auto leading-relaxed">
            ممکن است آدرس اشتباه باشد یا این خبر حذف شده باشد. از صفحه اصلی ادامه دهید.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-blue-700 hover:bg-blue-600 text-white font-bold text-sm px-6 py-3 rounded-lg transition-colors"
            >
              <Home className="w-4 h-4" />
              صفحه اصلی
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
      <BackToTop />
    </>
  );
}
