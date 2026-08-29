// Client-side helper for uploading media through the storage abstraction layer
// (POST /api/admin/media/upload). Used by the rich text editor and post forms.

export interface CropState {
  xPct: number;
  yPct: number;
  wPct: number;
  hPct: number;
  zoom: number;
  rotation: number;
  aspect: number | null;
}

export interface UploadedMedia {
  id: string;
  key: string;
  url: string;
  provider: string;
  kind: "image" | "video";
  mimeType: string;
  size: number;
  width: number | null;
  height: number | null;
  alt: string;
  cropState: CropState | null;
  cropSourceId: string | null;
}

export async function fetchMedia(id: string): Promise<UploadedMedia> {
  const res = await fetch(`/api/admin/media/${encodeURIComponent(id)}`);
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.ok) {
    throw new Error(data?.error ?? "دریافت رسانه ناموفق بود");
  }
  return data.media as UploadedMedia;
}

export async function uploadMediaFile(
  file: File,
  alt = "",
  crop?: { state: CropState; sourceId: string | null }
): Promise<UploadedMedia> {
  const fd = new FormData();
  fd.append("file", file);
  if (alt) fd.append("alt", alt);
  if (crop) {
    fd.append("cropState", JSON.stringify(crop.state));
    if (crop.sourceId) fd.append("cropSourceId", crop.sourceId);
  }

  const res = await fetch("/api/admin/media/upload", {
    method: "POST",
    body: fd,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.ok) {
    throw new Error(data?.error ?? "آپلود فایل ناموفق بود");
  }
  return data.media as UploadedMedia;
}