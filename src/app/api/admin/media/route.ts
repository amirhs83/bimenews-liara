import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, isErrorResponse } from "@/lib/security";

export const runtime = "nodejs";

// GET /api/admin/media?page=1&pageSize=24&kind=image|video&q=...
export async function GET(req: Request) {
  const guard = await requireAdmin(req);
  if (isErrorResponse(guard)) return guard.response;

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const pageSize = Math.min(
    50,
    Math.max(1, parseInt(searchParams.get("pageSize") ?? "24", 10) || 24)
  );
  const kindParam = searchParams.get("kind");
  const q = searchParams.get("q")?.trim();

  const where = {
    ...(kindParam === "image" || kindParam === "video"
      ? { kind: kindParam }
      : {}),
    ...(q ? { alt: { contains: q, mode: "insensitive" as const } } : {}),
  };

  const [items, total] = await Promise.all([
    db.media.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.media.count({ where }),
  ]);

  return NextResponse.json({ ok: true, items, total, page, pageSize });
}
