import Link from "next/link";
import SiteHeader from "@/components/petro/site-header";
import SiteFooter from "@/components/petro/site-footer";

export default function NewsNotFound() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-white flex items-center justify-center px-4 py-24">
        <div className="text-center max-w-md">
          <div className="text-7xl font-black text-zinc-200 mb-4">۴۰۴</div>
          <h1 className="text-xl font-black text-zinc-900 mb-2">
            خبر مورد نظر یافت نشد
          </h1>
          <p className="text-sm text-zinc-500 mb-6 leading-relaxed">
            ممکن است این خبر حذف شده، هنوز منتشر نشده یا آدرس اشتباه باشد.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold px-5 py-2.5 rounded-lg transition-colors"
          >
            بازگشت به صفحه اصلی
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
