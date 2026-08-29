import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, isErrorResponse } from "@/lib/security";

export const runtime = "nodejs";

// GET /api/admin/media/[id] — single media row (used to load the ORIGINAL
// image when re-editing a crop, following the cropSourceId chain).
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin(_req);
  if (isErrorResponse(guard)) return guard.response;

  const { id } = await params;
  if (!id || id.length > 64) {
    return NextResponse.json({ ok: false, error: "شناسه نامعتبر است" }, { status: 400 });
  }

  const media = await db.media.findUnique({ where: { id } });
  if (!media) {
    return NextResponse.json({ ok: false, error: "رسانه یافت نشد" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, media });
}