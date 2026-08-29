import { Tag, Clock, ArrowLeft, TrendingUp, Flame, Mail } from "lucide-react";
import type { HomePost } from "@/lib/home-data";
import { faDigits } from "@/lib/post-format";

interface Props {
  items: HomePost[];
  mostViewed: HomePost[];
}

export default function EconomyNewsSection({ items, mostViewed }: Props) {
  if (items.length === 0 && mostViewed.length === 0) return null;

  return (
    <section className="bg-gradient-to-b from-white to-zinc-50/50 border-b border-zinc-200">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Right: News list */}
          <div className="lg:col-span-8">
            <div className="border-b-2 border-petro-black pb-2 mb-4 sm:mb-4 flex items-end justify-between relative">
              <div className="flex items-end gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-md mb-1">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <h2 className="section-heading text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-tight">
                    بازار بیمه
                  </h2>
                </div>
              </div>
              <a
                href="/category/insurance-market"
                className="inline-flex items-center gap-1 text-xs sm:text-sm text-zinc-600 hover:text-blue-700 mb-2 transition-colors group"
              >
                همه اخبار
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
              </a>
            </div>

            <div className="divide-y divide-zinc-100">
              {items.map((item, idx) => (
                <a
                  key={item.id}
                  href={item.href ?? "#"}
                  className="flex gap-3 sm:gap-4 py-4 sm:py-5 group hover:bg-white rounded-lg -mx-2 px-2 transition-all"
                >
                  <div className="hidden md:flex flex-col items-center pt-1 w-10 flex-shrink-0">
                    <span className="text-3xl font-black text-zinc-200 group-hover:text-blue-600 transition-colors leading-none tabular-nums">
                      {faDigits(idx + 1)}
                    </span>
                    <div className="w-8 h-px bg-zinc-200 group-hover:bg-blue-600 group-hover:w-10 transition-all mt-1"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2 flex-wrap">
                      <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 uppercase rounded-full">
                        <Tag className="w-2.5 h-2.5" />
                        {item.category}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] text-zinc-500 tabular-nums">
                        <Clock className="w-3 h-3" />
                        {item.date}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm sm:text-base lg:text-lg text-zinc-900 group-hover:text-blue-700 transition-colors leading-relaxed mb-1 sm:mb-1.5 line-clamp-2">
                      {item.title}
                    </h3>
                    {item.lead && (
                      <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed line-clamp-2 hidden sm:block">
                        {item.lead}
                      </p>
                    )}
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Left: Sidebar widgets */}
          <aside className="lg:col-span-4 space-y-4 sm:space-y-5">
            {/* Most read */}
            <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
              <div className="bg-gradient-to-l from-petro-black to-zinc-900 text-white px-4 py-3 flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-orange-500/20 flex items-center justify-center">
                  <Flame className="w-4 h-4 text-orange-400" />
                </div>
                <h3 className="font-bold text-sm uppercase tracking-wider">
                  پربازدیدترین
                </h3>
                <span className="text-[10px] text-zinc-400 mr-auto">همه زمان‌ها</span>
              </div>
              <div className="divide-y divide-zinc-100">
                {mostViewed.map((item, idx) => (
                  <a
                    key={item.id}
                    href={item.href ?? "#"}
                    className="flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 group hover:bg-zinc-50 transition-colors"
                  >
                    <span className="text-xl sm:text-2xl font-black text-zinc-200 group-hover:text-blue-600 transition-colors w-6 sm:w-7 flex-shrink-0 tabular-nums">
                      {faDigits(idx + 1)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[13px] sm:text-sm font-medium text-zinc-800 group-hover:text-blue-700 transition-colors leading-snug line-clamp-2">
                        {item.title}
                      </h4>
                      <div className="text-[10px] text-zinc-400 mt-1">
                        {item.views} بازدید
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Mini subscribe widget */}
            <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-xl p-5 text-center">
              <div className="w-10 h-10 mx-auto rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-md mb-2">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <h4 className="font-bold text-sm mb-1">خبرنامه روزانه</h4>
              <p className="text-[11px] text-zinc-600 mb-3 leading-relaxed">
                خلاصه مهم‌ترین اخبار روز را در ایمیل خود دریافت کنید.
              </p>
              <a
                href="/#newsletter"
                className="inline-block text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-md transition-colors"
              >
                عضویت رایگان
              </a>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
