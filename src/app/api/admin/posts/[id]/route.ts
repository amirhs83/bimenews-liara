import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, isErrorResponse } from "@/lib/security";
import { sanitizePostBody } from "@/lib/sanitize";
import { slugify, uniqueSlug, uniqueTagSlug } from "@/lib/slug";
import {
  dedupePlacements,
  resolveSections,
  findConflicts,
  writePlacements,
} from "@/lib/placements";
import { badRequest, validatePostPayload, postDataFromInput } from "@/lib/post-service";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

const fullInclude = {
  category: true,
  categories: { include: { category: true } },
  tags: { include: { tag: true } },
  homeImage: true,
  innerImage: true,
  ogImage: true,
  placements: {
    orderBy: { position: "asc" as const },
    include: { section: { select: { key: true, name: true } } },
  },
};

export async function GET(req: Request, { params }: Ctx) {
  const guard = await requireAdmin(req);
  if (isErrorResponse(guard)) return guard.response;

  const { id } = await params;
  const post = await db.post.findUnique({ where: { id }, include: fullInclude });
  if (!post) {
    return NextResponse.json(
      { ok: false, error: "پست یافت نشد" },
      { status: 404 }
    );
  }
  return NextResponse.json({ ok: true, post });
}

export async function PUT(req: Request, { params }: Ctx) {
  const guard = await requireAdmin(req);
  if (isErrorResponse(guard)) return guard.response;

  const { id } = await params;
  const existing = await db.post.findUnique({ where: { id }, select: { id: true } });
  if (!existing) {
    return NextResponse.json(
      { ok: false, error: "پست یافت نشد" },
      { status: 404 }
    );
  }

  const result = await validatePostPayload(req);
  if (result.response) return result.response;
  const input = result.input;

  const placements = dedupePlacements(input.placements);
  const { byKey, unknown } = await resolveSections(placements);
  if (unknown.length) {
    return badRequest(`بخش نامعتبر: ${unknown.join(", ")}`);
  }
  const conflicts = await findConflicts(byKey, placements, id);
  if (conflicts.length && input.placementsMode === "strict") {
    return NextResponse.json(
      { ok: false, error: "placement_conflict", conflicts },
      { status: 409 }
    );
  }

  const slug = await uniqueSlug(
    input.slug?.trim() ? slugify(input.slug) : input.title,
    id
  );
  const cleanBody = sanitizePostBody(input.body);

  const post = await db.$transaction(async (tx) => {
    const tagIds: string[] = [];
    for (const name of input.tags) {
      const tag = await tx.tag.upsert({
        where: { name },
        update: {},
        create: { name, slug: await uniqueTagSlug(tx, name) },
      });
      tagIds.push(tag.id);
    }

    const updated = await tx.post.update({
      where: { id },
      data: {
        ...postDataFromInput(input, slug, cleanBody, true),
        categories: {
          deleteMany: {},
          create: input.categories.map((categoryId) => ({ categoryId })),
        },
        tags: {
          deleteMany: {},
          create: tagIds.map((tagId) => ({ tagId })),
        },
      },
    });
    await writePlacements(tx, byKey, id, placements);
    return updated;
  });

  return NextResponse.json({ ok: true, id: post.id, slug: post.slug });
}

export async function DELETE(req: Request, { params }: Ctx) {
  const guard = await requireAdmin(req);
  if (isErrorResponse(guard)) return guard.response;

  const { id } = await params;
  const existing = await db.post.findUnique({ where: { id }, select: { id: true } });
  if (!existing) {
    return NextResponse.json(
      { ok: false, error: "پست یافت نشد" },
      { status: 404 }
    );
  }

  // placements + tag links cascade via schema; media library items are kept
  await db.post.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
