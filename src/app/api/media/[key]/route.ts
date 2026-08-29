import { NextRequest } from "next/server";
import fs from "fs/promises";
import { createReadStream } from "fs";
import { Readable } from "stream";
import { db } from "@/lib/db";
import { MEDIA_KEY_REGEX } from "@/lib/file-validation";
import { localFilePath } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Public media serving for the local-disk storage provider.
// Only files with a registered Media record are reachable.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params;
  if (!MEDIA_KEY_REGEX.test(key)) {
    return new Response("Not found", { status: 404 });
  }

  const media = await db.media.findUnique({ where: { key } });
  if (!media) {
    return new Response("Not found", { status: 404 });
  }

  // Blob-stored media is served directly from Vercel's CDN
  if (media.provider === "blob") {
    return Response.redirect(media.url, 302);
  }

  let stat;
  try {
    stat = await fs.stat(localFilePath(key));
  } catch {
    return new Response("Not found", { status: 404 });
  }

  const baseHeaders: Record<string, string> = {
    "Content-Type": media.mimeType,
    "X-Content-Type-Options": "nosniff",
    "Accept-Ranges": "bytes",
    "Content-Disposition": "inline",
    // keys are content-unique uuids, safe to cache forever
    "Cache-Control": "public, max-age=31536000, immutable",
  };

  // Basic single-range support (needed for video seeking / Safari playback)
  const range = req.headers.get("range");
  if (range) {
    const m = /^bytes=(\d*)-(\d*)$/.exec(range.trim());
    if (m && (m[1] || m[2])) {
      let start = m[1] ? parseInt(m[1], 10) : NaN;
      let end = m[2] ? parseInt(m[2], 10) : NaN;
      if (isNaN(start) && !isNaN(end)) {
        // suffix range: last N bytes
        start = Math.max(0, stat.size - end);
        end = stat.size - 1;
      }
      if (isNaN(end) || end >= stat.size) end = stat.size - 1;

      if (!isNaN(start) && start >= 0 && start <= end && start < stat.size) {
        const stream = createReadStream(localFilePath(key), { start, end });
        return new Response(
          Readable.toWeb(stream) as unknown as ReadableStream,
          {
            status: 206,
            headers: {
              ...baseHeaders,
              "Content-Range": `bytes ${start}-${end}/${stat.size}`,
              "Content-Length": String(end - start + 1),
            },
          }
        );
      }
      return new Response(null, {
        status: 416,
        headers: { "Content-Range": `bytes */${stat.size}` },
      });
    }
  }

  const stream = createReadStream(localFilePath(key));
  return new Response(Readable.toWeb(stream) as unknown as ReadableStream, {
    headers: { ...baseHeaders, "Content-Length": String(stat.size) },
  });
}
