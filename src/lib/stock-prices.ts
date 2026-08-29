import type { CommodityPrice } from "@/lib/news-data";
import symbolsJson from "@/data/symbols.json";

const UPSTREAM_URL = "https://tsetmc-api-server-1.onrender.com/watchlist";
const UPSTREAM_TIMEOUT_MS = 5_000;
const CACHE_TTL_MS = 15_000;
const MARKET_OPEN_MINUTES = 9 * 60;
const MARKET_CLOSE_MINUTES = 12 * 60;

export interface SymbolConfig {
  symbol: string;
  fullName: string;
  logo: string;
}

export interface PricesPayload {
  prices: CommodityPrice[];
  stale: boolean;
  marketOpen: boolean;
  updatedAt: string | null;
  fetchedAt: string;
}

interface UpstreamItem {
  symbol: string;
  symbol_id: string;
  short_name: string;
  full_name: string;
  last: number;
  close: number;
  yesterday: number;
  change_last: number;
  change_close: number;
  change_last_percent: number;
  change_close_percent: number;
  open: number;
  high: number;
  low: number;
  count: number;
  volume: number;
  value: number;
}

interface UpstreamResponse {
  updated_at: string | null;
  source_count: number;
  matched_count: number;
  items: UpstreamItem[];
  missing_symbols: string[];
  last_error: string | null;
}

const symbolConfigs: SymbolConfig[] = (symbolsJson as SymbolConfig[]).filter(
  (s) =>
    s &&
    typeof s.symbol === "string" &&
    typeof s.fullName === "string" &&
    s.symbol.trim() !== "" &&
    s.fullName.trim() !== ""
);

export function normalizeFa(input: string): string {
  return (
    input
      .replace(/[\u064A\u0649]/g, "\u06CC")
      .replace(/\u0643/g, "\u06A9")
      .replace(/\u0629/g, "\u0647")
      .replace(/[\u0622\u0623\u0625\u0671]/g, "\u0627")
      .replace(/[\u200C\u200D\u200E\u200F\u2060\uFEFF]/g, "")
      .replace(/[\u064B-\u065F\u0670]/g, "")
      // dashes/separators -> space, then collapse all whitespace
      .replace(/[-\u2010-\u2015\u2212]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  );
}

export function tehranMinutes(date: Date = new Date()): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Tehran",
    hourCycle: "h23",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === type)?.value ?? "0");
  return get("hour") * 60 + get("minute");
}

export function isMarketOpen(date: Date = new Date()): boolean {
  if (process.env.STOCK_PRICES_FORCE_OPEN === "1") return true;
  const minutes = tehranMinutes(date);
  return minutes >= MARKET_OPEN_MINUTES && minutes < MARKET_CLOSE_MINUTES;
}

async function fetchUpstream(): Promise<UpstreamResponse> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);
  try {
    const res = await fetch(UPSTREAM_URL, {
      signal: controller.signal,
      cache: "no-store",
      headers: { accept: "application/json" },
    });
    if (!res.ok) throw new Error(`upstream HTTP ${res.status}`);
    return (await res.json()) as UpstreamResponse;
  } finally {
    clearTimeout(timer);
  }
}

function signed(value: number, suffix = ""): string {
  return (value >= 0 ? "+" : "") + value.toFixed(2) + suffix;
}

export function buildPrices(
  items: UpstreamItem[],
  configs: SymbolConfig[] = symbolConfigs
): CommodityPrice[] {
  const byFullName = new Map<string, UpstreamItem>();
  const bySymbol = new Map<string, UpstreamItem>();
  for (const item of items) {
    if (!item) continue;
    if (typeof item.full_name === "string") {
      byFullName.set(normalizeFa(item.full_name), item);
    }
    if (typeof item.symbol === "string") {
      bySymbol.set(normalizeFa(item.symbol), item);
    }
    if (typeof item.short_name === "string") {
      bySymbol.set(normalizeFa(item.short_name), item);
    }
  }

  const prices: CommodityPrice[] = [];
  for (const cfg of configs) {
    const item =
      byFullName.get(normalizeFa(cfg.fullName)) ??
      bySymbol.get(normalizeFa(cfg.symbol));
    if (!item || typeof item.close !== "number") {
      console.warn(`[prices] no upstream match for "${cfg.fullName}"`);
      continue;
    }
    const change =
      typeof item.change_close === "number"
        ? item.change_close
        : item.close - (item.yesterday ?? item.close);
    const percent =
      typeof item.change_close_percent === "number"
        ? item.change_close_percent
        : item.yesterday
          ? (change / item.yesterday) * 100
          : 0;
    prices.push({
      symbol: cfg.symbol,
      name: cfg.symbol,
      nameFa: cfg.fullName,
      price: String(item.close),
      change: signed(change),
      changePercent: signed(percent, "%"),
      up: change >= 0,
      icon: cfg.logo,
    });
  }
  return prices;
}

let cache: { payload: PricesPayload; at: number } | null = null;
let lastSeedFailureAt = 0;
const SEED_RETRY_BACKOFF_MS = 5 * 60_000;

function emptyPayload(marketOpen: boolean): PricesPayload {
  return {
    prices: [],
    stale: true,
    marketOpen,
    updatedAt: null,
    fetchedAt: new Date().toISOString(),
  };
}

async function fetchFromUpstream(
  now: number,
  marketOpen: boolean,
  stale: boolean
): Promise<PricesPayload | null> {
  try {
    const upstream = await fetchUpstream();
    const prices = buildPrices(upstream.items ?? []);
    if (prices.length === 0) {
      // Upstream answered but had no usable data (e.g. cold start, source not loaded yet).
      throw new Error("upstream returned no matchable items");
    }
    const payload: PricesPayload = {
      prices,
      stale,
      marketOpen,
      updatedAt: upstream.updated_at ?? null,
      fetchedAt: new Date(now).toISOString(),
    };
    cache = { payload, at: now };
    return payload;
  } catch (err) {
    console.warn(
      "[prices] upstream fetch failed:",
      err instanceof Error ? err.message : err
    );
    return null;
  }
}

export async function getPrices(): Promise<PricesPayload> {
  const now = Date.now();
  const marketOpen = isMarketOpen(new Date(now));

  if (cache && now - cache.at < CACHE_TTL_MS) {
    return { ...cache.payload, marketOpen };
  }

  // Outside 09:00-12:00 Tehran: never poll upstream, serve last known data.
  if (!marketOpen) {
    if (cache) return { ...cache.payload, stale: true, marketOpen };
    // Nothing cached since deploy/cold start: fetch ONCE so the ticker can show
    // the latest closing prices, then keep serving it without re-hitting upstream.
    if (now - lastSeedFailureAt >= SEED_RETRY_BACKOFF_MS) {
      const seeded = await fetchFromUpstream(now, marketOpen, true);
      if (seeded) return seeded;
      lastSeedFailureAt = now;
    }
    return emptyPayload(marketOpen);
  }

  const fresh = await fetchFromUpstream(now, marketOpen, false);
  if (fresh) return fresh;
  return cache ? { ...cache.payload, stale: true, marketOpen } : emptyPayload(marketOpen);
}
