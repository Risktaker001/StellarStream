import { prisma } from "../lib/db.js";
import { logger } from "../logger.js";

export type YieldInterval = "day" | "week" | "month";

export interface YieldDataPoint {
  timestamp: string;
  apy: string;       // annualised percentage, 2 d.p.
  tvl: string;       // total streamed amount (stroops) as string
  streamCount: number;
}

export interface YieldSeries {
  asset: string;           // human-readable label ("XLM", "yXLM", …)
  tokenAddress: string | null;
  data: YieldDataPoint[];
}

export interface YieldComparisonResult {
  period: { start: string; end: string };
  interval: YieldInterval;
  series: YieldSeries[];
}

export interface YieldComparisonParams {
  startDate: Date;
  endDate: Date;
  interval: YieldInterval;
  assets?: string[]; // token addresses to include; empty = all
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Truncate a Date to the start of its bucket (UTC). */
function truncateToBucket(date: Date, interval: YieldInterval): Date {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  if (interval === "week") {
    d.setUTCDate(d.getUTCDate() - d.getUTCDay()); // back to Sunday
  } else if (interval === "month") {
    d.setUTCDate(1);
  }
  return d;
}

/**
 * APY derived from average stream duration.
 *
 * If a sender streams their full balance over D seconds, the implied
 * annualised yield rate is: APY (%) = (seconds_per_year / D) × 100
 */
function calculateApy(avgDurationSeconds: number): string {
  if (avgDurationSeconds <= 0) return "0.00";
  const SECONDS_PER_YEAR = 365.25 * 24 * 3600;
  return ((SECONDS_PER_YEAR / avgDurationSeconds) * 100).toFixed(2);
}

/** Short human-readable label for a token address. */
function assetLabel(tokenAddress: string | null): string {
  if (!tokenAddress) return "XLM";
  // Stellar token addresses are 56-char public keys — show a prefix
  return tokenAddress.length > 12
    ? tokenAddress.slice(0, 6) + "…" + tokenAddress.slice(-4)
    : tokenAddress;
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export class YieldAnalyticsService {
  /**
   * Build a time-series of APY and TVL for each asset (tokenAddress) found in
   * EventLog `create` events within [startDate, endDate], bucketed by interval.
   */
  async getYieldComparison(
    params: YieldComparisonParams
  ): Promise<YieldComparisonResult> {
    const { startDate, endDate, interval, assets } = params;

    // 1. Fetch all "create" events in the requested window
    const events = await prisma.eventLog.findMany({
      where: {
        eventType: "create",
        createdAt: { gte: startDate, lte: endDate },
      },
      orderBy: { createdAt: "asc" },
    });

    logger.debug("Yield analytics: fetched create events", {
      count: events.length,
      startDate,
      endDate,
    });

    if (events.length === 0) {
      return {
        period: { start: startDate.toISOString(), end: endDate.toISOString() },
        interval,
        series: [],
      };
    }

    // 2. Fetch matching Stream rows to get tokenAddress + duration
    const streamIds = [
      ...new Set(events.map((e) => e.streamId).filter(Boolean)),
    ] as string[];

    const streams = await prisma.stream.findMany({
      where: { streamId: { in: streamIds } },
      select: { streamId: true, tokenAddress: true, duration: true },
    });

    const streamMap = new Map(
      streams.map((s) => [s.streamId as string, s])
    );

    // 3. Aggregate into (bucket × tokenAddress) cells
    type BucketKey = string; // `${isoDate}|${tokenAddress ?? ""}`
    const buckets = new Map<
      BucketKey,
      {
        bucketDate: Date;
        tokenAddress: string | null;
        totalTvl: bigint;
        totalDuration: number;
        durationCount: number;
        streamCount: number;
      }
    >();

    for (const event of events) {
      const stream = event.streamId ? streamMap.get(event.streamId) : null;
      const tokenAddress = stream?.tokenAddress ?? null;

      // Optional asset filter
      if (assets && assets.length > 0) {
        if (!assets.includes(tokenAddress ?? "")) continue;
      }

      const bucket = truncateToBucket(event.createdAt, interval);
      const key: BucketKey = `${bucket.toISOString()}|${tokenAddress ?? ""}`;

      const amount = event.amount ?? 0n;
      const duration = stream?.duration ?? 0;

      const existing = buckets.get(key);
      if (existing) {
        existing.totalTvl += amount;
        if (duration > 0) {
          existing.totalDuration += duration;
          existing.durationCount++;
        }
        existing.streamCount++;
      } else {
        buckets.set(key, {
          bucketDate: bucket,
          tokenAddress,
          totalTvl: amount,
          totalDuration: duration > 0 ? duration : 0,
          durationCount: duration > 0 ? 1 : 0,
          streamCount: 1,
        });
      }
    }

    // 4. Convert to YieldSeries grouped by tokenAddress
    const seriesMap = new Map<string | null, YieldDataPoint[]>();

    for (const entry of buckets.values()) {
      const {
        tokenAddress,
        bucketDate,
        totalTvl,
        totalDuration,
        durationCount,
        streamCount,
      } = entry;

      const avgDuration =
        durationCount > 0 ? totalDuration / durationCount : 0;

      const point: YieldDataPoint = {
        timestamp: bucketDate.toISOString(),
        apy: calculateApy(avgDuration),
        tvl: totalTvl.toString(),
        streamCount,
      };

      const existing = seriesMap.get(tokenAddress);
      if (existing) {
        existing.push(point);
      } else {
        seriesMap.set(tokenAddress, [point]);
      }
    }

    // 5. Sort each series by timestamp ascending and build final response
    const series: YieldSeries[] = [];
    for (const [tokenAddress, data] of seriesMap.entries()) {
      data.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
      series.push({
        asset: assetLabel(tokenAddress),
        tokenAddress,
        data,
      });
    }

    return {
      period: { start: startDate.toISOString(), end: endDate.toISOString() },
      interval,
      series,
    };
  }
}
