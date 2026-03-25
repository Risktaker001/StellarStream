import express from "express";
import request from "supertest";
import { nativeToScVal, xdr } from "@stellar/stellar-sdk";
import { mockDb, createMockPrismaClient, createMockLibPrisma } from "./mock-prisma-db";

// Ensure a deterministic fetch mock for webhook delivery assertions.
global.fetch = jest.fn(async () => ({
  ok: true,
  status: 200,
  statusText: "OK",
})) as any;

function applyIngestionMocks() {
  const prismaClientFactory = () => createMockPrismaClient();

  jest.doMock("@sentry/node", () => ({
    withScope: jest.fn(),
    captureException: jest.fn(),
    init: jest.fn(),
  }));

  jest.doMock("../generated/client/index.js", () => {
    return {
      PrismaClient: jest.fn().mockImplementation(() => prismaClientFactory()),
      StreamStatus: {
        ACTIVE: "ACTIVE",
        PAUSED: "PAUSED",
        COMPLETED: "COMPLETED",
        CANCELED: "CANCELED",
      },
    };
  });

  // Some modules import from "../generated/client" (directory), not the index.js.
  jest.doMock("../generated/client", () => {
    return {
      PrismaClient: jest.fn().mockImplementation(() => prismaClientFactory()),
      StreamStatus: {
        ACTIVE: "ACTIVE",
        PAUSED: "PAUSED",
        COMPLETED: "COMPLETED",
        CANCELED: "CANCELED",
      },
    };
  });

  jest.doMock("../services/stream-lifecycle-service", () => {
    // Re-implement only the pure helpers used by EventWatcher.
    function toBigIntOrNull(value: unknown): bigint | null {
      if (typeof value === "bigint") return value;
      if (typeof value === "number" && Number.isFinite(value)) return BigInt(Math.trunc(value));
      if (typeof value === "string" && value.trim().length > 0) {
        try {
          return BigInt(value);
        } catch {
          return null;
        }
      }
      return null;
    }

    function toObjectOrNull(value: unknown): Record<string, unknown> | null {
      if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
      return value as Record<string, unknown>;
    }

    return {
      StreamLifecycleService: jest.fn().mockImplementation(() => ({
        upsertCreatedStream: jest.fn(async () => undefined),
        registerWithdrawal: jest.fn(async () => undefined),
        cancelStream: jest.fn(async () => ({
          streamId: "mock",
          originalTotalAmount: 0n,
          finalStreamedAmount: 0n,
          remainingUnstreamedAmount: 0n,
          closedAtIso: new Date().toISOString(),
        })),
      })),
      toBigIntOrNull,
      toObjectOrNull,
    };
  });

  jest.doMock("../lib/db", () => {
    return {
      prisma: createMockLibPrisma(),
    };
  });
}

// ─── Test helpers ───────────────────────────────────────────────────────────

function buildRawCreateStreamEvent(args: {
  id?: string;
  txHash?: string;
  ledger?: number;
  streamId: number;
  sender: string;
  receiver: string;
  amountStroops: number;
  durationSeconds: number;
}) {
  const { id, txHash, ledger, streamId, sender, receiver, amountStroops, durationSeconds } =
    args;

  // topic[0] determines EventWatcher eventType via extractEventType()
  // and must decode to a supported stream creation event type.
  const topic0 = nativeToScVal("stream_created", { type: "symbol" });
  // Use `string` (not `symbol`) because Stellar `symbol` is limited to 32 bytes.
  // The StreamWatcher heuristic uses scValToNative() so scvString is sufficient.
  const topic1 = nativeToScVal(sender, { type: "string" });

  const payload = nativeToScVal(
    {
      stream_id: streamId,
      sender,
      receiver,
      amount: amountStroops,
      duration: durationSeconds,
      total_amount: amountStroops,
    },
    { type: "map" },
  );

  return {
    id: id ?? `${ledger ?? 1000}-0-1`,
    type: "contract",
    ledger: ledger ?? 1000,
    ledgerClosedAt: "2026-01-01T00:00:00Z",
    contractId: "CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABSC4",
    txHash: txHash ?? "mock-txhash-create-stream",
    topic: [topic0, topic1] as xdr.ScVal[],
    value: payload,
    inSuccessfulContractCall: true,
    pagingToken: "0",
  } as any;
}

function makeMockRpcServer(ledgerSequence: number, events: any[]) {
  return {
    getLatestLedger: jest.fn(async () => ({ sequence: ledgerSequence })),
    getEvents: jest.fn(async () => ({ events })),
  };
}

function makeMockHorizonServer(sequenceToHash: Record<number, string>) {
  return {
    ledgers: () => ({
      ledger: (sequence: number) => ({
        call: jest.fn(async () => ({
          records: [{ hash: sequenceToHash[sequence] ?? `hash_${sequence}` }],
        })),
      }),
    }),
  };
}

describe("High-fidelity ingestion + webhook tests", () => {
  const sender = "G" + "S".repeat(55);
  const receiver = "G" + "R".repeat(55);
  const amountStroops = 100_000_000_001; // >= 10000_0000000n threshold used in EventWatcher

  beforeEach(() => {
    jest.clearAllMocks();
    mockDb.reset();
  });

  it("indexes create_stream events into Stream table and triggers webhooks", async () => {
    jest.resetModules();
    applyIngestionMocks();

    const webhookUrl = "https://example.com/webhook/stream";
    mockDb.seedWebhook({ url: webhookUrl, isActive: true });

    const rawEvent = buildRawCreateStreamEvent({
      streamId: 42,
      sender,
      receiver,
      amountStroops,
      durationSeconds: 3600,
      txHash: "txhash_stream_created_42",
      ledger: 1000,
      id: "1000-0-7",
    });

    const { EventWatcher } = await import("../event-watcher");
    const { parseContractEvent, extractEventType } = await import("../event-parser");

    // Pre-flight: ensure we built real ScVal objects compatible with parseContractEvent().
    expect(rawEvent.topic).toHaveLength(2);
    expect(typeof rawEvent.topic[0].toXDR).toBe("function");
    expect(typeof rawEvent.topic[1].toXDR).toBe("function");
    expect(() => rawEvent.topic[0].toXDR("base64")).not.toThrow();
    expect(() => rawEvent.topic[1].toXDR("base64")).not.toThrow();
    expect(typeof rawEvent.value.switch).toBe("function");
    expect(() => rawEvent.value.switch()).not.toThrow();

    const parsed = parseContractEvent(rawEvent as any);
    expect(parsed).not.toBeNull();
    expect(extractEventType((parsed as any).topics)).toBe("stream_created");

    const watcher: any = new EventWatcher({
      rpcUrl: "http://localhost:8000",
      // Horizon.Server rejects insecure http:// URLs during construction.
      // We override `watcher.horizonServer` below anyway.
      horizonUrl: "https://example.com/horizon",
      networkPassphrase: "Test SDF Network ; September 2015",
      contractId: "CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABSC4",
      pollIntervalMs: 1000,
      maxRetries: 1,
      retryDelayMs: 1,
    });

    // Drive the full ingestion path (RPC -> processEvent -> storeLedgerHash).
    watcher.server = makeMockRpcServer(1000, [rawEvent]);
    watcher.horizonServer = makeMockHorizonServer({ 1000: "ledger_hash_1000" });
    watcher.state = {
      lastProcessedLedger: 999,
      isRunning: false,
      errorCount: 0,
      ledgersSinceLastVerification: 0,
      lastVerifiedLedger: 0,
    };

    await watcher.fetchAndProcessEvents();

    expect(mockDb.attemptedStreamCreates).toBeGreaterThan(0);

    // Stream row persisted.
    expect(mockDb.streams).toHaveLength(1);
    expect(mockDb.streams[0]).toMatchObject({
      txHash: "txhash_stream_created_42",
      streamId: "42",
      sender,
      receiver,
      amount: String(amountStroops),
      duration: 3600,
      status: "ACTIVE",
    });

    // Webhook delivered.
    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [calledUrl, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(calledUrl).toBe(webhookUrl);
    expect(options.method).toBe("POST");
    const payload = JSON.parse(options.body);
    expect(payload).toMatchObject({
      eventType: "stream_created",
      txHash: "txhash_stream_created_42",
      streamId: "42",
      sender,
      receiver,
      amount: String(amountStroops),
    });
    expect(typeof payload.timestamp).toBe("string");
  });

  it("API: GET /api/v1/streams/:address returns ingested streams", async () => {
    jest.resetModules();
    applyIngestionMocks();

    // Seed one stream via ingestion first.
    mockDb.seedWebhook({ url: "https://example.com/webhook/stream", isActive: false });

    const rawEvent = buildRawCreateStreamEvent({
      streamId: 42,
      sender,
      receiver,
      amountStroops,
      durationSeconds: 3600,
      txHash: "txhash_stream_created_42_api",
      ledger: 1000,
      id: "1000-0-1",
    });

    const { EventWatcher } = await import("../event-watcher");
    const watcher: any = new EventWatcher({
      rpcUrl: "http://localhost:8000",
      horizonUrl: "https://example.com/horizon",
      networkPassphrase: "Test SDF Network ; September 2015",
      contractId: "CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABSC4",
      pollIntervalMs: 1000,
      maxRetries: 1,
      retryDelayMs: 1,
    });

    watcher.server = makeMockRpcServer(1000, [rawEvent]);
    watcher.horizonServer = makeMockHorizonServer({ 1000: "ledger_hash_1000" });
    watcher.state = {
      lastProcessedLedger: 999,
      isRunning: false,
      errorCount: 0,
      ledgersSinceLastVerification: 0,
      lastVerifiedLedger: 0,
    };

    await watcher.fetchAndProcessEvents();

    const app = express();
    app.use(express.json());

    const streamsRouter = (await import("../api/streams.routes")).default;
    app.use("/api/v1", streamsRouter);

    const res = await request(app).get(`/api/v1/streams/${encodeURIComponent(receiver)}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.count).toBe(1);
    expect(res.body.streams[0]).toMatchObject({
      streamId: "42",
      sender,
      receiver,
      amount: String(amountStroops),
    });
  });
});

