import { db } from "@/lib/db";
import { absoluteUrl, postUrl, siteDescription, siteName, siteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";
export const revalidate = 3600; // regenerate at most once per hour

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  let posts: Awaited<ReturnType<typeof db.post.findMany>> = [];
  try {
    posts = await db.post.findMany({
      where: {
        status: "PUBLISHED",
        publishedAt: { lte: new Date() },
        hasOwnPage: true,
      },
      orderBy: { publishedAt: "desc" },
      take: 50,
      include: {
        category: true,
        categories: { include: { category: { select: { name: true } } } },
      },
    });
  } catch {
    posts = [];
  }

  const items = posts
    .map((p) => {
      const link = postUrl(p.slug);
      const categories = [
        p.category.name,
        ...p.categories.map((c) => c.category.name),
      ].filter((name, i, arr) => arr.indexOf(name) === i);
      return `    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <description>${escapeXml(p.lead)}</description>
      <pubDate>${new Date(p.publishedAt).toUTCString()}</pubDate>
${categories.map((name) => `      <category>${escapeXml(name)}</category>`).join("\n")}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteName)}</title>
    <link>${escapeXml(siteUrl)}</link>
    <description>${escapeXml(siteDescription)}</description>
    <language>fa</language>
    <atom:link href="${escapeXml(absoluteUrl("/feed.xml"))}" rel="self" type="application/rss+xml"/>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
