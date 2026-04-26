import { Router, Request, Response } from "express";
import {
  YieldAnalyticsService,
  YieldInterval,
} from "../services/yield-analytics.service.js";
import { logger } from "../logger.js";

const router = Router();
const yieldService = new YieldAnalyticsService();

const VALID_INTERVALS: YieldInterval[] = ["day", "week", "month"];
const DEFAULT_DAYS_BACK = 30;

/**
 * GET /api/v1/yield/comparison
 *
 * Returns historical APY and TVL time-series data per asset, suitable for
 * "Yield Projection" charts (e.g. yXLM vs XLM strategy comparison).
 *
 * Query params:
 *   startDate  ISO 8601 date string  (default: 30 days ago)
 *   endDate    ISO 8601 date string  (default: now)
 *   interval   day | week | month    (default: day)
 *   assets     Comma-separated token addresses to include (default: all)
 *
 * Response:
 *   {
 *     success: true,
 *     period: { start, end },
 *     interval: "day",
 *     series: [
 *       {
 *         asset: "XLM",
 *         tokenAddress: null,
 *         data: [{ timestamp, apy, tvl, streamCount }, ...]
 *       }
 *     ]
 *   }
 */
router.get("/comparison", async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, interval, assets } = req.query;

    const now = new Date();
    const parsedEnd = endDate ? new Date(endDate as string) : now;
    const parsedStart = startDate
      ? new Date(startDate as string)
      : new Date(now.getTime() - DEFAULT_DAYS_BACK * 24 * 3600 * 1000);

    if (isNaN(parsedStart.getTime()) || isNaN(parsedEnd.getTime())) {
      res.status(400).json({
        success: false,
        error: "Invalid date format. Use ISO 8601 (e.g. 2024-01-01T00:00:00Z).",
      });
      return;
    }

    if (parsedStart >= parsedEnd) {
      res.status(400).json({
        success: false,
        error: "startDate must be before endDate.",
      });
      return;
    }

    const parsedInterval: YieldInterval = VALID_INTERVALS.includes(
      interval as YieldInterval
    )
      ? (interval as YieldInterval)
      : "day";

    const parsedAssets =
      assets
        ? (assets as string)
            .split(",")
            .map((a) => a.trim())
            .filter(Boolean)
        : [];

    const result = await yieldService.getYieldComparison({
      startDate: parsedStart,
      endDate: parsedEnd,
      interval: parsedInterval,
      assets: parsedAssets,
    });

    res.json({ success: true, ...result });
  } catch (error) {
    logger.error("Failed to retrieve yield comparison", error);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve yield comparison data.",
    });
  }
});

export default router;
