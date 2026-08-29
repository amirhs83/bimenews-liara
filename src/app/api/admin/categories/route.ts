import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, isErrorResponse } from "@/lib/security";
import { categoryCreateSchema } from "@/lib/validators";
import { uniqueCategorySlug } from "@/lib/slug";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const guard = await requireAdmin(req);
  if (isErrorResponse(guard)) return guard.response;

  const categories = await db.category.findMany({
    orderBy: [{ order: "asc" }, { name: "asc" }],
    include: { _count: { select: { postCategories: true } } },
  });
  // main category is always part of PostCategory, so this count covers all posts
  return NextResponse.json({
    ok: true,
    items: categories.map((c) => ({ ...c, _count: { posts: c._count.postCategories } })),
  });
}

export async function POST(req: Request) {
  const guard = await requireAdmin(req);
  if (isErrorResponse(guard)) return guard.response;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "بدنه درخواست نامعتبر است" },
      { status: 400 }
    );
  }
  const parsed = categoryCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "ورودی نامعتبر" },
      { status: 400 }
    );
  }

  const nameTaken = await db.category.findUnique({
    where: { name: parsed.data.name },
    select: { id: true },
  });
  if (nameTaken) {
    return NextResponse.json(
      { ok: false, error: "دسته‌ای با این نام از قبل وجود دارد" },
      { status: 409 }
    );
  }

  const slug = await uniqueCategorySlug(parsed.data.slug?.trim() || parsed.data.name);
  let order = parsed.data.order;
  if (order === undefined) {
    const max = await db.category.aggregate({ _max: { order: true } });
    order = (max._max.order ?? 0) + 1;
  }

  const category = await db.category.create({
    data: { name: parsed.data.name, slug, order },
  });
  return NextResponse.json({ ok: true, category }, { status: 201 });
}
