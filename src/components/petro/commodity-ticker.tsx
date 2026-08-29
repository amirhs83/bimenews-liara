"use client";

import { useEffect, useRef, useState } from "react";
import { commodityPrices, CommodityPrice } from "@/lib/news-data";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";

const POLL_INTERVAL_MS = 15_000;

function toFaDigits(s: string | number): string {
  return String(s).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);
}

// Cache SVG fetches so we don't refetch on each render
const svgCache = new Map<string, string | null>();
// Subscribers for cache updates
const subscribers = new Map<string, Set<(svg: string | null) => void>>();

function subscribe(icon: string, cb: (svg: string | null) => void) {
  if (!subscribers.has(icon)) subscribers.set(icon, new Set());
  subscribers.get(icon)!.add(cb);
  return () => {
    subscribers.get(icon)?.delete(cb);
  };
}

function notify(icon: string, svg: string | null) {
  subscribers.get(icon)?.forEach((cb) => cb(svg));
}

function fetchIcon(icon: string) {
  if (svgCache.has(icon)) return;
  // Mark as in-flight with null (will be set when fetched)
  svgCache.set(icon, null);
  fetch(`/icons/commodities/${icon}.svg`)
    .then((r) => (r.ok ? r.text() : Promise.reject(r.status)))
    .then((text) => {
      svgCache.set(icon, text);
      notify(icon, text);
    })
    .catch(() => {
      svgCache.set(icon, "");
      notify(icon, "");
    });
}

function isIconUrl(icon: string): boolean {
  return /^(https?:)?\/\//i.test(icon) || icon.startsWith("/");
}

function CommodityIcon({ icon, alt }: { icon: string; alt: string }) {
  if (isIconUrl(icon)) {
    return (
      <img
        src={icon}
        alt={alt}
        className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg object-contain bg-white ring-1 ring-black/10 shadow-sm flex-shrink-0"
      />
    );
  }
  return <LocalSvgIcon icon={icon} alt={alt} />;
}

function LocalSvgIcon({ icon, alt }: { icon: string; alt: string }) {
  // Initial state from cache if available, else empty.
  // useState initializer is fine — runs only on mount, no cascading render.
  const [svg, setSvg] = useState<string>(() => svgCache.get(icon) ?? "");

  useEffect(() => {
    // Subscribe to icon updates — setState only fires from external notify()
    const unsub = subscribe(icon, (newSvg) => {
      if (newSvg) setSvg(newSvg);
    });
    // If the icon is already cached (e.g. after data swap/reorder), apply it
    // immediately — notify() only fires for future fetches, so without this
    // the instance would keep showing the previous item's logo.
    const cached = svgCache.get(icon);
    if (cached != null) setSvg(cached);
    else setSvg("");
    // If not yet in cache and not yet requested, trigger fetch.
    // Existing subscription will receive the result via notify().
    if (!svgCache.has(icon)) {
      fetchIcon(icon);
    }
    return unsub;
  }, [icon]);

  if (!svg) {
    // Fallback: colored circle
    return (
      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-zinc-100 flex items-center justify-center text-[11px] font-bold text-zinc-500">
        {alt.substring(0, 2).toUpperCase()}
      </div>
    );
  }

  // Strip fixed width/height attrs from <svg> so CSS sizing takes over,
  // then ensure the SVG fills its container while preserving aspect ratio.
  // The TradingView icons all have a 18x18 viewBox with a full-bleed colored background,
  // so uniform scaling (meet) keeps the icon centered and fully visible.
  let normalized = svg
    .replace(/\swidth=["'][^"']*["']/, "")
    .replace(/\sheight=["'][^"']*["']/, "");

  // Add viewBox if missing (some SVGs omit it but have width/height)
  if (!normalized.includes("viewBox")) {
    normalized = normalized.replace(
      /<svg\b/,
      '<svg viewBox="0 0 18 18"'
    );
  }

  // Inject sizing style + preserveAspectRatio
  normalized = normalized.replace(
    /<svg\b/,
    '<svg style="width:100%;height:100%;display:block;" preserveAspectRatio="xMidYMid meet"'
  );

  return (
    <div
      className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg overflow-hidden flex-shrink-0 ring-1 ring-black/10 shadow-sm"
      dangerouslySetInnerHTML={{ __html: normalized }}
      aria-label={alt}
      role="img"
    />
  );
}

export default function CommodityTicker() {
  const [prices, setPrices] = useState<CommodityPrice[]>(commodityPrices);
  const [dragging, setDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const halfRef = useRef(0);
  const draggingRef = useRef(false);
  const hoverRef = useRef(false);
  const lastXRef = useRef<number | null>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const ro = new ResizeObserver(() => {
      halfRef.current = track.scrollWidth / 2;
    });
    ro.observe(track);
    halfRef.current = track.scrollWidth / 2;

    let raf = 0;
    let last = performance.now();
    const tick = (t: number) => {
      const dt = Math.min(t - last, 100);
      last = t;
      const half = halfRef.current;
      if (half > 0) {
        if (!draggingRef.current && !hoverRef.current) {
          // same speed as the old CSS animation: one loop per 50s
          offsetRef.current += (half / 50000) * dt;
        }
        const x = ((offsetRef.current % half) + half) % half;
        track.style.transform = `translateX(${x}px)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    draggingRef.current = true;
    setDragging(true);
    lastXRef.current = e.clientX;
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current || lastXRef.current === null) return;
    offsetRef.current += e.clientX - lastXRef.current;
    lastXRef.current = e.clientX;
  };
  const onPointerEnd = () => {
    draggingRef.current = false;
    setDragging(false);
    lastXRef.current = null;
  };

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await fetch("/api/prices", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (active && Array.isArray(data?.prices) && data.prices.length > 0) {
          setPrices(data.prices);
        }
      } catch {
        // network error -> keep the last displayed data
      }
    };
    load();
    const t = setInterval(load, POLL_INTERVAL_MS);
    return () => {
      active = false;
      clearInterval(t);
    };
  }, []);

  const display = [...prices, ...prices];

  return (
    <div className="bg-white border-b border-zinc-200 overflow-hidden ticker-pause relative">
      {/* subtle gradient fade on edges */}
      <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>
      <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>

      <div className="max-w-[1440px] mx-auto px-4 lg:px-6">
        <div className="flex items-stretch">
          {/* Right label - sticky */}
          <div className="flex items-center gap-2 flex-shrink-0 pl-4 py-2.5 border-l border-zinc-200">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-zinc-900 to-petro-black flex items-center justify-center">
              <Activity className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="leading-tight">
              <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold flex items-center gap-1">
                <span className="live-dot"></span>
                بازار زنده
              </div>
              <div className="text-[9px] text-zinc-400">Real-time</div>
            </div>
          </div>

          {/* Scrolling prices */}
          <div
            className={`flex-1 overflow-hidden relative py-2.5 select-none ${
              dragging ? "cursor-grabbing" : "cursor-grab"
            }`}
            style={{ touchAction: "pan-y" }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerEnd}
            onPointerCancel={onPointerEnd}
            onPointerEnter={(e) => {
              if (e.pointerType === "mouse") hoverRef.current = true;
            }}
            onPointerLeave={(e) => {
              if (e.pointerType === "mouse") hoverRef.current = false;
            }}
          >
            <div
              ref={trackRef}
              className="flex gap-1 w-max items-center will-change-transform"
            >
              {display.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 whitespace-nowrap px-4 border-l border-zinc-100 first:border-l-0 group"
                >
                  {/* Real commodity icon */}
                  <CommodityIcon icon={item.icon} alt={item.name} />
                  <div className="leading-tight">
                    <div className="text-xs font-bold text-zinc-900 group-hover:text-blue-700 transition-colors">
                      {item.name}
                    </div>
                    <div className="text-[10px] text-zinc-500">{item.nameFa}</div>
                  </div>
                  <div className="leading-tight text-left">
                    <div className="text-sm font-bold text-zinc-900 tabular-nums">
                      {item.price}{" "}
                      <span className="text-[9px] font-normal text-zinc-500">ریال</span>
                    </div>
                    <div
                      className={`text-[11px] font-semibold tabular-nums flex items-center gap-0.5 ${
                        item.up ? "text-up" : "text-down"
                      }`}
                    >
                      {item.up ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      {item.changePercent}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Left: live time */}
          <div className="hidden md:flex items-center gap-2 flex-shrink-0 pr-4 py-2.5 border-r border-zinc-200">
            <div className="leading-tight text-left">
              <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">
                به‌روزرسانی
              </div>
              <div className="text-xs font-bold text-zinc-800 tabular-nums">
                {toFaDigits(new Date().toLocaleTimeString("fa-IR"))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
