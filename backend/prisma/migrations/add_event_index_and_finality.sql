-- Add eventIndex field to EventLog for deduplication
ALTER TABLE "EventLog"
  ADD COLUMN IF NOT EXISTS "eventIndex" INTEGER NOT NULL DEFAULT 0;

-- Unique constraint on (txHash, eventIndex) to prevent duplicate event ingestion
-- This is the primary guard against ledger re-org double-processing
ALTER TABLE "EventLog"
  ADD CONSTRAINT "EventLog_txHash_eventIndex_key"
  UNIQUE ("txHash", "eventIndex");
