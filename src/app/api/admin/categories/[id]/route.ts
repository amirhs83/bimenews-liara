import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, isErrorResponse } from "@/lib/security";
import { categoryUpdateSchema } from "@/lib/validators";
import { uniqueCategorySlug } from "@/lib/slug";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Ctx) {
  const guard = await requireAdmin(req);
  if (isErrorResponse(guard)) return guard.response;

  const { id } = await params;
  const existing = await db.category.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json(
      { ok: false, error: "دسته‌بندی یافت نشد" },
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
  const parsed = categoryUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "ورودی نامعتبر" },
      { status: 400 }
    );
  }

  const data: { name?: string; slug?: string; order?: number } = {};
  if (parsed.data.name !== undefined) {
    const nameTaken = await db.category.findFirst({
      where: { name: parsed.data.name, id: { not: id } },
      select: { id: true },
    });
    if (nameTaken) {
      return NextResponse.json(
        { ok: false, error: "دسته‌ای با این نام از قبل وجود دارد" },
        { status: 409 }
      );
    }
    data.name = parsed.data.name;
  }
  if (parsed.data.slug !== undefined) {
    data.slug = await uniqueCategorySlug(parsed.data.slug.trim() || existing.name, id);
  }
  if (parsed.data.order !== undefined) data.order = parsed.data.order;

  const category = await db.category.update({ where: { id }, data });
  return NextResponse.json({ ok: true, category });
}

export async function DELETE(req: Request, { params }: Ctx) {
  const guard = await requireAdmin(req);
  if (isErrorResponse(guard)) return guard.response;

  const { id } = await params;
  const existing = await db.category.findUnique({
    where: { id },
    include: { _count: { select: { posts: true } } },
  });
  if (!existing) {
    return NextResponse.json(
      { ok: false, error: "دسته‌بندی یافت نشد" },
      { status: 404 }
    );
  }

  if (existing._count.posts > 0) {
    return NextResponse.json(
      {
        ok: false,
        error: `این دسته ${existing._count.posts} پست دارد؛ ابتدا پست‌ها را به دسته دیگری منتقل کنید`,
      },
      { status: 409 }
    );
  }

  await db.category.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
