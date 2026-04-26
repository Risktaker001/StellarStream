-- Migration: Add ApiKey table for partner API key management
CREATE TABLE "ApiKey" (
  "id"          TEXT        NOT NULL,
  "keyHash"     TEXT        NOT NULL,
  "name"        TEXT        NOT NULL,
  "owner"       TEXT        NOT NULL,
  "rateLimit"   INTEGER     NOT NULL DEFAULT 1000,
  "isActive"    BOOLEAN     NOT NULL DEFAULT true,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL,
  "lastUsedAt"  TIMESTAMP(3),

  CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ApiKey_keyHash_key" ON "ApiKey"("keyHash");
CREATE INDEX "ApiKey_owner_idx" ON "ApiKey"("owner");
