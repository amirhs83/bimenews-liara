// Site-wide constants used for SEO, canonical URLs and absolute links.
// Brand is configurable via env so the same codebase can power any news site.

export const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? "بیمه نیوز";
export const siteNameEn = process.env.NEXT_PUBLIC_SITE_NAME_EN ?? "BimeNews";
export const siteTagline =
  process.env.NEXT_PUBLIC_SITE_TAGLINE ?? "پایگاه خبری صنعت بیمه";
export const siteDescription =
  process.env.NEXT_PUBLIC_SITE_DESCRIPTION ??
  "بیمه نیوز، پایگاه تخصصی اخبار و تحلیل صنعت بیمه ایران و جهان. آخرین اخبار بازار بیمه، تنظیم‌گری، اینشورتک و رشته‌های بیمه.";
export const siteKeywords = (
  process.env.NEXT_PUBLIC_SITE_KEYWORDS ?? "اخبار بیمه,صنعت بیمه,بازار بیمه,اینشورتک,تنظیم‌گری,رشته‌های بیمه"
).split(",");

export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://bimenews.com"
).replace(/\/$/, "");

/** Turns a path (or already-absolute URL) into an absolute site URL. */
export function absoluteUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export function postUrl(slug: string): string {
  return `${siteUrl}/news/${slug}`;
}

/** RSS feed link for metadata.alternates.types — pages that set their own
 * canonical must repeat this because Next.js does not merge alternates
 * between layout and page. */
export const rssAlternates = {
  types: {
    "application/rss+xml": `${siteUrl}/feed.xml`,
  },
} as const;
