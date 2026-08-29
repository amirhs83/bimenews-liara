import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { decodeParam } from "@/lib/url-param";
import { absoluteUrl, rssAlternates, siteName, siteUrl } from "@/lib/site";
import { faDate, faDigits } from "@/lib/post-format";
import { getNavCategories } from "@/lib/home-data";
import SiteHeader from "@/components/petro/site-header";
import CommodityTicker from "@/components/petro/commodity-ticker";
import SiteFooter from "@/components/petro/site-footer";
import BackToTop from "@/components/petro/back-to-top";
import SmartImage from "@/components/petro/smart-image";
import { ChevronLeft, ChevronRight, Clock, Tag, Newspaper } from "lucide-react";

// category archives reflect the latest published content, cached briefly
export const revalidate = 60;

const PAGE_SIZE = 12;

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
};

async function getCategory(rawSlug: string) {
  const slug = decodeParam(rawSlug);
  return db.category.findUnique({ where: { slug } });
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const category = await getCategory(slug);
  if (!category) return { title: "یافت نشد" };
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const canonical = absoluteUrl(
    page > 1 ? `/category/${category.slug}?page=${page}` : `/category/${category.slug}`
  );
  const title = page > 1 ? `${category.name} — صفحه ${page} | ${siteName}` : `${category.name} | ${siteName}`;
  const description = `آرشیو اخبار و تحلیل‌های ${category.name} در ${siteName}`;
  return {
    title,
    description,
    alternates: { canonical, ...rssAlternates },
    robots: page > 1 ? { index: false, follow: true } : undefined,
    openGraph: {
      title,
      description,
      url: canonical,
      siteName,
      type: "website",
      locale: "fa_IR",
      images: [{ url: absoluteUrl("/og-default.png"), alt: `${category.name} | ${siteName}` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [absoluteUrl("/og-default.png")],
    },
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const category = await getCategory(slug);
  if (!category) notFound();

  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const where = {
    OR: [
      { categoryId: category.id },
      { categories: { some: { categoryId: category.id } } },
    ],
    status: "PUBLISHED" as const,
    publishedAt: { lte: new Date() },
  };

  const [posts, total, navCategories] = await Promise.all([
    db.post.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { category: true, homeImage: true },
    }),
    db.post.count({ where }),
    getNavCategories(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${category.name} | ${siteName}`,
    description: `آرشیو اخبار و تحلیل‌های ${category.name} در ${siteName}`,
    url: absoluteUrl(`/category/${category.slug}`),
    isPartOf: { "@type": "WebSite", name: siteName, url: siteUrl },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "صفحه اصلی", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: category.name, item: absoluteUrl(`/category/${category.slug}`) },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <SiteHeader navItems={navCategories} />
      <CommodityTicker />
      <main className="flex-1 bg-zinc-50">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-6 py-6 sm:py-8">
          {/* Breadcrumb */}
          <nav aria-label="breadcrumb" className="flex items-center gap-1.5 text-[11px] sm:text-xs text-zinc-500 mb-4">
            <Link href="/" className="hover:text-blue-700 transition-colors">
              صفحه اصلی
            </Link>
            <ChevronLeft className="w-3 h-3 text-zinc-400" />
            <span className="text-zinc-700">{category.name}</span>
          </nav>

          {/* Section header */}
          <div className="border-b-2 border-petro-black pb-2 mb-5 sm:mb-6 flex items-end justify-between">
            <div className="flex items-end gap-3">
              <h1 className="section-heading text-2xl sm:text-3xl font-black uppercase tracking-tight">
                {category.name}
              </h1>
              <span className="text-xs text-zinc-500 mb-1.5 tabular-nums">
                {faDigits(total)} خبر
              </span>
            </div>
          </div>

          {posts.length === 0 ? (
            <div className="bg-white border border-zinc-200 rounded-xl py-16 text-center">
              <Newspaper className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
              <p className="text-sm text-zinc-500">
                هنوز خبری در دسته «{category.name}» منتشر نشده است.
              </p>
            </div>
          ) : (
            <>
              {/* Cards grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
                {posts.map((post) => (
                  <Link
                    key={post.id}
                    href={post.hasOwnPage ? `/news/${post.slug}` : "#"}
                    className="group lift-on-hover bg-white border border-zinc-200 rounded-xl overflow-hidden"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-zinc-100">
                      <SmartImage
                        src={post.homeImage?.url}
                        alt={post.homeImageAlt || post.title}
                        ratio="auto"
                        category={category.slug}
                        className="!w-full !h-full"
                      />
                      <div className="absolute top-2 right-2">
                        <span className="bg-black/80 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider rounded inline-flex items-center gap-1">
                          <Tag className="w-2.5 h-2.5" />
                          {category.name}
                        </span>
                      </div>
                    </div>
                    <div className="p-3 sm:p-4">
                      <h2 className="font-bold text-sm sm:text-base text-zinc-900 group-hover:text-blue-700 transition-colors leading-relaxed line-clamp-2 mb-2">
                        {post.title}
                      </h2>
                      <p className="text-xs text-zinc-600 leading-relaxed line-clamp-2 mb-3">
                        {post.lead}
                      </p>
                      <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-3 border-t border-zinc-100">
                        <span className="inline-flex items-center gap-1 tabular-nums">
                          <Clock className="w-3 h-3" />
                          {faDate(new Date(post.publishedAt))}
                        </span>
                        <span className="inline-flex items-center gap-1 text-blue-600 group-hover:gap-2 transition-all font-medium">
                          ادامه
                          <ChevronLeft className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  {page > 1 && (
                    <Link
                      href={`/category/${category.slug}?page=${page - 1}`}
                      className="inline-flex items-center gap-1 text-sm bg-white border border-zinc-300 hover:border-blue-500 hover:text-blue-700 rounded-lg px-4 py-2 transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                      جدیدتر
                    </Link>
                  )}
                  <span className="text-xs text-zinc-500 tabular-nums px-3">
                    صفحه {faDigits(page)} از {faDigits(totalPages)}
                  </span>
                  {page < totalPages && (
                    <Link
                      href={`/category/${category.slug}?page=${page + 1}`}
                      className="inline-flex items-center gap-1 text-sm bg-white border border-zinc-300 hover:border-blue-500 hover:text-blue-700 rounded-lg px-4 py-2 transition-colors"
                    >
                      قدیمی‌تر
                      <ChevronLeft className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <SiteFooter />
      <BackToTop />
    </>
  );
}
