import { Router, Request, Response } from "express";
import { AnalyticsService } from "../services/analytics.service.js";
import { logger } from "../logger.js";

const router = Router();
const analyticsService = new AnalyticsService();

/**
 * GET /api/v1/analytics/leaderboard
 *
 * Returns the top 10 streamers, top 10 receivers, and top 10 assets,
 * ranked by total streamed volume (in USD).
 *
 * Query Parameters:
 *  - timeframe: 'daily' | 'weekly' | 'all' (default: 'all')
 *
 * Response:
 * {
 *   success: true,
 *   data: {
 *     topStreamers: [{ address, totalVolumeUsd, streamCount }, ...],
 *     topReceivers:  [{ address, totalVolumeUsd, streamCount }, ...],
 *     topAssets:     [{ tokenAddress, totalVolumeUsd, streamCount }, ...]
 *   }
 * }
 */
router.get("/leaderboard", async (req: Request, res: Response) => {
  try {
    const timeframe = (req.query.timeframe as "daily" | "weekly" | "all") || "all";
    const data = await analyticsService.getLeaderboard(timeframe);
    res.json({ success: true, data });
  } catch (error) {
    logger.error("Failed to retrieve leaderboard", error);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve leaderboard data.",
    });
  }
});

export default router;
