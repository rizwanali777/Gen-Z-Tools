import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 20;

const PREFERRED = ["USD", "EUR", "GBP", "JPY", "CNY", "INR", "PKR", "AED", "SAR", "CAD", "AUD", "CHF"] as const;

type Cache = { at: number; body: CurrencyPayload };
type CurrencyPayload = { updated: string; rates: Record<string, number> };

let cache: Cache | null = null;
const TTL = 60 * 60 * 1000;

export async function GET() {
  if (cache && Date.now() - cache.at < TTL) {
    return NextResponse.json(cache.body, { headers: { "Cache-Control": "public, max-age=600" } });
  }

  try {
    const upstream = await fetch("https://open.er-api.com/v6/latest/USD", {
      signal: AbortSignal.timeout(12_000),
      headers: { Accept: "application/json" },
    });
    const payload = (await upstream.json()) as {
      result?: string;
      time_last_update_utc?: string;
      rates?: Record<string, number>;
    };
    if (!upstream.ok || payload.result !== "success" || !payload.rates) {
      throw new Error("Rate feed unavailable");
    }

    const rates: Record<string, number> = { USD: 1 };
    for (const code of PREFERRED) {
      const value = payload.rates[code];
      if (typeof value === "number" && Number.isFinite(value) && value > 0) rates[code] = value;
    }
    const body: CurrencyPayload = {
      updated: payload.time_last_update_utc || new Date().toUTCString(),
      rates,
    };
    cache = { at: Date.now(), body };
    return NextResponse.json(body, { headers: { "Cache-Control": "public, max-age=600" } });
  } catch {
    if (cache) return NextResponse.json(cache.body);
    return NextResponse.json({ error: "Live currency rates are unavailable right now." }, { status: 502 });
  }
}
