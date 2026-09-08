import { db } from "@/lib/db";
import { postUrl, siteName } from "@/lib/site";

export const dynamic = "force-dynamic";
// News sitemaps must stay fresh: regenerate at most every 15 minutes.
export const revalidate = 900;

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Google News sitemap: only posts from the last 2 days (hard requirement),
 * max 1000 URLs. Submit it in Search Console + Publisher Center so fresh
 * insurance news can surface in Top Stories / Google News.
 */
export async function GET() {
  const since = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
  let posts: { slug: string; title: string; publishedAt: Date }[] = [];
  try {
    posts = await db.post.findMany({
      where: {
        status: "PUBLISHED",
        publishedAt: { lte: new Date(), gte: since },
        hasOwnPage: true,
      },
      orderBy: { publishedAt: "desc" },
      take: 200,
      select: { slug: true, title: true, publishedAt: true },
    });
  } catch {
    posts = [];
  }

  const urls = posts
    .map(
      (p) => `  <url>
    <loc>${escapeXml(postUrl(p.slug))}</loc>
    <news:news>
      <news:publication>
        <news:name>${escapeXml(siteName)}</news:name>
        <news:language>fa</news:language>
      </news:publication>
      <news:publication_date>${new Date(p.publishedAt).toISOString()}</news:publication_date>
      <news:title>${escapeXml(p.title)}</news:title>
    </news:news>
  </url>`
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urls}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600",
    },
  });
}
