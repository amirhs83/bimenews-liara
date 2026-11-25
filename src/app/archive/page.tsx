import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock } from "lucide-react";
import { db } from "@/lib/db";
import { getNavCategories } from "@/lib/home-data";
import { absoluteUrl } from "@/lib/site";
import { faDigits } from "@/lib/post-format";
import SiteHeader from "@/components/petro/site-header";
import SiteFooter from "@/components/petro/site-footer";
import CommodityTicker from "@/components/petro/commodity-ticker";
import BackToTop from "@/components/petro/back-to-top";
import SmartImage from "@/components/petro/smart-image";

export const revalidate = 60;
const PAGE_SIZE = 20;
type Props = { searchParams: Promise<{ page?: string | string[] }> };

function pageNumber(value: string | string[] | undefined) {
  if (value === undefined) return 1;
  if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) notFound();
  const number = Number(value);
  if (!Number.isSafeInteger(number)) notFound();
  return number;
}

function pageUrl(page: number) {
  return page === 1 ? "/archive" : `/archive?page=${page}`;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const page = pageNumber((await searchParams).page);
  return {
    title: page === 1 ? "آرشیو آخرین خبرها" : `آرشیو آخرین خبرها — صفحه ${faDigits(page)}`,
    description: "همهٔ خبرهای منتشرشدهٔ بیمه نیوز، از جدیدترین به قدیمی‌ترین",
    alternates: { canonical: absoluteUrl(pageUrl(page)) },
    robots: page > 1 ? { index: false, follow: true } : undefined,
  };
}

export default async function ArchivePage({ searchParams }: Props) {
  const page = pageNumber((await searchParams).page);
  const where = { status: "PUBLISHED" as const, publishedAt: { lte: new Date() } };
  const total = await db.post.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (page > totalPages) notFound();
  const firstPage = Math.max(1, Math.min(page - 4, totalPages - 9));
  const visiblePages = Array.from({ length: Math.min(10, totalPages) }, (_, index) => firstPage + index);
  const [posts, navItems] = await Promise.all([
    db.post.findMany({
      where,
      orderBy: [{ publishedAt: "desc" }, { id: "desc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true, slug: true, title: true, publishedAt: true, hasOwnPage: true,
        homeImageAlt: true, homeImage: { select: { url: true } },
        category: { select: { name: true, slug: true } },
      },
    }),
    getNavCategories(),
  ]);
  const dateFormat = new Intl.DateTimeFormat("fa-IR", { timeZone: "Asia/Tehran" });
  const timeFormat = new Intl.DateTimeFormat("fa-IR", { timeZone: "Asia/Tehran", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });

  return (
    <>
      <SiteHeader navItems={navItems} />
      <CommodityTicker />
      <main className="flex-1 bg-white" dir="rtl">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <h1 className="text-xl sm:text-2xl font-bold text-right border-b-2 border-[#08328c] pb-3 mb-2">آرشیو آخرین خبرها</h1>
          {posts.length === 0 ? (
            <p className="text-center text-sm text-zinc-500 py-12">هنوز خبری منتشر نشده است.</p>
          ) : (
            <ul className="divide-y-2 divide-dotted divide-zinc-200">
              {posts.map(post => {
                const publishedAt = new Date(post.publishedAt);
                const content = (
                  <>
                    <SmartImage src={post.homeImage?.url} alt={post.homeImageAlt || post.title}
                      category={post.category.slug} ratio="16x9" sizes="(max-width: 640px) 104px, 160px"
                      className="w-[104px] sm:w-40 shrink-0 self-start" />
                    <div className="flex flex-col flex-1 min-w-0 self-stretch">
                      <h2 className="text-right text-[14px] sm:text-lg font-bold leading-7 text-slate-800 group-hover:text-blue-700 transition-colors line-clamp-3">
                        <span className="text-slate-600">{post.category.name} | </span>{post.title}
                      </h2>
                      <time dateTime={publishedAt.toISOString()} className="mt-auto pt-1 flex items-center justify-end gap-1 text-[10px] sm:text-xs text-zinc-400">
                        <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                        <span>{dateFormat.format(publishedAt)}</span>
                        <span>{timeFormat.format(publishedAt)}</span>
                      </time>
                    </div>
                  </>
                );
                return (
                  <li key={post.id}>
                    {post.hasOwnPage ? (
                      <Link href={`/news/${post.slug}`} className="group flex items-start gap-3 sm:gap-4 py-3">{content}</Link>
                    ) : (
                      <div className="flex items-start gap-3 sm:gap-4 py-3">{content}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
          {totalPages > 1 && (
            <nav aria-label="صفحه‌بندی آرشیو خبرها" className="flex flex-wrap items-center justify-center mt-6 text-base sm:text-lg" dir="rtl">
              {page > 1 ? (
                <Link rel="prev" href={pageUrl(page - 1)} className="min-h-11 border border-zinc-200 rounded-r-lg px-4 py-2 text-slate-600 hover:bg-zinc-100">قبلی</Link>
              ) : (
                <span aria-disabled="true" className="min-h-11 border border-zinc-200 rounded-r-lg px-4 py-2 text-zinc-300">قبلی</span>
              )}
              {visiblePages.map(number => (
                <Link key={number} href={pageUrl(number)} aria-label={`صفحه ${faDigits(number)}`}
                  aria-current={number === page ? "page" : undefined}
                  className={`min-w-11 min-h-11 border border-zinc-200 px-3 py-2 text-center tabular-nums ${number === page ? "bg-[#003b57] text-white" : "text-slate-600 hover:bg-zinc-100"}`}>
                  {faDigits(number)}
                </Link>
              ))}
              {page < totalPages ? (
                <Link rel="next" href={pageUrl(page + 1)} className="min-h-11 border border-zinc-200 rounded-l-lg px-4 py-2 text-slate-600 hover:bg-zinc-100">بعدی</Link>
              ) : (
                <span aria-disabled="true" className="min-h-11 border border-zinc-200 rounded-l-lg px-4 py-2 text-zinc-300">بعدی</span>
              )}
            </nav>
          )}
        </div>
      </main>
      <SiteFooter />
      <BackToTop />
    </>
  );
}
