#!/usr/bin/env tsx
/**
 * V1 → V2 Stream Migration Script
 *
 * 1. Identifies all Active V1 (legacy) streams in the database.
 * 2. Cross-references each against the V2 Nebula record to validate
 *    that no funds are lost during the metadata transition.
 * 3. Marks successfully validated V1 records as ARCHIVED to prevent
 *    duplicate entries in the UI.
 *
 * Usage:
 *   npx tsx src/scripts/migrate-v1-to-v2.ts [--dry-run]
 *
 * Flags:
 *   --dry-run   Report what would be migrated without writing to the DB.
 */

import { PrismaClient } from '../generated/client/index.js';
import { logger } from '../logger.js';

// StreamStatus values — using string literals to stay in sync with schema
// without requiring a prisma generate run in CI.
const StreamStatus = {
  ACTIVE:   'ACTIVE',
  PAUSED:   'PAUSED',
  COMPLETED:'COMPLETED',
  CANCELED: 'CANCELED',
  ARCHIVED: 'ARCHIVED', // Added by migration: add_archived_stream_status.sql
} as const;
const prisma = new PrismaClient();
const isDryRun = process.argv.includes('--dry-run');

// ── Types ─────────────────────────────────────────────────────────────────────

interface MigrationResult {
  streamId: string;
  v1Amount: string;
  v2Amount: string;
  amountsMatch: boolean;
  archived: boolean;
  skipReason?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Normalise a BigInt-safe amount string for comparison.
 * Strips leading zeros and trims whitespace.
 */
function normaliseAmount(value: string | null | undefined): bigint {
  if (!value) return 0n;
  try {
    return BigInt(value.trim());
  } catch {
    return 0n;
  }
}

/**
 * Derive the expected V2 streamId from a V1 streamId.
 * Convention used by DualVersionIngestor: `${v1StreamId}-v2`
 */
function toV2StreamId(v1StreamId: string): string {
  return `${v1StreamId}-v2`;
}

// ── Core migration logic ──────────────────────────────────────────────────────

async function run(): Promise<void> {
  logger.info('[Migration] Starting V1 → V2 stream migration', { dryRun: isDryRun });

  // Step 1: Fetch all Active V1 streams that have not yet been archived
  const v1Streams = await prisma.stream.findMany({
    where: {
      legacy: true,
      status: StreamStatus.ACTIVE as never,
    },
  });

  if (v1Streams.length === 0) {
    logger.info('[Migration] No active V1 streams found. Nothing to migrate.');
    await prisma.$disconnect();
    return;
  }

  logger.info(`[Migration] Found ${v1Streams.length} active V1 stream(s) to evaluate.`);

  const results: MigrationResult[] = [];
  const toArchive: string[] = []; // DB record IDs to update

  // Step 2: Cross-reference each V1 stream against its V2 counterpart
  for (const v1 of v1Streams) {
    const v1StreamId = v1.streamId ?? v1.id;
    const v2StreamId = toV2StreamId(v1StreamId);

    const v2 = await prisma.stream.findFirst({
      where: {
        streamId: v2StreamId,
        legacy: false,
      },
    });

    // No V2 record found — migration event hasn't been processed yet
    if (!v2) {
      results.push({
        streamId: v1StreamId,
        v1Amount: v1.amount,
        v2Amount: '0',
        amountsMatch: false,
        archived: false,
        skipReason: 'No corresponding V2 record found — migration event not yet indexed.',
      });
      continue;
    }

    // Step 3: Validate amounts — ensure no funds are lost
    const v1Amt = normaliseAmount(v1.amount);
    const v2Amt = normaliseAmount(v2.amount);
    const amountsMatch = v1Amt === v2Amt;

    if (!amountsMatch) {
      logger.warn('[Migration] Amount mismatch — skipping', {
        streamId: v1StreamId,
        v1Amount: v1.amount,
        v2Amount: v2.amount,
      });
      results.push({
        streamId: v1StreamId,
        v1Amount: v1.amount,
        v2Amount: v2.amount,
        amountsMatch: false,
        archived: false,
        skipReason: `Amount mismatch: V1=${v1.amount} V2=${v2.amount}`,
      });
      continue;
    }

    // Validation passed — queue for archival
    toArchive.push(v1.id);
    results.push({
      streamId: v1StreamId,
      v1Amount: v1.amount,
      v2Amount: v2.amount,
      amountsMatch: true,
      archived: !isDryRun,
    });
  }

  // Step 4: Archive validated V1 records in a single transaction
  if (!isDryRun && toArchive.length > 0) {
    await prisma.$transaction([
      prisma.stream.updateMany({
        where: { id: { in: toArchive } },
        data: {
          status: StreamStatus.ARCHIVED as never,
          migrated: true,
        },
      }),
    ]);
    logger.info(`[Migration] Archived ${toArchive.length} V1 stream(s).`);
  }

  // ── Summary report ──────────────────────────────────────────────────────────
  const archived  = results.filter(r => r.archived).length;
  const skipped   = results.filter(r => !r.archived).length;
  const mismatched = results.filter(r => !r.amountsMatch).length;

  logger.info('[Migration] Complete', {
    total:      results.length,
    archived,
    skipped,
    mismatched,
    dryRun:     isDryRun,
  });

  console.table(
    results.map(r => ({
      streamId:     r.streamId,
      v1Amount:     r.v1Amount,
      v2Amount:     r.v2Amount,
      amountsMatch: r.amountsMatch,
      archived:     r.archived,
      skipReason:   r.skipReason ?? '—',
    }))
  );

  if (isDryRun) {
    console.log('\n[DRY RUN] No changes written to the database.');
  }

  await prisma.$disconnect();
}

run().catch(async (err) => {
  logger.error('[Migration] Fatal error', { err });
  await prisma.$disconnect();
  process.exit(1);
});
