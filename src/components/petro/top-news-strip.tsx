import { Clock, Tag, Flame, ArrowLeft } from "lucide-react";
import SmartImage from "./smart-image";
import type { HomePost } from "@/lib/home-data";

interface Props {
  breaking: HomePost[];
  hero: HomePost | null;
}

export default function TopNewsStrip({ breaking, hero }: Props) {
  if (!hero && breaking.length === 0) return null;

  return (
    <section className="bg-white border-b border-zinc-200">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Breaking headlines list (right side in RTL) */}
          <div className={hero ? "lg:col-span-7 order-2 lg:order-1" : "lg:col-span-12 order-2 lg:order-1"}>
            <div className="flex items-center gap-3 mb-4">
              <div className="breaking-badge">
                <span className="live-dot"></span>
                TOP NEWS
              </div>
              <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-500">
                <Flame className="w-3.5 h-3.5 text-red-500" />
                <span>اخبار فوری · لحظه به لحظه</span>
              </div>
              <div className="flex-1 h-px bg-gradient-to-l from-zinc-200 to-transparent"></div>
            </div>

            <div className="divide-y divide-zinc-100">
              {breaking.map((item) => (
                <a
                  key={item.id}
                  href={item.href ?? "#"}
                  className="flex items-start gap-3 sm:gap-4 py-3 group hover:bg-zinc-50/60 -mx-2 sm:-mx-3 px-2 sm:px-3 rounded-lg transition-all"
                >
                  <div className="w-20 h-14 sm:w-24 sm:h-16 flex-shrink-0 overflow-hidden rounded-md bg-zinc-100 ring-1 ring-zinc-200">
                    <SmartImage
                      src={item.imageUrl}
                      alt={item.imageAlt}
                      ratio="auto"
                      category={item.categoryKey}
                      className="!w-full !h-full"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-[13px] sm:text-[15px] text-zinc-900 group-hover:text-blue-700 transition-colors line-clamp-2 leading-relaxed">
                      «{item.title}»
                    </h3>
                    <div className="flex items-center gap-1.5 sm:gap-2.5 mt-1 sm:mt-1.5 text-[10px] sm:text-[11px] text-zinc-500 flex-wrap">
                      <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-1.5 sm:px-2 py-0.5 rounded-full font-medium">
                        <Tag className="w-2.5 h-2.5" />
                        {item.category}
                      </span>
                      <span className="inline-flex items-center gap-1 tabular-nums">
                        <Clock className="w-3 h-3" />
                        {item.date}
                      </span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Featured photo (left side in RTL) */}
          {hero && (
            <div className="lg:col-span-5 order-1 lg:order-2">
              <a
                href={hero.href ?? "#"}
                className="block group relative overflow-hidden rounded-xl bg-zinc-900 aspect-[3/2] sm:aspect-[16/10] lg:aspect-auto lg:h-full"
              >
                <SmartImage
                  src={hero.imageUrl}
                  alt={hero.imageAlt}
                  ratio="auto"
                  category={hero.categoryKey}
                  priority
                  className="!w-full !h-full"
                />
                {/* Stronger gradient on mobile for better text legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/20"></div>

                {/* Top badges */}
                <div className="absolute top-3 right-3 left-3 flex items-start justify-between">
                  <span className="bg-red-600 text-white text-[9px] sm:text-[10px] font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 uppercase tracking-wider rounded backdrop-blur-sm shadow-lg">
                    ● ویژه
                  </span>
                  <span className="bg-black/50 backdrop-blur-sm text-white text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 uppercase tracking-wider rounded">
                    {hero.category}
                  </span>
                </div>

                {/* Bottom content */}
                <div className="absolute bottom-0 right-0 left-0 p-4 sm:p-5 text-white">
                  <div className="flex items-center gap-2 mb-2 text-[10px] sm:text-[11px]">
                    <span className="bg-blue-600 px-1.5 sm:px-2 py-0.5 rounded font-medium">
                      بیمه نیوز
                    </span>
                    <span className="opacity-80 tabular-nums">
                      {hero.date} · {hero.time}
                    </span>
                  </div>
                  <h2 className="text-base sm:text-xl lg:text-2xl font-bold leading-snug mb-1.5 sm:mb-2 group-hover:text-blue-300 transition-colors line-clamp-2">
                    {hero.title}
                  </h2>
                  <p className="hidden sm:block text-sm text-zinc-200 line-clamp-2 leading-relaxed">
                    {hero.lead}
                  </p>
                  <div className="inline-flex items-center gap-1 mt-2 sm:mt-3 text-[11px] sm:text-xs font-bold text-blue-300 group-hover:gap-2 transition-all">
                    ادامه مطلب
                    <ArrowLeft className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </div>
                </div>
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
