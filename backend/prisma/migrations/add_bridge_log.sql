-- Generic bridge logs for future cross-chain integrations (Allbridge, etc.)
CREATE TABLE IF NOT EXISTS "BridgeLog" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "bridge" TEXT NOT NULL,
  "eventType" TEXT NOT NULL,
  "sourceChain" TEXT NOT NULL,
  "targetChain" TEXT NOT NULL,
  "sourceAsset" TEXT NOT NULL,
  "targetAsset" TEXT,
  "amount" TEXT NOT NULL,
  "sender" TEXT,
  "recipient" TEXT NOT NULL,
  "txHash" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "payload" TEXT,
  "landedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS "BridgeLog_txHash_key" ON "BridgeLog"("txHash");
CREATE INDEX IF NOT EXISTS "BridgeLog_eventType_idx" ON "BridgeLog"("eventType");
CREATE INDEX IF NOT EXISTS "BridgeLog_targetChain_idx" ON "BridgeLog"("targetChain");
CREATE INDEX IF NOT EXISTS "BridgeLog_recipient_idx" ON "BridgeLog"("recipient");
CREATE INDEX IF NOT EXISTS "BridgeLog_status_idx" ON "BridgeLog"("status");
CREATE INDEX IF NOT EXISTS "BridgeLog_createdAt_idx" ON "BridgeLog"("createdAt");
