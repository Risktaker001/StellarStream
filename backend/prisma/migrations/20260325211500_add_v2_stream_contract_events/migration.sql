ALTER TABLE "Stream"
  ADD COLUMN IF NOT EXISTS "version" INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS "contract_id" TEXT;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Stream'
      AND column_name = 'yieldEnabled'
  ) THEN
    ALTER TABLE "Stream"
      RENAME COLUMN "yieldEnabled" TO "yield_enabled";
  END IF;
END $$;

ALTER TABLE "Stream"
  ADD COLUMN IF NOT EXISTS "yield_enabled" BOOLEAN NOT NULL DEFAULT false;

UPDATE "Stream"
SET "version" = CASE
  WHEN "legacy" = true THEN 1
  ELSE 2
END
WHERE "version" = 1;

DROP INDEX IF EXISTS "Stream_yieldEnabled_status_idx";

CREATE INDEX IF NOT EXISTS "Stream_contract_id_idx"
  ON "Stream"("contract_id");

CREATE INDEX IF NOT EXISTS "Stream_yield_enabled_status_idx"
  ON "Stream"("yield_enabled", "status");

CREATE TABLE IF NOT EXISTS "ContractEvent" (
  "id" TEXT NOT NULL,
  "event_id" TEXT NOT NULL,
  "contract_id" TEXT NOT NULL,
  "tx_hash" TEXT NOT NULL,
  "event_type" TEXT NOT NULL,
  "event_index" INTEGER NOT NULL DEFAULT 0,
  "ledger_sequence" INTEGER NOT NULL,
  "ledger_closed_at" TEXT,
  "topic_xdr" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "value_xdr" TEXT NOT NULL,
  "decoded_json" JSONB NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ContractEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ContractEvent_event_id_key"
  ON "ContractEvent"("event_id");

CREATE UNIQUE INDEX IF NOT EXISTS "ContractEvent_tx_hash_event_index_key"
  ON "ContractEvent"("tx_hash", "event_index");

CREATE INDEX IF NOT EXISTS "ContractEvent_contract_id_ledger_sequence_idx"
  ON "ContractEvent"("contract_id", "ledger_sequence");

CREATE INDEX IF NOT EXISTS "ContractEvent_event_type_idx"
  ON "ContractEvent"("event_type");

CREATE INDEX IF NOT EXISTS "ContractEvent_tx_hash_idx"
  ON "ContractEvent"("tx_hash");