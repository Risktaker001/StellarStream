-- Migration: notification subscriptions for Discord/Telegram stream alerts

CREATE TYPE IF NOT EXISTS "NotificationPlatform" AS ENUM ('discord', 'telegram');

CREATE TABLE IF NOT EXISTS "NotificationSubscription" (
  "id"             TEXT        NOT NULL DEFAULT gen_random_uuid()::text,
  "stellarAddress" TEXT        NOT NULL,
  "platform"       "NotificationPlatform" NOT NULL,
  "webhookUrl"     TEXT,
  "chatId"         TEXT,
  "isActive"       BOOLEAN     NOT NULL DEFAULT true,
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "NotificationSubscription_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "NotificationSubscription_stellarAddress_platform_key"
    UNIQUE ("stellarAddress", "platform")
);

CREATE INDEX IF NOT EXISTS "NotificationSubscription_stellarAddress_idx"
  ON "NotificationSubscription"("stellarAddress");

CREATE INDEX IF NOT EXISTS "NotificationSubscription_platform_idx"
  ON "NotificationSubscription"("platform");
