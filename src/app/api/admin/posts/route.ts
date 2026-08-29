import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
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

// GET /api/admin/posts?q=&status=&categoryId=&page=&pageSize=
export async function GET(req: Request) {
  const guard = await requireAdmin(req);
  if (isErrorResponse(guard)) return guard.response;

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const pageSize = Math.min(
    50,
    Math.max(1, parseInt(searchParams.get("pageSize") ?? "15", 10) || 15)
  );
  const q = searchParams.get("q")?.trim();
  const status = searchParams.get("status");
  const categoryId = searchParams.get("categoryId");

  const where: Prisma.PostWhereInput = {
    ...(q ? { title: { contains: q, mode: "insensitive" } } : {}),
    ...(status === "DRAFT" || status === "SCHEDULED" || status === "PUBLISHED"
      ? { status }
      : {}),
    ...(categoryId
      ? {
          OR: [
            { categoryId },
            { categories: { some: { categoryId } } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    db.post.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        category: { select: { id: true, name: true } },
        categories: {
          include: { category: { select: { id: true, name: true } } },
        },
        homeImage: { select: { id: true, url: true } },
        placements: {
          orderBy: { position: "asc" },
          include: { section: { select: { key: true, name: true } } },
        },
      },
    }),
    db.post.count({ where }),
  ]);

  return NextResponse.json({ ok: true, items, total, page, pageSize });
}

export async function POST(req: Request) {
  const guard = await requireAdmin(req);
  if (isErrorResponse(guard)) return guard.response;

  const result = await validatePostPayload(req);
  if (result.response) return result.response;
  const input = result.input;

  const placements = dedupePlacements(input.placements);
  const { byKey, unknown } = await resolveSections(placements);
  if (unknown.length) {
    return badRequest(`بخش نامعتبر: ${unknown.join(", ")}`);
  }
  const conflicts = await findConflicts(byKey, placements);
  if (conflicts.length && input.placementsMode === "strict") {
    return NextResponse.json(
      { ok: false, error: "placement_conflict", conflicts },
      { status: 409 }
    );
  }

  const slug = await uniqueSlug(
    input.slug?.trim() ? slugify(input.slug) : input.title
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

    const created = await tx.post.create({
      data: {
        ...postDataFromInput(input, slug, cleanBody),
        categories: {
          create: input.categories.map((categoryId) => ({ categoryId })),
        },
        tags: { create: tagIds.map((tagId) => ({ tagId })) },
      },
    });
    await writePlacements(tx, byKey, created.id, placements);
    return created;
  });

  return NextResponse.json(
    { ok: true, id: post.id, slug: post.slug },
    { status: 201 }
  );
}
