import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, isErrorResponse } from "@/lib/security";
import { tagCreateSchema } from "@/lib/validators";
import { uniqueTagSlug } from "@/lib/slug";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const guard = await requireAdmin(req);
  if (isErrorResponse(guard)) return guard.response;

  const tags = await db.tag.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { posts: true } } },
  });
  return NextResponse.json({ ok: true, items: tags });
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
  const parsed = tagCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "ورودی نامعتبر" },
      { status: 400 }
    );
  }

  const tag = await db.tag.upsert({
    where: { name: parsed.data.name },
    update: {},
    create: {
      name: parsed.data.name,
      slug: await uniqueTagSlug(db, parsed.data.name),
    },
  });

  return NextResponse.json({ ok: true, tag }, { status: 201 });
}
