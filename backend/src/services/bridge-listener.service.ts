import { randomUUID } from "node:crypto";
import { prisma } from "../lib/db.js";
import { logger } from "../logger.js";

export interface BridgeLandingEvent {
  bridge: string;
  sourceChain: string;
  targetChain: string;
  sourceAsset: string;
  targetAsset?: string;
  amount: string;
  sender?: string;
  recipient: string;
  txHash: string;
  payload?: Record<string, unknown>;
  landedAt?: string;
}

interface ActiveWebhook {
  url: string;
}

export class BridgeListenerService {
  private readonly mockIntervalMs: number;
  private mockTimer?: NodeJS.Timeout;

  constructor(mockIntervalMs?: number) {
    this.mockIntervalMs =
      mockIntervalMs ?? Number(process.env.BRIDGE_MOCK_INTERVAL_MS ?? "45000");
  }

  startMockListener(): void {
    if (this.mockTimer !== undefined) {
      return;
    }

    logger.info("Starting mock bridge listener", {
      intervalMs: this.mockIntervalMs,
    });

    this.mockTimer = setInterval(() => {
      void this.emitMockLandingEvent();
    }, this.mockIntervalMs);
  }

  stopMockListener(): void {
    if (this.mockTimer !== undefined) {
      clearInterval(this.mockTimer);
      this.mockTimer = undefined;
    }
  }

  async emitMockLandingEvent(): Promise<void> {
    const now = Date.now();
    const event: BridgeLandingEvent = {
      bridge: "allbridge",
      sourceChain: "ethereum",
      targetChain: "stellar",
      sourceAsset: "USDC",
      targetAsset: "USDC",
      amount: "25000000",
      sender: "0xMockSender",
      recipient: "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF",
      txHash: `mock-landing-${now}`,
      payload: {
        message: "Mock landing event for Deep Space expansion readiness",
        nonce: randomUUID(),
      },
      landedAt: new Date(now).toISOString(),
    };

    await this.handleLandingEvent(event);
  }

  async handleLandingEvent(event: BridgeLandingEvent): Promise<void> {
    const landedAt = event.landedAt ? new Date(event.landedAt) : new Date();
    const payload = event.payload ? JSON.stringify(event.payload) : null;

    await prisma.$executeRaw`
      INSERT INTO "BridgeLog"
      ("id", "bridge", "eventType", "sourceChain", "targetChain", "sourceAsset", "targetAsset", "amount", "sender", "recipient", "txHash", "status", "payload", "landedAt")
      VALUES (${randomUUID()}, ${event.bridge}, ${"landing"}, ${event.sourceChain}, ${event.targetChain}, ${event.sourceAsset}, ${event.targetAsset ?? null}, ${event.amount}, ${event.sender ?? null}, ${event.recipient}, ${event.txHash}, ${"LANDED"}, ${payload}, ${landedAt})
      ON CONFLICT ("txHash")
      DO NOTHING
    `;

    const notification = {
      eventType: "cross_chain_asset_landed",
      bridge: event.bridge,
      sourceChain: event.sourceChain,
      targetChain: event.targetChain,
      asset: event.targetAsset ?? event.sourceAsset,
      amount: event.amount,
      recipient: event.recipient,
      txHash: event.txHash,
      timestamp: landedAt.toISOString(),
    };

    await this.notify(notification);

    logger.info("Bridge landing event processed", notification);
  }

  private async notify(notification: Record<string, unknown>): Promise<void> {
    const webhooks = await prisma.$queryRaw<ActiveWebhook[]>`
      SELECT "url" FROM "Webhook" WHERE "isActive" = true
    `;

    if (webhooks.length === 0) {
      logger.debug("No active webhooks for bridge landing notification");
      return;
    }

    await Promise.allSettled(
      webhooks.map(async ({ url }) => {
        try {
          const response = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "User-Agent": "StellarStream-BridgeListener/1.0",
            },
            body: JSON.stringify(notification),
          });

          if (!response.ok) {
            logger.warn("Bridge landing webhook delivery failed", {
              url,
              status: response.status,
            });
          }
        } catch (error) {
          logger.error("Bridge landing webhook delivery error", error, { url });
        }
      })
    );
  }
}
