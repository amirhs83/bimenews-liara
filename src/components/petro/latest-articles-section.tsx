import { ArrowLeft, Clock, Tag } from "lucide-react";
import SmartImage from "./smart-image";
import type { HomePost } from "@/lib/home-data";

export default function LatestArticlesSection({ items }: { items: HomePost[] }) {
  return (
    <section className="bg-white border-b border-zinc-200">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-6 py-8">
        {/* Ad banner row — replaced with a single branded "advertise with us" CTA */}
        <a
          href="/contact"
          className="block mb-8 relative overflow-hidden rounded-xl bg-gradient-to-l from-zinc-900 via-petro-black to-zinc-900 p-5 sm:p-6 lg:p-8 group"
        >
          <div className="absolute top-0 right-1/3 w-64 h-64 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4 text-white">
            <div className="text-center md:text-right">
              <div className="text-[10px] uppercase tracking-[0.3em] text-blue-400 mb-1 font-bold">
                تبلیغات شما اینجا
              </div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold">
                به میلیون‌ها مخاطب صنعت بیمه برسید
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                بیمه نیوز با بیش از ۲ میلیون بازدید ماهانه، بستری ایده‌آل برای
                تبلیغات شماست.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg transition-colors whitespace-nowrap shadow-lg shadow-blue-600/30">
              درخواست تبلیغات
              <ArrowLeft className="w-4 h-4" />
            </div>
          </div>
        </a>

        {/* Section header */}
        {items.length > 0 && (
        <>
        <div className="border-b-2 border-petro-black pb-2 mb-5 sm:mb-6 flex items-end justify-between relative">
          <div className="flex items-end gap-2 sm:gap-3">
            <h2 className="section-heading text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-tight">
              آخرین مقالات
            </h2>
          </div>
          <a
            href="/category/magazine"
            className="inline-flex items-center gap-1 text-xs sm:text-sm text-zinc-600 hover:text-blue-700 mb-2 transition-colors group"
          >
            آرشیو
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
          </a>
        </div>

        {/* Mobile: vertical list of horizontal cards; Desktop: 4-col grid */}
        <div className="flex flex-col sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {items.map((article) => (
            <a
              key={article.id}
              href={article.href ?? "#"}
              className="group lift-on-hover bg-white border border-zinc-200 rounded-xl overflow-hidden flex sm:block"
            >
              {/* Image — square thumb on mobile, full-width on desktop */}
              <div className="relative w-24 sm:w-auto flex-shrink-0 sm:flex-shrink aspect-square sm:aspect-[16/10] overflow-hidden bg-zinc-100 self-stretch sm:self-auto">
                <SmartImage
                  src={article.imageUrl}
                  alt={article.imageAlt}
                  ratio="auto"
                  category={article.categoryKey}
                  eager
                  className="!w-full !h-full"
                />
                <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2">
                  <span className="bg-black/80 backdrop-blur-md text-white text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 uppercase tracking-wider rounded inline-flex items-center gap-1">
                    <Tag className="w-2.5 h-2.5" />
                    {article.category}
                  </span>
                </div>
              </div>
              <div className="flex-1 min-w-0 p-3 sm:p-4 flex flex-col justify-center sm:justify-start">
                <h3 className="font-bold text-sm sm:text-base text-zinc-900 group-hover:text-blue-700 transition-colors leading-relaxed mb-1 sm:mb-2 line-clamp-2 sm:line-clamp-3">
                  {article.title}
                </h3>
                <p className="text-[11px] sm:text-xs text-zinc-600 leading-relaxed line-clamp-1 sm:line-clamp-2 mb-0 sm:mb-3 hidden sm:block">
                  {article.lead}
                </p>
                <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-zinc-400 sm:pt-3 sm:border-t sm:border-zinc-100">
                  <span className="inline-flex items-center gap-1 tabular-nums">
                    <Clock className="w-3 h-3" />
                    {article.date}
                  </span>
                  <span className="inline-flex items-center gap-1 text-blue-600 group-hover:gap-2 transition-all font-medium">
                    ادامه
                    <ArrowLeft className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>
        </>
        )}

        {/* Newsletter banner */}
        <div className="mt-6 sm:mt-10 bg-gradient-to-l from-petro-black via-zinc-900 to-petro-black text-white p-5 sm:p-8 lg:p-12 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-6 relative overflow-hidden shadow-xl">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-blue-900/20 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex-1 text-center md:text-right relative">
            <div className="text-[10px] uppercase tracking-[0.3em] text-blue-400 mb-1 sm:mb-2 font-bold">
              بیمه نیوز نیوزلتر
            </div>
            <h3 className="text-lg sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2">
              از اخبار مهم صنعت بیمه جا نمانید
            </h3>
            <p className="text-[11px] sm:text-sm text-zinc-300 max-w-xl">
              هر صبح خلاصه مهم‌ترین اخبار بیمه و اقتصاد را در ایمیل خود
              دریافت کنید.
            </p>
          </div>
          <form className="flex gap-2 w-full md:w-auto relative">
            <input
              type="email"
              placeholder="ایمیل شما"
              className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-700 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 flex-1 md:w-64 transition-all"
              dir="rtl"
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm rounded-lg transition-all whitespace-nowrap shadow-lg shadow-blue-600/30"
            >
              عضویت رایگان
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
