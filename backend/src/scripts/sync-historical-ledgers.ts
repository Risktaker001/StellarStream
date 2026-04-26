#!/usr/bin/env node

import { historicalSyncService } from "../services/historical-sync.service.js";
import { logger } from "../logger.js";

/**
 * CLI script for historical ledger synchronization
 * Usage: npm run sync -- --from=LEDGER_START --to=LEDGER_END [--horizon]
 */

async function main() {
  const args = process.argv.slice(2);
  const fromMatch = args.find((a) => a.startsWith("--from="));
  const toMatch = args.find((a) => a.startsWith("--to="));
  const useHorizon = args.includes("--horizon");

  if (!fromMatch || !toMatch) {
    console.error("Usage: npm run sync -- --from=LEDGER_START --to=LEDGER_END [--horizon]");
    process.exit(1);
  }

  const fromLedger = parseInt(fromMatch.split("=")[1]);
  const toLedger = parseInt(toMatch.split("=")[1]);

  if (isNaN(fromLedger) || isNaN(toLedger)) {
    console.error("Invalid ledger numbers");
    process.exit(1);
  }

  if (fromLedger > toLedger) {
    console.error("fromLedger must be <= toLedger");
    process.exit(1);
  }

  console.log(`🔄 Starting historical sync from ledger ${fromLedger} to ${toLedger}`);
  console.log(`📡 Using ${useHorizon ? "Horizon" : "Soroban RPC"} (fallback to Horizon)`);

  const startTime = Date.now();

  try {
    let synced = 0;

    if (useHorizon) {
      synced = await historicalSyncService.syncFromHorizon(fromLedger, toLedger);
    } else {
      synced = await historicalSyncService.syncFromSorobanRpc(fromLedger, toLedger);
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Sync complete: ${synced} events in ${duration}s`);

    // Update sync state
    await historicalSyncService.updateSyncState(toLedger);
    console.log(`📊 Sync state updated to ledger ${toLedger}`);

    process.exit(0);
  } catch (error) {
    logger.error("Sync failed:", error);
    console.error("❌ Sync failed:", error);
    process.exit(1);
  }
}

main();
