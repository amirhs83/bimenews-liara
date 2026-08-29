import { ArrowLeft } from "lucide-react";
import type { HomePost } from "@/lib/home-data";
import { faDateLong } from "@/lib/post-format";

export default function MagazineSection({
  items,
  archiveHref = "#",
}: {
  items: HomePost[];
  archiveHref?: string;
}) {
  const headline = items[0] ?? null;
  const teasers = items.slice(1, 5);

  return (
    <section className="bg-white border-b border-zinc-200">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-6 py-8">
        <div className="bg-[#f8f6f1] px-6 py-8 sm:px-10 sm:py-10 lg:px-14 lg:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            {/* Magazine cover (right side in RTL) — uses the headline post's uploaded image when available */}
            <div className="lg:col-span-4 xl:col-span-3 flex justify-center lg:justify-start">
              <a href={headline?.href ?? "#"} className="block group">
                {headline?.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={headline.imageUrl}
                    alt={headline.imageAlt}
                    className="w-60 sm:w-72 lg:w-full h-auto shadow-[0_25px_50px_-12px_rgba(0,0,0,0.35)] group-hover:shadow-[0_30px_60px_-12px_rgba(0,0,0,0.45)] group-hover:-translate-y-1 transition-all duration-300"
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src="/magazine-cover.png"
                    alt="جلد ماهنامه بیمه نیوز - شماره ماهانه"
                    className="w-60 sm:w-72 lg:w-full h-auto shadow-[0_25px_50px_-12px_rgba(0,0,0,0.35)] group-hover:shadow-[0_30px_60px_-12px_rgba(0,0,0,0.45)] group-hover:-translate-y-1 transition-all duration-300"
                  />
                )}
              </a>
            </div>

            {/* Content */}
            <div className="lg:col-span-8 xl:col-span-9">
              {/* Edition line */}
              <div className="flex items-center gap-2 text-[11px] sm:text-xs font-bold tracking-[0.18em] text-zinc-800 uppercase mb-3 sm:mb-4">
                <span>شماره ماهانه</span>
                <span className="text-zinc-400">|</span>
                <span className="text-zinc-500">{faDateLong(new Date())}</span>
              </div>

              {/* Main headline */}
              {headline && (
                <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-black leading-[1.25] text-zinc-950 mb-8 lg:mb-10">
                  <a href={headline.href ?? "#"} className="hover:text-red-700 transition-colors">
                    {headline.title}
                  </a>
                </h2>
              )}

              {/* Teasers grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 lg:gap-x-14">
                {teasers.map((item) => (
                  <a
                    key={item.id}
                    href={item.href ?? "#"}
                    className="group block border-t border-[#e3dfd6] py-4 sm:py-5"
                  >
                    <h3 className="font-bold text-base sm:text-lg text-zinc-950 leading-snug mb-1.5 group-hover:text-red-700 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm sm:text-[0.95rem] text-zinc-600 leading-relaxed line-clamp-2">
                      {item.lead}
                    </p>
                  </a>
                ))}
              </div>

              {/* Read latest edition */}
              <a
                href={archiveHref}
                className="inline-flex items-center gap-2.5 mt-6 sm:mt-8 font-bold text-sm sm:text-base text-zinc-950 hover:text-red-700 transition-colors group"
              >
                <span className="w-7 h-7 rounded-full bg-zinc-950 group-hover:bg-red-700 flex items-center justify-center transition-colors">
                  <ArrowLeft className="w-4 h-4 text-white" />
                </span>
                خواندن آخرین شماره
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
