import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ slug: string }> };

// POST /api/view/[slug] — public view counter (pinged once per page view from the client)
// Abuse protection: global per-IP cap + one counted view per (IP, slug) per hour.
export async function POST(req: Request, { params }: Ctx) {
  const { slug } = await params;
  const ip = getClientIp(req);

  const global = rateLimit(`view:${ip}`, 60, 60_000);
  if (!global.success) {
    return NextResponse.json(
      { ok: false, error: "rate_limited" },
      { status: 429 }
    );
  }

  const post = await db.post.findFirst({
    where: {
      slug,
      status: "PUBLISHED",
      publishedAt: { lte: new Date() },
      hasOwnPage: true,
    },
    select: { id: true, views: true },
  });
  if (!post) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  // same IP re-viewing the same post within an hour doesn't inflate the counter
  const dedupe = rateLimit(`view:${ip}:${slug}`, 1, 60 * 60_000);
  if (!dedupe.success) {
    return NextResponse.json({ ok: true, views: post.views, counted: false });
  }

  const updated = await db.post.update({
    where: { id: post.id },
    data: { views: { increment: 1 } },
    select: { views: true },
  });

  return NextResponse.json({ ok: true, views: updated.views, counted: true });
}
