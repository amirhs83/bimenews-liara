"use client";

import { useEffect, useRef, useState } from "react";
import { changeCrop, fitCrop, type Rect, type Handle } from "./crop-geometry";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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


function rotateSize(width: number, height: number, rotation: number) {
  const rad = (rotation * Math.PI) / 180;
  return {
    width: Math.abs(Math.cos(rad) * width) + Math.abs(Math.sin(rad) * height),
    height: Math.abs(Math.sin(rad) * width) + Math.abs(Math.cos(rad) * height),
  };
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
 *  Crop coordinates refer to the rotated natural image, independently of zoom.
 *  The output keeps the SOURCE format (PNG stays PNG, WebP stays WebP, ...). */
async function cropImage(
  imageSrc: string,
  pixelCrop: Rect,
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
  let outW = Math.max(1, Math.round(sw));
  let outH = Math.max(1, Math.round(sh));
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
  open, imageSrc, title = "کِراپ تصویر", defaultAspect, outputMime, initialState, onCancel, onConfirm,
}: ImageCropDialogProps) {
  const [source, setSource] = useState<HTMLImageElement | null>(null);
  const [rotation, setRotation] = useState(0);
  const [aspect, setAspect] = useState<number | null>(null);
  const [area, setArea] = useState<Rect | null>(null);
  const [zoom, setZoom] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewport, setViewport] = useState<HTMLDivElement | null>(null);
  const [viewportWidth, setViewportWidth] = useState(300);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewRef = useRef<HTMLCanvasElement>(null);
  const drag = useRef<{ id: number; x: number; y: number; area: Rect; handle: Handle; scale: number } | null>(null);
  const busyRef = useRef(false);

  useEffect(() => {
    if (!open || !imageSrc) return;
    let cancelled = false;
    setSource(null); setArea(null); setError(null); setBusy(false); busyRef.current = false;
    setZoom(1);
    loadImage(imageSrc).then(image => {
      if (cancelled) return;
      const angle = initialState?.rotation ?? 0;
      const ratio = initialState ? initialState.aspect : defaultAspect ?? null;
      const bounds = rotateSize(image.naturalWidth, image.naturalHeight, angle);
      let rect = fitCrop(bounds, ratio);
      if (initialState && initialState.wPct > 0 && initialState.hPct > 0) {
        const x = Math.max(0, Math.min(99.99, initialState.xPct)) * bounds.width / 100;
        const y = Math.max(0, Math.min(99.99, initialState.yPct)) * bounds.height / 100;
        rect = { x, y,
          width: Math.min(bounds.width - x, initialState.wPct * bounds.width / 100),
          height: Math.min(bounds.height - y, initialState.hPct * bounds.height / 100) };
      }
      setRotation(angle); setAspect(ratio); setArea(rect); setSource(image);
    }).catch(e => { if (!cancelled) setError(e.message); });
    return () => { cancelled = true; };
  }, [open, imageSrc, initialState, defaultAspect]);

  useEffect(() => {
    if (!viewport) return;
    const measure = () => setViewportWidth(Math.max(1, viewport.clientWidth - 32));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [viewport]);

  const bounds = source ? rotateSize(source.naturalWidth, source.naturalHeight, rotation) : { width: 1, height: 1 };
  const scale = Math.min(viewportWidth / bounds.width, 340 / bounds.height, 1) * zoom;
  const shownWidth = bounds.width * scale, shownHeight = bounds.height * scale;
  const outputScale = area ? Math.min(1, MAX_OUTPUT_DIMENSION / Math.max(area.width, area.height)) : 1;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !source) return;
    canvas.width = Math.max(1, Math.round(shownWidth));
    canvas.height = Math.max(1, Math.round(shownHeight));
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(canvas.width / bounds.width, canvas.height / bounds.height);
    ctx.rotate(rotation * Math.PI / 180);
    ctx.drawImage(source, -source.naturalWidth / 2, -source.naturalHeight / 2);
  }, [source, rotation, shownWidth, shownHeight, bounds.width, bounds.height]);

  useEffect(() => {
    const canvas = previewRef.current;
    if (!canvas || !source || !area) return;
    const ratio = Math.min(240 / area.width, 100 / area.height, 1);
    canvas.width = Math.max(1, Math.round(area.width * ratio));
    canvas.height = Math.max(1, Math.round(area.height * ratio));
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(canvas.width / area.width, canvas.height / area.height);
    ctx.translate(bounds.width / 2 - area.x, bounds.height / 2 - area.y);
    ctx.rotate(rotation * Math.PI / 180);
    ctx.drawImage(source, -source.naturalWidth / 2, -source.naturalHeight / 2);
  }, [source, area, rotation, bounds.width, bounds.height]);

  function startDrag(e: React.PointerEvent<HTMLDivElement>, handle: Handle) {
    if (busy || !area || e.button !== 0) return;
    e.preventDefault(); e.stopPropagation();
    e.currentTarget.focus();
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, area, handle, scale };
  }
  function moveDrag(e: React.PointerEvent<HTMLDivElement>) {
    const current = drag.current;
    if (!current || current.id !== e.pointerId || busy) return;
    setArea(changeCrop(current.area, current.handle, (e.clientX - current.x) / current.scale,
      (e.clientY - current.y) / current.scale, bounds, aspect));
  }
  function keyboard(e: React.KeyboardEvent<HTMLDivElement>, handle: Handle) {
    if (!area || busy || !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) return;
    e.preventDefault(); e.stopPropagation();
    const step = (e.shiftKey ? 10 : 1) / scale;
    setArea(changeCrop(area, handle, e.key === "ArrowLeft" ? -step : e.key === "ArrowRight" ? step : 0,
      e.key === "ArrowUp" ? -step : e.key === "ArrowDown" ? step : 0, bounds, aspect));
  }
  function reset(angle = 0, ratio: number | null = null) {
    if (!source || busy) return;
    setRotation(angle); setAspect(ratio); setZoom(1);
    setArea(fitCrop(rotateSize(source.naturalWidth, source.naturalHeight, angle), ratio));
  }
  async function handleConfirm() {
    if (!imageSrc || !area || busyRef.current) return;
    busyRef.current = true; setBusy(true); setError(null);
    try {
      const mime = outputMime === "image/png" || outputMime === "image/webp" ? outputMime : "image/jpeg";
      const out = await cropImage(imageSrc, area, rotation, mime);
      out.state = { xPct: area.x / bounds.width * 100, yPct: area.y / bounds.height * 100,
        wPct: area.width / bounds.width * 100, hPct: area.height / bounds.height * 100,
        zoom, rotation, aspect };
      await onConfirm(out);
    } catch (e) {
      setError(e instanceof Error ? e.message : "کِراپ ناموفق بود");
    } finally { busyRef.current = false; setBusy(false); }
  }
  const handles: { handle: Handle; label: string; left: string; top: string; cursor: string }[] = [
    { handle: "nw", label: "بالا چپ", left: "0%", top: "0%", cursor: "nwse-resize" },
    { handle: "n", label: "بالا", left: "50%", top: "0%", cursor: "ns-resize" },
    { handle: "ne", label: "بالا راست", left: "100%", top: "0%", cursor: "nesw-resize" },
    { handle: "e", label: "راست", left: "100%", top: "50%", cursor: "ew-resize" },
    { handle: "se", label: "پایین راست", left: "100%", top: "100%", cursor: "nwse-resize" },
    { handle: "s", label: "پایین", left: "50%", top: "100%", cursor: "ns-resize" },
    { handle: "sw", label: "پایین چپ", left: "0%", top: "100%", cursor: "nesw-resize" },
    { handle: "w", label: "چپ", left: "0%", top: "50%", cursor: "ew-resize" },
  ];
  return (
    <Dialog open={open} onOpenChange={v => { if (!v && !busyRef.current) onCancel(); }}>
      <DialogContent dir="rtl" showCloseButton={!busy}
        className="sm:max-w-5xl max-h-[92dvh] overflow-y-auto flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <p className="text-xs text-zinc-500">لبه‌ها یا گوشه‌های کادر را بکشید؛ برای جابه‌جایی، داخل کادر را بکشید. کلیدهای جهت‌دار نیز فعال‌اند.</p>
        </DialogHeader>
        <div ref={setViewport} dir="ltr" className="overflow-auto bg-zinc-900 rounded-xl max-h-[45dvh] min-h-40 shrink-0">
          {source && area ? (
            <div style={{ width: Math.max(shownWidth + 32, viewportWidth + 32), padding: 16 }}>
              <div className="relative mx-auto" style={{ width: shownWidth, height: shownHeight }}>
                <canvas ref={canvasRef} className="block" style={{ width: shownWidth, height: shownHeight }} />
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div style={{ position: "absolute", left: area.x * scale, top: area.y * scale,
                    width: area.width * scale, height: area.height * scale, boxShadow: "0 0 0 9999px #0009" }} />
                </div>
                <div role="group" aria-label="جابه‌جایی کادر کراپ" tabIndex={busy ? -1 : 0}
                  onPointerDown={e => startDrag(e, "move")} onPointerMove={moveDrag}
                  onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }}
                  onLostPointerCapture={() => { drag.current = null; }} onKeyDown={e => keyboard(e, "move")}
                  className="absolute border-2 border-white touch-none cursor-move focus:outline-2 focus:outline-blue-400"
                  style={{ left: area.x * scale, top: area.y * scale, width: area.width * scale, height: area.height * scale }}>
                  <div className="absolute inset-x-0 top-1/3 h-1/3 border-y border-white/40 pointer-events-none" />
                  <div className="absolute inset-y-0 left-1/3 w-1/3 border-x border-white/40 pointer-events-none" />
                  {handles.map(h => (
                    <div key={h.handle} role="button" aria-label={`تغییر اندازه از ${h.label}`} tabIndex={busy ? -1 : 0}
                      onPointerDown={e => startDrag(e, h.handle)} onKeyDown={e => keyboard(e, h.handle)}
                      className="absolute flex items-center justify-center w-7 h-7 touch-none focus:outline-2 focus:outline-blue-400"
                      style={{ left: h.left, top: h.top, transform: "translate(-50%, -50%)", cursor: h.cursor }}>
                      <span className="w-2.5 h-2.5 bg-white border border-blue-600 rounded-sm pointer-events-none" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : <p className="p-8 text-center text-white text-sm">در حال بارگذاری تصویر…</p>}
        </div>
        <fieldset disabled={busy || !source} className="space-y-3 disabled:opacity-60">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs">نسبت تصویر:</span>
            {ASPECT_PRESETS.map(p => <button type="button" key={p.label} aria-pressed={aspect === p.value}
              onClick={() => { setAspect(p.value); if (p.value) setArea(fitCrop(bounds, p.value)); }}
              className={`border rounded px-2 py-1 text-xs ${aspect === p.value ? "bg-blue-600 text-white border-blue-600" : "border-zinc-300"}`}>{p.label}</button>)}
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <label className="flex items-center gap-2">بزرگ‌نمایی
              <input aria-label="بزرگ‌نمایی" dir="ltr" type="range" min="1" max="3" step="0.05" value={zoom}
                onChange={e => setZoom(Number(e.target.value))} className="w-28 accent-blue-600" />
            </label>
            <button type="button" className="border rounded px-2 py-1" onClick={() => reset((rotation + 90) % 360, aspect)}>چرخش ۹۰ درجه</button>
            <button type="button" className="border rounded px-2 py-1" onClick={() => reset()}>بازنشانی کامل</button>
          </div>
        </fieldset>
        {area && <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-600">
          <canvas ref={previewRef} aria-label="پیش‌نمایش خروجی کراپ" className="max-w-60 border rounded" />
          <div><p>پیش‌نمایش خروجی: <b dir="ltr">{Math.max(1, Math.round(area.width * outputScale))} × {Math.max(1, Math.round(area.height * outputScale))}</b> پیکسل</p>
            <p className="mt-2">نسخهٔ اصلی حفظ می‌شود. پس از اعمال کراپ، پست را هم ذخیره کنید.</p></div>
        </div>}
        {error && <p role="alert" className="text-sm text-red-600 bg-red-50 rounded p-2">{error}</p>}
        <div className="flex items-center justify-between border-t pt-3">
          <button type="button" onClick={onCancel} disabled={busy} className="px-4 py-2 text-sm disabled:opacity-50">انصراف</button>
          <button type="button" onClick={handleConfirm} disabled={busy || !source || !area}
            className="bg-blue-600 text-white rounded-lg px-5 py-2 text-sm disabled:opacity-50">
            {busy ? "در حال آماده‌سازی و آپلود…" : "اعمال کراپ و انتخاب تصویر"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
