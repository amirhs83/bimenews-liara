import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import sharp from "sharp";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { requireAdmin, isErrorResponse } from "@/lib/security";
import { detectFileType, uploadLimits } from "@/lib/file-validation";
import { uploadToStorage } from "@/lib/storage";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const guard = await requireAdmin(req);
  if (isErrorResponse(guard)) return guard.response;

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json(
      { ok: false, error: "بدنه درخواست باید multipart/form-data باشد" },
      { status: 400 }
    );
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { ok: false, error: "فایلی ارسال نشده است" },
      { status: 400 }
    );
  }

  const altField = form.get("alt");
  const alt =
    typeof altField === "string" ? altField.trim().slice(0, 300) : "";

  // Optional non-destructive crop metadata (stored on the media row).
  const cropStateField = form.get("cropState");
  let cropState: unknown = null;
  if (typeof cropStateField === "string" && cropStateField.trim()) {
    try {
      cropState = JSON.parse(cropStateField);
    } catch {
      return NextResponse.json(
        { ok: false, error: "متادیتای کراپ نامعتبر است" },
        { status: 400 }
      );
    }
  }

  // Optional reference to the original media this crop was derived from.
  const cropSourceIdField = form.get("cropSourceId");
  const cropSourceId =
    typeof cropSourceIdField === "string" && cropSourceIdField.trim()
      ? cropSourceIdField.trim().slice(0, 64)
      : null;
  if (cropSourceId) {
    const source = await db.media.findUnique({
      where: { id: cropSourceId },
      select: { id: true },
    });
    if (!source) {
      return NextResponse.json(
        { ok: false, error: "تصویر مبدأ کراپ یافت نشد" },
        { status: 400 }
      );
    }
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer.length === 0) {
    return NextResponse.json(
      { ok: false, error: "فایل خالی است" },
      { status: 400 }
    );
  }

  // Real content validation (magic bytes) — extension/MIME from client is ignored
  const detected = detectFileType(buffer);
  if (!detected) {
    return NextResponse.json(
      {
        ok: false,
        error: "نوع فایل مجاز نیست. فقط تصویر (jpg/png/webp) یا ویدیو (mp4/webm)",
      },
      { status: 415 }
    );
  }

  const limits = uploadLimits();
  const maxBytes = detected.kind === "image" ? limits.image : limits.video;
  if (buffer.length > maxBytes) {
    const maxMb = Math.round(maxBytes / (1024 * 1024));
    return NextResponse.json(
      {
        ok: false,
        error: `حجم فایل بیش از حد مجاز است (حداکثر ${maxMb} مگابایت برای ${
          detected.kind === "image" ? "تصویر" : "ویدیو"
        })`,
      },
      { status: 413 }
    );
  }

  // Image dimensions (best effort)
  let width: number | null = null;
  let height: number | null = null;
  if (detected.kind === "image") {
    try {
      const meta = await sharp(buffer).metadata();
      width = meta.width ?? null;
      height = meta.height ?? null;
    } catch {
      // dimensions are optional metadata
    }
  }

  const key = `${randomUUID()}.${detected.ext}`;

  let stored;
  try {
    stored = await uploadToStorage(key, buffer, detected.mimeType);
  } catch (e) {
    console.error("Media upload failed:", e);
    return NextResponse.json(
      { ok: false, error: "ذخیره فایل ناموفق بود" },
      { status: 500 }
    );
  }

  const media = await db.media.create({
    data: {
      key,
      url: stored.url,
      provider: stored.provider,
      kind: detected.kind,
      mimeType: detected.mimeType,
      size: buffer.length,
      width,
      height,
      alt,
      cropState: cropState as Prisma.InputJsonValue | null | undefined,
      cropSourceId,
    },
  });

  return NextResponse.json({ ok: true, media }, { status: 201 });
}
