import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";
// regenerate at most once per hour
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let posts: { slug: string; updatedAt: Date }[] = [];
  let categories: { id: string; slug: string }[] = [];
  let latestByCategory: { categoryId: string; _max: { updatedAt: Date | null } }[] = [];
  try {
    [posts, categories, latestByCategory] = await Promise.all([
      db.post.findMany({
        where: {
          status: "PUBLISHED",
          publishedAt: { lte: new Date() },
          hasOwnPage: true,
        },
        orderBy: { publishedAt: "desc" },
        select: { slug: true, updatedAt: true },
      }),
      db.category.findMany({ select: { id: true, slug: true } }),
      db.post.groupBy({
        by: ["categoryId"],
        where: {
          status: "PUBLISHED",
          publishedAt: { lte: new Date() },
        },
        _max: { updatedAt: true },
      }),
    ]);
  } catch {
    // Build-time fallback with dummy DB
  }

  const latestMap = new Map(
    latestByCategory.map((c) => [c.categoryId, c._max.updatedAt])
  );

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1,
    },
    ...categories.map((c) => ({
      url: `${siteUrl}/category/${c.slug}`,
      lastModified: latestMap.get(c.id) ?? undefined,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    ...posts.map((p) => ({
      url: `${siteUrl}/news/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
  ];
}
