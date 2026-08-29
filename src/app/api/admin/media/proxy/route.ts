import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, isErrorResponse } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_PROXY_BYTES = 25 * 1024 * 1024;
const ALLOWED_MIME = /^image\/(jpeg|png|webp|gif|avif|svg\+xml)$/i;

// Proxies a remote image through the server so the crop tool never hits
// CORS / network restrictions in the browser. Admin-only.
// GET /api/admin/media/proxy?url=https://...
export async function GET(req: NextRequest) {
  const guard = await requireAdmin(req);
  if (isErrorResponse(guard)) return guard.response;

  const url = req.nextUrl.searchParams.get("url")?.trim();
  if (!url) {
    return NextResponse.json({ ok: false, error: "url required" }, { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(url);
  } catch {
    return NextResponse.json({ ok: false, error: "url نامعتبر است" }, { status: 400 });
  }
  if (target.protocol !== "https:" && target.protocol !== "http:") {
    return NextResponse.json({ ok: false, error: "فقط http/https مجاز است" }, { status: 400 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(target, {
      redirect: "follow",
      headers: { "User-Agent": "BimeNews/1.0" },
      signal: AbortSignal.timeout(15_000),
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "دریافت تصویر از منبع ناموفق بود" },
      { status: 502 }
    );
  }

  if (!upstream.ok) {
    return NextResponse.json(
      { ok: false, error: `منبع با کد ${upstream.status} پاسخ داد` },
      { status: 502 }
    );
  }

  const contentType = upstream.headers.get("content-type") ?? "";
  if (!ALLOWED_MIME.test(contentType)) {
    return NextResponse.json(
      { ok: false, error: "نوع فایل مبدأ مجاز نیست" },
      { status: 415 }
    );
  }

  const length = Number(upstream.headers.get("content-length") ?? "0");
  if (length > MAX_PROXY_BYTES) {
    return NextResponse.json(
      { ok: false, error: "حجم تصویر مبدأ بیش از حد مجاز است" },
      { status: 413 }
    );
  }

  const buffer = await upstream.arrayBuffer();
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
