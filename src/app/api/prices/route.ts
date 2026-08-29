import { NextResponse } from "next/server";
import { getPrices } from "@/lib/stock-prices";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const payload = await getPrices();
    return NextResponse.json(payload, {
      headers: {
        // CDN dedupes concurrent polls; freshness is enforced by the 15s TTL.
        "Cache-Control": "public, s-maxage=15, stale-while-revalidate=60",
      },
    });
  } catch (err) {
    console.error("[prices] unexpected error:", err);
    return NextResponse.json(
      {
        prices: [],
        stale: true,
        marketOpen: false,
        updatedAt: null,
        fetchedAt: new Date().toISOString(),
      },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
