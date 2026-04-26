-- Migration: add legacy and migrated flags to Stream for dual-version support
ALTER TABLE "Stream" ADD COLUMN IF NOT EXISTS "legacy"   BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Stream" ADD COLUMN IF NOT EXISTS "migrated" BOOLEAN NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS "Stream_legacy_idx" ON "Stream"("legacy");
