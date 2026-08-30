"use client";

import { useEffect, useRef, useState } from "react";
import Cropper, {
  getInitialCropFromCroppedAreaPercentages,
} from "react-easy-crop";
import "react-easy-crop/react-easy-crop.css";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, RotateCw } from "lucide-react";
import type { Area, MediaSize, Point, Size } from "react-easy-crop";
import type { CropState } from "@/lib/upload-client";

export interface CropOutput {
  blob: Blob;
  fileName: string;
  state: CropState;
}

interface ImageCropDialogProps {
  open: boolean;
  imageSrc: string | null;
  title?: string;
  defaultAspect?: number;
  /** Original source mime ("image/png" | "image/webp" | "image/jpeg") so the
   *  cropped output keeps the SAME format as the original. */
  outputMime?: string;
  /** Saved crop metadata to restore when re-editing an existing crop. */
  initialState?: CropState | null;
  onCancel: () => void;
  onConfirm: (out: CropOutput) => Promise<void> | void;
}

const ASPECT_PRESETS: { label: string; value: number | null }[] = [
  { label: "آزاد", value: null },
  { label: "۱:۱", value: 1 },
  { label: "۴:۳", value: 4 / 3 },
  { label: "۳:۲", value: 3 / 2 },
  { label: "۱۶:۹", value: 16 / 9 },
  { label: "۱۶:۱۰", value: 16 / 10 },
  { label: "۲:۳", value: 2 / 3 },
  { label: "۹:۱۶", value: 9 / 16 },
];

const MAX_OUTPUT_DIMENSION = 2560;
const MIN_ZOOM = 0.3;
const MAX_ZOOM = 5;

function rotateSize(width: number, height: number, rotation: number) {
  const rad = (rotation * Math.PI) / 180;
  return {
    width: Math.abs(Math.cos(rad) * width) + Math.abs(Math.sin(rad) * height),
    height: Math.abs(Math.sin(rad) * width) + Math.abs(Math.cos(rad) * height),
  };
}

/** Same math react-easy-crop uses internally (helpers.getCropSize). */
function cropSizeFromContainer(
  mediaSize: Size,
  container: Size,
  aspect: number | null,
  rotation: number
): Size {
  if (aspect === null) return { width: container.width, height: container.height };
  const { width, height } = rotateSize(mediaSize.width, mediaSize.height, rotation);
  const fittingWidth = Math.min(width, container.width);
  const fittingHeight = Math.min(height, container.height);
  if (fittingWidth > fittingHeight * aspect) {
    return { width: fittingHeight * aspect, height: fittingHeight };
  }
  return { width: fittingWidth, height: fittingWidth / aspect };
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("بارگذاری تصویر ناموفق بود"));
    img.src = src;
  });
}

function extForMime(mime: string): string {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return "jpg";
}

/** Renders the source image onto a canvas honoring rotation and the crop area.
 *  croppedAreaPixels from react-easy-crop is already in the rotated natural-image
 *  coordinate space, so we sample it directly (canonical getCroppedImg approach).
 *  The output keeps the SOURCE format (PNG stays PNG, WebP stays WebP, ...). */
async function cropImage(
  imageSrc: string,
  pixelCrop: Area,
  rotation: number,
  mime: string
): Promise<CropOutput> {
  const image = await loadImage(imageSrc);

  // canvas big enough to hold the rotated image
  const bbox = rotateSize(image.naturalWidth, image.naturalHeight, rotation);
  const tmp = document.createElement("canvas");
  tmp.width = Math.ceil(bbox.width);
  tmp.height = Math.ceil(bbox.height);
  const ctx = tmp.getContext("2d");
  if (!ctx) throw new Error("مرورگر شما از Canvas پشتیبانی نمی‌کند");

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.translate(tmp.width / 2, tmp.height / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.drawImage(image, -image.naturalWidth / 2, -image.naturalHeight / 2);

  // pixelCrop is already in this rotated canvas space
  const sx = Math.min(
    Math.max(0, pixelCrop.x),
    Math.max(0, tmp.width - pixelCrop.width)
  );
  const sy = Math.min(
    Math.max(0, pixelCrop.y),
    Math.max(0, tmp.height - pixelCrop.height)
  );
  const sw = Math.min(pixelCrop.width, tmp.width - sx);
  const sh = Math.min(pixelCrop.height, tmp.height - sy);

  // downscale if the output would be huge
  let outW = Math.round(sw);
  let outH = Math.round(sh);
  const maxDim = Math.max(outW, outH);
  if (maxDim > MAX_OUTPUT_DIMENSION) {
    const k = MAX_OUTPUT_DIMENSION / maxDim;
    outW = Math.max(1, Math.round(outW * k));
    outH = Math.max(1, Math.round(outH * k));
  }

  const out = document.createElement("canvas");
  out.width = outW;
  out.height = outH;
  const octx = out.getContext("2d");
  if (!octx) throw new Error("مرورگر شما از Canvas پشتیبانی نمی‌کند");
  octx.imageSmoothingEnabled = true;
  octx.imageSmoothingQuality = "high";
  octx.drawImage(tmp, sx, sy, sw, sh, 0, 0, outW, outH);

  const blob = await new Promise<Blob>((resolve, reject) => {
    out.toBlob(
      (b) =>
        b
          ? resolve(b)
          : reject(new Error("ساخت تصویر کراپ‌شده ناموفق بود — تصویر ممکن است محافظت‌شده باشد")),
      mime,
      mime === "image/png" ? undefined : 0.92
    );
  });
  return {
    blob,
    fileName: `crop-${Date.now()}.${extForMime(mime)}`,
    state: {
      xPct: 0,
      yPct: 0,
      wPct: 0,
      hPct: 0,
      zoom: 1,
      rotation,
      aspect: null,
    },
  };
}

export default function ImageCropDialog({
  open,
  imageSrc,
  title = "کِراپ تصویر",
  defaultAspect,
  outputMime,
  initialState,
  onCancel,
  onConfirm,
}: ImageCropDialogProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [aspect, setAspect] = useState<number | null>(defaultAspect ?? null);
  const [pctArea, setPctArea] = useState<Area | null>(null);
  const [pixelArea, setPixelArea] = useState<Area | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // container size (for true "آزاد" mode + state restore)
  const [containerEl, setContainerEl] = useState<HTMLDivElement | null>(null);
  const [containerSize, setContainerSize] = useState<Size | null>(null);
  const [mediaSize, setMediaSize] = useState<MediaSize | null>(null);
  const restoredRef = useRef(false);

  useEffect(() => {
    if (open) {
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setRotation(0);
      setAspect(defaultAspect ?? null);
      setPctArea(null);
      setPixelArea(null);
      setError(null);
      setBusy(false);
      setMediaSize(null);
      restoredRef.current = false;
    }
  }, [open, defaultAspect]);

  // measure the cropper container (callback ref catches the portal mount,
  // ResizeObserver keeps it in sync afterwards)
  useEffect(() => {
    if (!containerEl || !open) return;
    const measure = () => {
      const r = containerEl.getBoundingClientRect();
      if (r.width && r.height) {
        setContainerSize({ width: r.width, height: r.height });
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(containerEl);
    return () => ro.disconnect();
  }, [containerEl, open]);

  const mime =
    outputMime === "image/png" || outputMime === "image/webp"
      ? outputMime
      : "image/jpeg";

  // restore a previously saved crop (non-destructive re-edit)
  useEffect(() => {
    if (!open || !initialState || restoredRef.current) return;
    if (!mediaSize || !containerSize) return;
    const cropSize = cropSizeFromContainer(
      mediaSize,
      containerSize,
      initialState.aspect ?? null,
      initialState.rotation ?? 0
    );
    const pct: Area = {
      x: initialState.xPct,
      y: initialState.yPct,
      width: initialState.wPct,
      height: initialState.hPct,
    };
    if (!pct.width || !pct.height) return;
    const { crop: restoredCrop, zoom: restoredZoom } =
      getInitialCropFromCroppedAreaPercentages(
        pct,
        mediaSize,
        initialState.rotation ?? 0,
        cropSize,
        MIN_ZOOM,
        MAX_ZOOM
      );
    restoredRef.current = true;
    setAspect(initialState.aspect ?? null);
    setRotation(initialState.rotation ?? 0);
    setZoom(restoredZoom);
    setCrop(restoredCrop);
  }, [open, initialState, mediaSize, containerSize]);

  function onCropComplete(pct: Area, pixels: Area) {
    setPctArea(pct);
    setPixelArea(pixels);
  }

  async function handleConfirm() {
    if (!imageSrc) return;
    if (!pixelArea) {
      setError("تصویر هنوز بارگذاری نشده — کمی صبر کنید و دوباره تلاش کنید");
      return;
    }
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const out = await cropImage(imageSrc, pixelArea, rotation, mime);
      out.state = {
        xPct: pctArea?.x ?? 0,
        yPct: pctArea?.y ?? 0,
        wPct: pctArea?.width ?? 100,
        hPct: pctArea?.height ?? 100,
        zoom,
        rotation,
        aspect,
      };
      await onConfirm(out);
    } catch (e) {
      setError(e instanceof Error ? e.message : "کِراپ ناموفق بود");
      setBusy(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v && !busy) onCancel();
      }}
    >
      <DialogContent
        className="sm:max-w-5xl flex flex-col overflow-hidden"
        dir="rtl"
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <p className="text-xs text-zinc-500 -mt-1">
            اصل تصویر در کتابخانه حفظ می‌شود و کراپ همیشه قابل ویرایش است — فرمت
            اصلی (png/webp/jpg) نیز حفظ می‌شود.
          </p>
        </DialogHeader>

        {/* cropper area — tall so the crop area feels open */}
        <div
          ref={setContainerEl}
          className="relative w-full h-[50vh] min-h-[380px] max-h-[620px] bg-zinc-900 rounded-xl overflow-hidden shrink-0"
        >
          {imageSrc ? (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              minZoom={MIN_ZOOM}
              maxZoom={MAX_ZOOM}
              aspect={aspect ?? undefined}
              cropSize={aspect === null ? (containerSize ?? undefined) : undefined}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onRotationChange={setRotation}
              onCropComplete={onCropComplete}
              onMediaLoaded={setMediaSize}
              showGrid
              zoomSpeed={0.6}
              objectFit="contain"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-zinc-500 text-sm">
              تصویری برای کِراپ وجود ندارد
            </div>
          )}
        </div>

        {/* controls */}
        <div className="space-y-3 pt-3">
          {/* aspect presets */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-zinc-500 font-bold ml-1">
              نسبت تصویر:
            </span>
            {ASPECT_PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => setAspect(p.value)}
                className={`px-2.5 py-1 text-[11px] rounded-md border transition-colors ${
                  aspect === p.value
                    ? "bg-blue-600 text-white border-blue-600 font-bold"
                    : "border-zinc-300 text-zinc-600 hover:border-blue-400"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* zoom */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-500 font-bold w-24 flex-shrink-0">
              زوم
            </span>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(MIN_ZOOM, +(z - 0.1).toFixed(2)))}
              className="px-2 py-1 text-xs rounded-md border border-zinc-300 text-zinc-600 hover:border-blue-400 hover:text-blue-700 transition-colors"
              aria-label="زوم اوت"
            >
              −
            </button>
            <input
              type="range"
              min={MIN_ZOOM}
              max={MAX_ZOOM}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="flex-1 accent-blue-600"
            />
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(MAX_ZOOM, +(z + 0.1).toFixed(2)))}
              className="px-2 py-1 text-xs rounded-md border border-zinc-300 text-zinc-600 hover:border-blue-400 hover:text-blue-700 transition-colors"
              aria-label="زوم این"
            >
              +
            </button>
            <span className="text-[11px] text-zinc-500 tabular-nums w-8 text-left">
              {zoom.toFixed(2)}
            </span>
          </div>

          {/* rotation */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-500 font-bold w-24 flex-shrink-0">
              چرخش
            </span>
            <button
              type="button"
              onClick={() => setRotation((r) => (r + 90) % 360)}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] rounded-md border border-zinc-300 text-zinc-600 hover:border-blue-400 hover:text-blue-700 transition-colors"
            >
              <RotateCw className="w-3 h-3" />
              ۹۰ درجه
            </button>
            <button
              type="button"
              onClick={() => setRotation((r) => (r + 270) % 360)}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] rounded-md border border-zinc-300 text-zinc-600 hover:border-blue-400 hover:text-blue-700 transition-colors"
            >
              <RotateCw className="w-3 h-3 rotate-180" />
              ۹۰- درجه
            </button>
            {rotation !== 0 && (
              <button
                type="button"
                onClick={() => setRotation(0)}
                className="px-2.5 py-1 text-[11px] rounded-md border border-zinc-300 text-zinc-500 hover:border-red-300 hover:text-red-600 transition-colors"
              >
                بازنشانی
              </button>
            )}
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 pt-1 bg-red-50 rounded-md px-2 py-1">
            {error}
          </p>
        )}

        {/* actions */}
        <div className="flex items-center justify-between pt-3 border-t border-zinc-100 mt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="px-4 py-2 text-sm text-zinc-600 hover:text-zinc-900 disabled:opacity-50"
          >
            انصراف
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={busy || !imageSrc}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white text-sm font-bold px-5 py-2 rounded-lg transition-colors"
          >
            {busy ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                در حال کِراپ...
              </>
            ) : (
              "اعمال کِراپ"
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}