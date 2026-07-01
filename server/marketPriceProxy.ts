import type { ServerResponse } from "node:http";
import type { Connect } from "vite";

const CURRENT_GOLD_PRICE_PATH = "/api/current-gold-price";
const DEFAULT_MARKET_API_BASE_URL = "http://154.219.120.25:8318";
const DEFAULT_MARKET_API_TOKEN = "change-me-local-token";

interface MarketSnapshot {
  price?: {
    display_value?: number;
    display_unit?: string;
    requested_source?: string;
    source?: string;
    timestamp?: string;
    unit?: string;
    value?: number;
  };
}

function sendJson(
  res: ServerResponse,
  statusCode: number,
  payload: unknown
): void {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

function normalizeCurrentGoldPrice(snapshot: MarketSnapshot):
  | {
      price: number;
      unit: string;
      source: string;
      timestamp: string;
    }
  | null {
  const price = snapshot.price ?? {};
  const value = price.display_value ?? price.value;
  const unit = price.display_unit ?? price.unit ?? "CNY/g";

  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    return null;
  }

  return {
    price: value,
    unit,
    source: price.source ?? price.requested_source ?? "未知来源",
    timestamp: price.timestamp ?? ""
  };
}

export async function fetchMarketSnapshot(): Promise<MarketSnapshot> {
  const apiBaseUrl =
    process.env.GOLD_ANALYSIS_API_BASE_URL ?? DEFAULT_MARKET_API_BASE_URL;
  const apiToken =
    process.env.GOLD_ANALYSIS_API_TOKEN ?? DEFAULT_MARKET_API_TOKEN;
  const source = process.env.GOLD_ANALYSIS_PRICE_SOURCE ?? "";
  const url = new URL("/api/market/snapshot", apiBaseUrl);

  if (source) {
    url.searchParams.set("source", source);
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${apiToken}`
    }
  });

  if (!response.ok) {
    throw new Error(`Market snapshot request failed: ${response.status}`);
  }

  return (await response.json()) as MarketSnapshot;
}

export function createMarketPriceMiddleware(
  marketSnapshotFetcher = fetchMarketSnapshot
): Connect.NextHandleFunction {
  return async (req, res, next) => {
    if (!req.url?.startsWith(CURRENT_GOLD_PRICE_PATH)) {
      next();
      return;
    }

    if (req.method !== "GET") {
      sendJson(res, 405, { message: "Method not allowed" });
      return;
    }

    try {
      const currentGoldPrice = normalizeCurrentGoldPrice(
        await marketSnapshotFetcher()
      );

      if (!currentGoldPrice) {
        sendJson(res, 502, { message: "Invalid market price data" });
        return;
      }

      sendJson(res, 200, currentGoldPrice);
    } catch {
      sendJson(res, 502, { message: "Market price fetch failed" });
    }
  };
}
