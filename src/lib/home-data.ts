// Data layer for the public homepage.
// Sections with manual layout come from SectionPlacement (ordered by position);
// automatic sections (latest / most-viewed) are plain queries.
// Only PUBLISHED posts whose publishedAt is in the past are ever returned.

import { db } from "./db";
import { faDate, faTime, faViews, faDuration } from "./post-format";

export interface HomePost {
  id: string;
  title: string;
  lead: string;
  kicker: string | null;
  category: string;
  categoryKey: string;
  date: string;
  time: string;
  href: string | null; // null when the post has no dedicated page
  imageUrl?: string;
  imageAlt: string;
  views: string;
  videoUrl: string | null;
  isUploadedVideo: boolean;
  videoDuration: string | null;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function toHomePost(p: any): HomePost {
  const publishedAt = new Date(p.publishedAt);
  return {
    id: p.id,
    title: p.title,
    lead: p.lead,
    kicker: p.kicker,
    category: p.category?.name ?? "",
    categoryKey: p.category?.slug ?? "insurance-market",
    date: faDate(publishedAt),
    time: faTime(publishedAt),
    href: p.hasOwnPage ? `/news/${p.slug}` : null,
    imageUrl: p.homeImage?.url ?? undefined,
    imageAlt: p.homeImageAlt || p.title,
    views: faViews(p.views),
    videoUrl: p.videoUrl ?? null,
    isUploadedVideo: p.videoType === "UPLOAD" && Boolean(p.videoUrl),
    videoDuration: faDuration(p.videoDuration),
  };
}

const postInclude = {
  category: { select: { name: true, slug: true } },
  homeImage: { select: { url: true } },
} as const;

const publishedWhere = () => ({
  status: "PUBLISHED" as const,
  publishedAt: { lte: new Date() },
});

/** Posts placed in a homepage section, ordered by their position. */
export async function getHomeSectionPosts(key: string): Promise<HomePost[]> {
  const placements = await db.sectionPlacement.findMany({
    where: {
      section: { key },
      post: publishedWhere(),
    },
    orderBy: { position: "asc" },
    include: { post: { include: postInclude } },
  });
  return placements.map((pl) => toHomePost(pl.post));
}

/** "آخرین مقالات" — automatic, newest first. */
export async function getLatestPosts(limit = 4): Promise<HomePost[]> {
  const posts = await db.post.findMany({
    where: publishedWhere(),
    orderBy: { publishedAt: "desc" },
    take: limit,
    include: postInclude,
  });
  return posts.map(toHomePost);
}

/** "پربازدیدترین" — automatic, by view counter. */
export async function getMostViewedPosts(limit = 5): Promise<HomePost[]> {
  const posts = await db.post.findMany({
    where: publishedWhere(),
    orderBy: [{ views: "desc" }, { publishedAt: "desc" }],
    take: limit,
    include: postInclude,
  });
  return posts.map(toHomePost);
}

export interface NavItem {
  label: string;
  href: string;
  hot?: boolean;
}

/** Navigation items: home + all categories (admin-managed order). */
export async function getNavCategories(): Promise<NavItem[]> {
  const cats = await db.category.findMany({
    orderBy: [{ order: "asc" }, { name: "asc" }],
  });
  return [
    { label: "صفحه اصلی", href: "/", hot: true },
    ...cats.map((c) => ({ label: c.name, href: `/category/${c.slug}` })),
  ];
}
