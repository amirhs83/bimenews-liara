import { Clock, Flame } from "lucide-react";
import SmartImage from "./smart-image";
import styles from "./top-news-strip.module.css";
import type { HomePost } from "@/lib/home-data";

interface Props {
  breaking: HomePost[];
  hero: HomePost | null;
}

export default function TopNewsStrip({ breaking, hero }: Props) {
  if (!hero && breaking.length === 0) return null;

  return (
    <section className="bg-white border-b border-zinc-200">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-6 pb-6 pt-2.5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Breaking headlines list (right side in RTL) */}
          <div className={hero ? "lg:col-span-6 order-2 lg:order-1" : "lg:col-span-12 order-2 lg:order-1"}>
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
                  className="flex gap-3 sm:gap-4 py-3 group hover:bg-zinc-50/60 -mx-2 sm:-mx-3 px-2 sm:px-3 rounded-lg transition-all"
                >
                  <div className="w-20 h-14 sm:w-24 sm:h-16 flex-shrink-0 overflow-hidden rounded-md bg-zinc-100 ring-1 ring-zinc-200">
                    <SmartImage
                      src={item.imageUrl}
                      alt={item.imageAlt}
                      ratio="auto"
                      category={item.categoryKey}
                      sizes="(max-width: 640px) 80px, 96px"
                      className="!w-full !h-full"
                    />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col">
                    <h3 className="font-bold text-[13px] sm:text-[15px] text-[#03349b] group-hover:text-blue-700 transition-colors leading-relaxed">
                      «{item.title}»
                    </h3>
                    {/* Persian time + date — BELOW the title, pinned bottom-left:
                        time at the far left, then the date, clock icon trailing */}
                    <div className="mt-auto flex items-center justify-end gap-1 sm:gap-1.5 pt-1 text-[10px] sm:text-[11px] text-zinc-500 tabular-nums">
                      <Clock className="w-3 h-3 shrink-0" />
                      <span>{item.date}</span>
                      <span>{item.time}</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Featured photo (left side in RTL) */}
          {hero && (
            <div className="lg:col-span-6 order-1 lg:order-2">
              {/* Hero card — white reference card on sm+ (unchanged).
                  On mobile only, a flat Entekhab-style lead story via the
                  scoped `flatRoot` modifier (see top-news-strip.module.css).
                  Same site font (IRANSans), inset photo with sharp 90° corners. */}
              <a
                href={hero.href ?? "#"}
                className={`flex relative flex-col overflow-hidden rounded-[14px] border border-[#ECECF0] bg-white ${styles.flatRoot}`}
              >
                {/* Photo — inset inside the card, sharp 90° corners */}
                <div className={`p-2.5 sm:p-3 shrink-0 ${styles.imgWrap}`}>
                  <div className="relative">
                    <SmartImage
                      src={hero.imageUrl}
                      alt={hero.imageAlt}
                      ratio="auto"
                      category={hero.categoryKey}
                      priority
                      sizes="(max-width: 1024px) 100vw, 660px"
                      className={`aspect-[19/10] lg:aspect-[2/1] w-full ${styles.heroImg}`}
                    />

                    {/* «ویژه» badge — top-right of the photo, small size */}
                    <span
                      className={`absolute top-2 right-2 sm:top-2.5 sm:right-2.5 lg:top-3 lg:right-3 bg-[#E00018] text-white text-[12px] sm:text-[13px] lg:text-[15px] font-bold leading-[16px] sm:leading-[18px] lg:leading-[20px] px-2 sm:px-2.5 lg:px-3.5 py-0.5 sm:py-1 rounded-[5px] sm:rounded-[6px] lg:rounded-[7px] ${styles.heroBadge}`}
                    >
                      ویژه
                    </span>
                  </div>
                </div>

                {/* Text body */}
                <div className={`flex flex-1 flex-col px-4 sm:px-5 lg:px-6 pb-3 sm:pb-3.5 ${styles.txtBody}`}>
                  {/* روتیتر — only when the post actually has one (mobile variant).
                      null / undefined / empty / whitespace-only are treated as empty. */}
                  {hero.kicker?.trim() ? <div className={styles.rutitr}>{hero.kicker}</div> : null}
                  <h2
                    className={`mt-1 sm:mt-2 text-[16px] sm:text-[22px] lg:text-[26px] font-bold leading-[27px] sm:leading-[32px] lg:leading-[38px] text-[#03349b] line-clamp-2 ${styles.heroTitle}`}
                  >
                    {hero.title}
                  </h2>
                  <p
                    className={`mt-1.5 sm:mt-2 text-[13px] sm:text-[16px] lg:text-[20px] font-light leading-[24px] sm:leading-[27px] lg:leading-[30px] text-[#77777F] line-clamp-2 ${styles.heroLead}`}
                  >
                    {hero.lead}
                  </p>
                  {/* Date + clock — pinned bottom-left (time added on mobile variant only) */}
                  <div
                    className={`mt-auto flex items-center justify-end gap-1.5 lg:gap-2 pt-3 lg:pt-4 text-[12px] lg:text-[14px] text-zinc-400 ${styles.heroMeta}`}
                  >
                    <Clock className="w-[15px] h-[15px] lg:w-[17px] lg:h-[17px] shrink-0" strokeWidth={1.5} />
                    <span className="tabular-nums">{hero.date}</span>
                    <span className={`tabular-nums ${styles.metaTime}`}>{hero.time}</span>
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
