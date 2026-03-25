import { prisma } from "../lib/db.js";
import { logger } from "../logger.js";

export interface LeaderboardEntry {
  address: string;
  totalVolumeUsd: string;
  streamCount: number;
}

export interface AssetLeaderboardEntry {
  tokenAddress: string;
  totalVolumeUsd: string;
  streamCount: number;
}

export interface LeaderboardResult {
  topStreamers: LeaderboardEntry[];
  topReceivers: LeaderboardEntry[];
  topAssets: AssetLeaderboardEntry[];
}

export class AnalyticsService {
  /**
   * Aggregate total streamed volume (in USD) per sender, receiver, and asset.
   * Filters out private streams.
   * Supports 'daily', 'weekly', and 'all' (default) timeframes.
   */
  async getLeaderboard(timeframe: "daily" | "weekly" | "all" = "all"): Promise<LeaderboardResult> {
    try {
      let startDate = new Date(0);
      if (timeframe === "daily") {
        startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
      } else if (timeframe === "weekly") {
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      }

      const [streamers, receivers, assets] = await Promise.all([
        prisma.$queryRaw<{ address: string; total_volume_usd: string; stream_count: bigint }[]>`
          SELECT
            s.sender AS address,
            COALESCE(SUM((s.amount::NUMERIC / POWER(10, COALESCE(tp.decimals, 7))) * COALESCE(tp."priceUsd", 0)), 0)::TEXT AS total_volume_usd,
            COUNT(*) AS stream_count
          FROM "Stream" s
          LEFT JOIN "TokenPrice" tp ON s."tokenAddress" = tp."tokenAddress"
          WHERE s."isPrivate" = false
            AND s."createdAt" >= ${startDate}
          GROUP BY s.sender
          ORDER BY COALESCE(SUM((s.amount::NUMERIC / POWER(10, COALESCE(tp.decimals, 7))) * COALESCE(tp."priceUsd", 0)), 0) DESC
          LIMIT 10
        `,
        prisma.$queryRaw<{ address: string; total_volume_usd: string; stream_count: bigint }[]>`
          SELECT
            s.receiver AS address,
            COALESCE(SUM((s.amount::NUMERIC / POWER(10, COALESCE(tp.decimals, 7))) * COALESCE(tp."priceUsd", 0)), 0)::TEXT AS total_volume_usd,
            COUNT(*) AS stream_count
          FROM "Stream" s
          LEFT JOIN "TokenPrice" tp ON s."tokenAddress" = tp."tokenAddress"
          WHERE s."isPrivate" = false
            AND s."createdAt" >= ${startDate}
          GROUP BY s.receiver
          ORDER BY COALESCE(SUM((s.amount::NUMERIC / POWER(10, COALESCE(tp.decimals, 7))) * COALESCE(tp."priceUsd", 0)), 0) DESC
          LIMIT 10
        `,
        prisma.$queryRaw<{ address: string; total_volume_usd: string; stream_count: bigint }[]>`
          SELECT
            COALESCE(s."tokenAddress", 'native') AS address,
            COALESCE(SUM((s.amount::NUMERIC / POWER(10, COALESCE(tp.decimals, 7))) * COALESCE(tp."priceUsd", 0)), 0)::TEXT AS total_volume_usd,
            COUNT(*) AS stream_count
          FROM "Stream" s
          LEFT JOIN "TokenPrice" tp ON s."tokenAddress" = tp."tokenAddress"
          WHERE s."isPrivate" = false
            AND s."createdAt" >= ${startDate}
          GROUP BY COALESCE(s."tokenAddress", 'native')
          ORDER BY COALESCE(SUM((s.amount::NUMERIC / POWER(10, COALESCE(tp.decimals, 7))) * COALESCE(tp."priceUsd", 0)), 0) DESC
          LIMIT 10
        `,
      ]);

      const mapEntry = (row: { address: string; total_volume_usd: string; stream_count: bigint }): LeaderboardEntry => ({
        address: row.address,
        totalVolumeUsd: String(row.total_volume_usd),
        streamCount: Number(row.stream_count),
      });

      const mapAssetEntry = (row: { address: string; total_volume_usd: string; stream_count: bigint }): AssetLeaderboardEntry => ({
        tokenAddress: row.address,
        totalVolumeUsd: String(row.total_volume_usd),
        streamCount: Number(row.stream_count),
      });

      return {
        topStreamers: streamers.map(mapEntry),
        topReceivers: receivers.map(mapEntry),
        topAssets: assets.map(mapAssetEntry),
      };
    } catch (error) {
      logger.error("Failed to compute leaderboard", error);
      throw error;
    }
  }
}
