// Server-side file type detection via magic bytes.
// The client-provided MIME/extension is never trusted.

export type MediaKind = "image" | "video";

export interface DetectedFileType {
  kind: MediaKind;
  mimeType: string;
  ext: string;
}

interface Signature {
  kind: MediaKind;
  mimeType: string;
  ext: string;
  matches: (b: Buffer) => boolean;
}

const SIGNATURES: Signature[] = [
  {
    kind: "image",
    mimeType: "image/jpeg",
    ext: "jpg",
    matches: (b) => b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  },
  {
    kind: "image",
    mimeType: "image/png",
    ext: "png",
    matches: (b) =>
      b.length > 8 &&
      b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 &&
      b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a,
  },
  {
    kind: "image",
    mimeType: "image/webp",
    ext: "webp",
    matches: (b) =>
      b.length > 12 &&
      b.toString("ascii", 0, 4) === "RIFF" &&
      b.toString("ascii", 8, 12) === "WEBP",
  },
  {
    kind: "video",
    mimeType: "video/mp4",
    ext: "mp4",
    // ISO BMFF: first box must be "ftyp" (4-byte size + "ftyp")
    matches: (b) => b.length > 12 && b.toString("ascii", 4, 8) === "ftyp",
  },
  {
    kind: "video",
    mimeType: "video/webm",
    ext: "webm",
    // EBML header
    matches: (b) =>
      b.length > 4 && b[0] === 0x1a && b[1] === 0x45 && b[2] === 0xdf && b[3] === 0xa3,
  },
];

/** Returns the detected type or null when the content is not an allowed image/video. */
export function detectFileType(buf: Buffer): DetectedFileType | null {
  for (const s of SIGNATURES) {
    if (s.matches(buf)) {
      return { kind: s.kind, mimeType: s.mimeType, ext: s.ext };
    }
  }
  return null;
}

/** Upload size limits in bytes (env-configurable). */
export function uploadLimits(): { image: number; video: number } {
  const imgMb = Number(process.env.MAX_IMAGE_UPLOAD_MB) || 5;
  const vidMb = Number(process.env.MAX_VIDEO_UPLOAD_MB) || 100;
  return { image: imgMb * 1024 * 1024, video: vidMb * 1024 * 1024 };
}

/** Storage keys are "<uuid>.<ext>" — this is also what /api/media/[key] accepts. */
export const MEDIA_KEY_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp|mp4|webm)$/;
