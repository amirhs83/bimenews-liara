import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, isErrorResponse } from "@/lib/security";
import { sectionPlacementsSchema } from "@/lib/validators";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ key: string }> };

// PUT /api/admin/sections/[key] — replaces ALL placements of a section
export async function PUT(req: Request, { params }: Ctx) {
  const guard = await requireAdmin(req);
  if (isErrorResponse(guard)) return guard.response;

  const { key } = await params;
  const section = await db.homeSection.findUnique({ where: { key } });
  if (!section) {
    return NextResponse.json(
      { ok: false, error: "بخش یافت نشد" },
      { status: 404 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "بدنه درخواست نامعتبر است" },
      { status: 400 }
    );
  }
  const parsed = sectionPlacementsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "ورودی نامعتبر است" },
      { status: 400 }
    );
  }

  // dedupe positions (keep last occurrence)
  const map = new Map<number, string>();
  for (const p of parsed.data.placements) map.set(p.position, p.postId);
  const placements = [...map.entries()].map(([position, postId]) => ({
    position,
    postId,
  }));

  // all referenced posts must exist
  const postIds = [...new Set(placements.map((p) => p.postId))];
  const found = await db.post.count({ where: { id: { in: postIds } } });
  if (found !== postIds.length) {
    return NextResponse.json(
      { ok: false, error: "یکی از پست‌های انتخاب‌شده وجود ندارد" },
      { status: 400 }
    );
  }

  await db.$transaction([
    db.sectionPlacement.deleteMany({ where: { sectionId: section.id } }),
    db.sectionPlacement.createMany({
      data: placements.map((p) => ({
        sectionId: section.id,
        postId: p.postId,
        position: p.position,
      })),
    }),
  ]);

  const updated = await db.homeSection.findUnique({
    where: { key },
    include: {
      placements: {
        orderBy: { position: "asc" },
        include: {
          post: {
            select: {
              id: true,
              title: true,
              status: true,
              publishedAt: true,
              homeImage: { select: { url: true } },
            },
          },
        },
      },
    },
  });

  return NextResponse.json({ ok: true, section: updated });
}
