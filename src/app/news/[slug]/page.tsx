import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { decodeParam } from "@/lib/url-param";
import { absoluteUrl, postUrl, rssAlternates, siteName } from "@/lib/site";
import { faDate, faTime, faViews, faDuration } from "@/lib/post-format";
import { getHomeSectionPosts, getNavCategories } from "@/lib/home-data";
import SiteHeader from "@/components/petro/site-header";
import CommodityTicker from "@/components/petro/commodity-ticker";
import SiteFooter from "@/components/petro/site-footer";
import BackToTop from "@/components/petro/back-to-top";
import ShareButtons from "@/components/petro/share-buttons";
import ViewPing from "@/components/petro/view-ping";
import SmartImage from "@/components/petro/smart-image";
import {
  ChevronLeft,
  Clock,
  Eye,
  Tag,
  Calendar,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

// news pages reflect the latest published content, cached briefly
export const revalidate = 60;

type Params = { params: Promise<{ slug: string }> };

const postInclude = {
  category: true,
  categories: { include: { category: true } },
  tags: { include: { tag: true } },
  homeImage: true,
  innerImage: true,
  ogImage: true,
} as const;

async function getPost(rawSlug: string) {
  const slug = decodeParam(rawSlug);
  const post = await db.post.findFirst({
    where: { slug, status: "PUBLISHED", publishedAt: { lte: new Date() } },
    include: postInclude,
  });
  // posts flagged "no dedicated page" never render
  if (!post || !post.hasOwnPage) return null;
  return post;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "یافت نشد" };

  const title = post.metaTitle || post.title;
  const description = post.metaDescription || post.lead;
  const canonical = post.canonicalUrl || postUrl(post.slug);
  const ogImage = post.ogImage?.url || post.homeImage?.url;

  return {
    title,
    description,
    keywords: post.metaKeywords || undefined,
    alternates: { canonical, ...rssAlternates },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName,
      type: "article",
      publishedTime: post.publishedAt.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      section: post.category.name,
      tags: post.tags.map((t) => t.tag.name),
      images: ogImage ? [{ url: absoluteUrl(ogImage), alt: post.homeImageAlt }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      site: "@bimenews",
      title,
      description,
      images: ogImage
        ? [{ url: absoluteUrl(ogImage), alt: post.homeImageAlt || title }]
        : undefined,
    },
  };
}

export default async function NewsPage({ params }: Params) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const navItems = await getNavCategories();

  // related: same category (main or secondary) or shared tags, newest first
  const tagIds = post.tags.map((t) => t.tagId);
  const categoryIds = [
    post.categoryId,
    ...post.categories.map((c) => c.categoryId),
  ];
  const related = await db.post.findMany({
    where: {
      id: { not: post.id },
      status: "PUBLISHED",
      publishedAt: { lte: new Date() },
      OR: [
        { categoryId: { in: categoryIds } },
        { categories: { some: { categoryId: { in: categoryIds } } } },
        ...(tagIds.length ? [{ tags: { some: { tagId: { in: tagIds } } } }] : []),
      ],
    },
    orderBy: { publishedAt: "desc" },
    take: 4,
    include: { category: true, homeImage: true },
  });

  const image = post.innerImage ?? post.homeImage;
  const imageAlt = post.innerImage
    ? post.innerImageAlt || post.title
    : post.homeImageAlt || post.title;
  const publishedAt = new Date(post.publishedAt);
  const canonical = post.canonicalUrl || postUrl(post.slug);
  const ogImage = post.ogImage?.url || post.homeImage?.url;

  const newsArticleLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: post.metaTitle || post.title,
    description: post.metaDescription || post.lead,
    image: ogImage ? [absoluteUrl(ogImage)] : undefined,
    datePublished: publishedAt.toISOString(),
    dateModified: new Date(post.updatedAt).toISOString(),
    inLanguage: "fa-IR",
    articleSection: post.category.name,
    keywords: post.metaKeywords
      ? post.metaKeywords.split(",").map((k) => k.trim())
      : post.tags.map((t) => t.tag.name),
    author: { "@type": "Organization", name: siteName },
    publisher: {
      "@type": "Organization",
      name: siteName,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/og-default.png"),
      },
    },
    mainEntityOfPage: canonical,
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "صفحه اصلی", item: absoluteUrl("/") },
      {
        "@type": "ListItem",
        position: 2,
        name: post.category.name,
        item: absoluteUrl(`/category/${post.category.slug}`),
      },
      { "@type": "ListItem", position: 3, name: post.title, item: canonical },
    ],
  };

  return (
    <>
      <SiteHeader navItems={navItems} />
      <CommodityTicker />
      <main className="flex-1 bg-white">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(newsArticleLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
        />
        <ViewPing slug={post.slug} />

        <article className="max-w-[900px] mx-auto px-4 lg:px-6 py-6 sm:py-8">
          {/* Breadcrumb */}
          <nav aria-label="breadcrumb" className="flex items-center gap-1.5 text-[11px] sm:text-xs text-zinc-500 mb-5 flex-wrap">
            <Link href="/" className="hover:text-blue-700 transition-colors">
              صفحه اصلی
            </Link>
            <ChevronLeft className="w-3 h-3 text-zinc-400" />
            <Link
              href={`/category/${post.category.slug}`}
              className="hover:text-blue-700 transition-colors"
            >
              {post.category.name}
            </Link>
            <ChevronLeft className="w-3 h-3 text-zinc-400" />
            <span className="text-zinc-700 line-clamp-1">{post.title}</span>
          </nav>

          {/* Header */}
          <header className="mb-6">
            {post.kicker && (
              <div className="text-blue-700 font-bold text-sm mb-2">
                {post.kicker}
              </div>
            )}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black leading-[1.4] text-zinc-950 mb-4">
              {post.title}
            </h1>
            <p className="text-base sm:text-lg text-zinc-600 leading-relaxed mb-5">
              {post.lead}
            </p>

            <div className="flex flex-wrap items-center justify-between gap-3 border-y border-zinc-200 py-3">
              <div className="flex flex-wrap items-center gap-3 text-[11px] sm:text-xs text-zinc-500">
                <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-bold">
                  <Tag className="w-3 h-3" />
                  {post.category.name}
                </span>
                {post.categories
                  .filter((c) => c.categoryId !== post.categoryId)
                  .map((c) => (
                    <Link
                      key={c.categoryId}
                      href={`/category/${c.category.slug}`}
                      className="inline-flex items-center gap-1 bg-zinc-100 text-zinc-600 hover:bg-blue-50 hover:text-blue-700 px-2 py-1 rounded-full font-medium transition-colors"
                    >
                      {c.category.name}
                    </Link>
                  ))}
                <span className="inline-flex items-center gap-1 tabular-nums">
                  <Calendar className="w-3.5 h-3.5" />
                  {faDate(publishedAt)}
                </span>
                <span className="inline-flex items-center gap-1 tabular-nums">
                  <Clock className="w-3.5 h-3.5" />
                  {faTime(publishedAt)}
                </span>
                <span className="inline-flex items-center gap-1 tabular-nums">
                  <Eye className="w-3.5 h-3.5" />
                  {faViews(post.views)} بازدید
                </span>
              </div>
              <ShareButtons url={canonical} title={post.title} />
            </div>
          </header>

          {/* Main image */}
          {image && (
            <figure className="mb-6">
              <div className="relative overflow-hidden rounded-xl bg-zinc-100 aspect-[16/9]">
                <SmartImage
                  src={image.url}
                  alt={imageAlt}
                  ratio="auto"
                  category={post.category.slug}
                  priority
                  className="!w-full !h-full"
                />
              </div>
              <figcaption className="text-[11px] text-zinc-400 mt-2">
                {imageAlt}
              </figcaption>
            </figure>
          )}

          {/* Video */}
          {post.videoType === "UPLOAD" && post.videoUrl && (
            <div className="mb-6">
              <video
                src={post.videoUrl}
                controls
                preload="metadata"
                className="w-full rounded-xl bg-zinc-900 aspect-video"
              />
              {post.videoDuration && (
                <div className="text-[11px] text-zinc-400 mt-1.5 tabular-nums">
                  مدت ویدیو: {faDuration(post.videoDuration)}
                </div>
              )}
            </div>
          )}
          {(post.videoType === "APARAT" || post.videoType === "YOUTUBE") &&
            post.videoUrl && (
              <div className="mb-6">
                <iframe
                  src={post.videoUrl}
                  title={post.title}
                  allowFullScreen
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  className="w-full rounded-xl bg-zinc-900 aspect-video border-0"
                />
              </div>
            )}

          {/* Body (sanitized server-side at save time) */}
          <div
            className="article-body"
            dir="rtl"
            dangerouslySetInnerHTML={{ __html: post.body }}
          />

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-8 pt-5 border-t border-zinc-200">
              <span className="text-xs text-zinc-500 font-bold">برچسب‌ها:</span>
              {post.tags.map((t) => (
                <span
                  key={t.tagId}
                  className="bg-zinc-100 hover:bg-blue-50 hover:text-blue-700 text-zinc-700 text-xs rounded-full px-3 py-1.5 transition-colors"
                >
                  {t.tag.name}
                </span>
              ))}
            </div>
          )}

          {/* Bottom share */}
          <div className="mt-6 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3.5 flex items-center justify-between flex-wrap gap-3">
            <span className="text-sm font-bold text-zinc-800">
              این خبر را به اشتراک بگذارید
            </span>
            <ShareButtons url={canonical} title={post.title} />
          </div>
        </article>

        {/* Related news */}
        {related.length > 0 && (
          <section className="max-w-[1440px] mx-auto px-4 lg:px-6 pb-10">
            <div className="border-b-2 border-petro-black pb-2 mb-5 flex items-end justify-between">
              <h2 className="section-heading text-xl sm:text-2xl font-black tracking-tight">
                اخبار مرتبط
              </h2>
              <Link
                href={`/category/${post.category.slug}`}
                className="inline-flex items-center gap-1 text-xs sm:text-sm text-zinc-600 hover:text-blue-700 mb-1 transition-colors group"
              >
                بیشتر در {post.category.name}
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
              {related.map((r) => (
                <Link
                  key={r.id}
                  href={r.hasOwnPage ? `/news/${r.slug}` : "#"}
                  className="group lift-on-hover bg-white border border-zinc-200 rounded-xl overflow-hidden"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-zinc-100">
                    <SmartImage
                      src={r.homeImage?.url}
                      alt={r.homeImageAlt || r.title}
                      ratio="auto"
                      category={r.category.slug}
                      className="!w-full !h-full"
                    />
                  </div>
                  <div className="p-3 sm:p-4">
                    <h3 className="font-bold text-sm sm:text-base text-zinc-900 group-hover:text-blue-700 transition-colors leading-relaxed line-clamp-2 mb-2">
                      {r.title}
                    </h3>
                    <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-zinc-400">
                      <span className="bg-blue-50 text-blue-700 rounded-full px-2 py-0.5 font-medium">
                        {r.category.name}
                      </span>
                      <span className="inline-flex items-center gap-1 tabular-nums">
                        <Clock className="w-3 h-3" />
                        {faDate(new Date(r.publishedAt))}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
      <BackToTop />
    </>
  );
}
