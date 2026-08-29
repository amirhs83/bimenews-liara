"use client";

import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  uploadMediaFile,
  fetchMedia,
  type UploadedMedia,
  type CropState,
} from "@/lib/upload-client";
import {
  ImagePlus,
  Loader2,
  X,
  Film,
  Crop as CropIcon,
} from "lucide-react";
import ImageCropDialog, { type CropOutput } from "./image-crop-dialog";

interface MediaPickerProps {
  kind: "image" | "video";
  value: UploadedMedia | null;
  onSelect: (media: UploadedMedia) => void;
  onClear: () => void;
  placeholder?: string;
}

export default function MediaPicker({
  kind,
  value,
  onSelect,
  onClear,
  placeholder,
}: MediaPickerProps) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"library" | "upload">("library");
  const [items, setItems] = useState<UploadedMedia[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // picked-but-not-yet-uploaded file (waiting for the user to choose crop or not)
  const [pickedFile, setPickedFile] = useState<File | null>(null);
  const [pickedPreview, setPickedPreview] = useState<string | null>(null);

  // crop dialog state
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [cropPending, setCropPending] = useState<"file" | "library" | null>(
    null
  );
  const [cropError, setCropError] = useState<string | null>(null);
  // the ORIGINAL image being cropped + its format + previously saved state
  const [cropTarget, setCropTarget] = useState<UploadedMedia | null>(null);
  const [cropInitial, setCropInitial] = useState<CropState | null>(null);
  const uploadedRef = useRef(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError(null);
    fetch(`/api/admin/media?kind=${kind}&pageSize=48`)
      .then((r) => r.json())
      .then((d) => setItems(d.items ?? []))
      .catch(() => setError("بارگذاری کتابخانه ناموفق بود"))
      .finally(() => setLoading(false));
  }, [open, kind]);

  function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError(null);
    setCropError(null);
    setPickedFile(file);
    setPickedPreview(URL.createObjectURL(file));
  }

  /** upload whatever we have and select it (optionally carrying crop metadata) */
  async function uploadAndSelect(
    file: Blob,
    name: string,
    crop?: { state: CropState; sourceId: string | null }
  ) {
    setUploading(true);
    setError(null);
    try {
      const media = await uploadMediaFile(
        new File([file], name, { type: file.type || "image/jpeg" }),
        "",
        crop
      );
      uploadedRef.current = true;
      onSelect(media);
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "آپلود ناموفق بود");
    } finally {
      setUploading(false);
    }
  }

  /** user picked "آپلود مستقیم" */
  async function uploadDirect() {
    if (!pickedFile) return;
    await uploadAndSelect(pickedFile, pickedFile.name);
    if (uploadedRef.current) {
      setPickedFile(null);
      setPickedPreview(null);
    }
  }

  /** user picked "کِراپ و آپلود" for the fresh file */
  function cropFreshFile() {
    if (!pickedPreview) return;
    setCropError(null);
    setCropTarget(null);
    setCropInitial(null);
    setCropPending("file");
    setCropSrc(pickedPreview);
  }

  /** Open the cropper for a media, following the cropSourceId chain back to the
   *  TRUE original (so re-edits never accumulate). Restores the saved crop
   *  state when the media is a previously-cropped copy. */
  async function openCropFor(media: UploadedMedia) {
    setCropError(null);
    try {
      const target = media.cropSourceId
        ? await fetchMedia(media.cropSourceId)
        : media;
      const src = await fetchForCrop(target.url);
      setCropTarget(target);
      setCropInitial(media.cropSourceId ? media.cropState : null);
      setCropPending("library");
      setCropSrc(src);
    } catch (e) {
      setCropError(
        e instanceof Error ? e.message : "بارگذاری تصویر برای کراپ ناموفق بود"
      );
    }
  }

  /** crop an existing library image → uploads the cropped copy as new media */
  function cropLibraryImage(media: UploadedMedia) {
    void openCropFor(media);
  }

  /** crop the currently selected image → uploads the cropped copy */
  function cropSelected() {
    if (!value) return;
    void openCropFor(value);
  }

  /** fetch an image through the local proxy so canvas stays untainted */
  async function fetchForCrop(url: string): Promise<string> {
    const res = await fetch(
      url.startsWith("/")
        ? url
        : `/api/admin/media/proxy?url=${encodeURIComponent(url)}`
    );
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      throw new Error(data?.error ?? "دریافت تصویر ناموفق بود");
    }
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  }

  async function handleCropConfirm(out: CropOutput) {
    await uploadAndSelect(out.blob, out.fileName, {
      state: out.state,
      sourceId: cropTarget?.id ?? null,
    });
    if (uploadedRef.current) {
      closeCrop();
      setPickedFile(null);
      setPickedPreview(null);
    }
  }

  function closeCrop() {
    setCropSrc(null);
    setCropPending(null);
    setCropError(null);
    setCropTarget(null);
    setCropInitial(null);
    uploadedRef.current = false;
  }

  const uploadBlocked = uploading;

  return (
    <div>
      {value ? (
        <div className="relative border border-zinc-200 rounded-lg overflow-hidden bg-zinc-50">
          {kind === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value.url}
              alt={value.alt || ""}
              className="w-full h-40 object-cover"
            />
          ) : (
            <div className="w-full h-40 flex items-center justify-center bg-zinc-900 text-white gap-2">
              <Film className="w-5 h-5" />
              <span className="text-xs" dir="ltr">
                {value.url}
              </span>
            </div>
          )}
          <div className="absolute top-2 left-2 flex gap-1">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="text-[11px] bg-white/90 hover:bg-white border border-zinc-300 rounded px-2 py-1"
            >
              تغییر
            </button>
            {kind === "image" && (
              <button
                type="button"
                onClick={cropSelected}
                className="text-[11px] bg-white/90 hover:bg-white border border-zinc-300 rounded px-2 py-1 inline-flex items-center gap-1"
              >
                <CropIcon className="w-3 h-3" />
                کِراپ
              </button>
            )}
            <button
              type="button"
              onClick={onClear}
              className="text-[11px] bg-red-600/90 hover:bg-red-600 text-white rounded px-2 py-1 inline-flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              حذف
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-full border-2 border-dashed border-zinc-300 hover:border-blue-500 rounded-lg py-8 text-sm text-zinc-500 hover:text-blue-700 transition-colors flex flex-col items-center gap-2"
        >
          <ImagePlus className="w-6 h-6" />
          {placeholder ??
            (kind === "image" ? "انتخاب یا آپلود تصویر" : "انتخاب یا آپلود ویدیو")}
        </button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle>
              {kind === "image" ? "انتخاب تصویر" : "انتخاب ویدیو"}
            </DialogTitle>
          </DialogHeader>

          <div className="flex gap-2 border-b border-zinc-200 pb-2">
            <button
              type="button"
              onClick={() => setTab("library")}
              className={`px-3 py-1.5 text-sm rounded-md ${
                tab === "library"
                  ? "bg-blue-600 text-white font-bold"
                  : "text-zinc-600 hover:bg-zinc-100"
              }`}
            >
              کتابخانه رسانه
            </button>
            <button
              type="button"
              onClick={() => setTab("upload")}
              className={`px-3 py-1.5 text-sm rounded-md ${
                tab === "upload"
                  ? "bg-blue-600 text-white font-bold"
                  : "text-zinc-600 hover:bg-zinc-100"
              }`}
            >
              آپلود جدید
            </button>
          </div>

          {error && <p className="text-sm text-red-600 pt-2">{error}</p>}

          {tab === "upload" ? (
            <div className="pt-3">
              <label
                className={`block w-full border-2 border-dashed border-zinc-300 hover:border-blue-500 rounded-lg py-10 text-sm text-zinc-600 hover:text-blue-700 transition-colors text-center cursor-pointer ${
                  uploadBlocked ? "opacity-50 pointer-events-none" : ""
                }`}
              >
                {uploading ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    در حال آپلود...
                  </span>
                ) : kind === "image" ? (
                  "انتخاب تصویر (jpg / png / webp — حداکثر ۵ مگابایت)"
                ) : (
                  "انتخاب ویدیو (mp4 / webm — حداکثر ۱۰۰ مگابایت)"
                )}
                <input
                  type="file"
                  className="hidden"
                  accept={
                    kind === "image"
                      ? "image/jpeg,image/png,image/webp"
                      : "video/mp4,video/webm"
                  }
                  onChange={onPickFile}
                />
              </label>

              {/* picked file — user decides: direct upload or crop */}
              {pickedFile && pickedPreview && !uploading && (
                <div className="mt-3 border border-zinc-200 rounded-lg p-3 flex items-center gap-3 bg-zinc-50">
                  {kind === "image" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={pickedPreview}
                      alt=""
                      className="w-24 h-16 object-cover rounded-md border border-zinc-200"
                    />
                  ) : (
                    <span className="w-24 h-16 flex items-center justify-center bg-zinc-900 text-white rounded-md">
                      <Film className="w-5 h-5" />
                    </span>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-zinc-700 truncate" dir="ltr">
                      {pickedFile.name}
                    </p>
                    <p className="text-[11px] text-zinc-400">
                      {Math.round(pickedFile.size / 1024)} KB
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <button
                        type="button"
                        onClick={uploadDirect}
                        className="px-3 py-1.5 text-xs bg-zinc-200 hover:bg-zinc-300 text-zinc-700 rounded-md font-bold transition-colors"
                      >
                        آپلود مستقیم (بدون کراپ)
                      </button>
                      {kind === "image" && (
                        <button
                          type="button"
                          onClick={cropFreshFile}
                          className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded-md font-bold transition-colors inline-flex items-center gap-1"
                        >
                          <CropIcon className="w-3.5 h-3.5" />
                          کِراپ و آپلود
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setPickedFile(null);
                          setPickedPreview(null);
                        }}
                        className="px-3 py-1.5 text-xs text-zinc-500 hover:text-red-600 rounded-md transition-colors"
                      >
                        انصراف
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="pt-3">
              {loading ? (
                <div className="py-10 text-center text-sm text-zinc-500">
                  <Loader2 className="w-5 h-5 animate-spin inline-block ml-2" />
                  در حال بارگذاری...
                </div>
              ) : items.length === 0 ? (
                <p className="py-10 text-center text-sm text-zinc-500">
                  هنوز رسانه‌ای آپلود نشده — از تب «آپلود جدید» استفاده کنید.
                </p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {items.map((m) => (
                    <div
                      key={m.id}
                      className="relative aspect-video border border-zinc-200 rounded-lg overflow-hidden group bg-zinc-100"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          onSelect(m);
                          setOpen(false);
                        }}
                        className="w-full h-full block"
                        title={m.alt || m.key}
                      >
                        {m.kind === "image" ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={m.url}
                            alt={m.alt || ""}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="w-full h-full flex items-center justify-center bg-zinc-900 text-white">
                            <Film className="w-6 h-6" />
                          </span>
                        )}
                      </button>
                      {m.kind === "image" && (
                        <button
                          type="button"
                          onClick={() => cropLibraryImage(m)}
                          className="absolute top-1 right-1 bg-black/60 hover:bg-blue-600 text-white text-[10px] rounded px-1.5 py-0.5 inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="کِراپ و آپلود نسخه جدید"
                        >
                          <CropIcon className="w-3 h-3" />
                          کِراپ
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ImageCropDialog
        open={cropSrc !== null}
        imageSrc={cropSrc}
        title={
          cropPending === "file"
            ? "کِراپ تصویر قبل از آپلود"
            : cropInitial
              ? "ویرایش مجدد کِراپ"
              : "کِراپ تصویر"
        }
        defaultAspect={kind === "image" ? 16 / 9 : undefined}
        outputMime={cropTarget?.mimeType ?? pickedFile?.type ?? undefined}
        initialState={cropInitial}
        onCancel={closeCrop}
        onConfirm={handleCropConfirm}
      />
      {cropError && (
        <p className="text-sm text-red-600 pt-1 bg-red-50 rounded-md px-2 py-1">
          {cropError}
        </p>
      )}
    </div>
  );
}