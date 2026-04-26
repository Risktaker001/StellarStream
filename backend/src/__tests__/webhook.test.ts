import { describe, it } from "node:test";
import { WebhookService } from "../services/webhook.service.js";

// Mocking fetch globally for the test
const originalFetch = global.fetch;

describe("WebhookService", () => {
    it("should attempt to trigger webhooks if payload is provided", async () => {
        // @ts-ignore
        global.fetch = async () => {
            return { ok: true, status: 200 };
        };

        const service = new WebhookService();

        const payload = {
            eventType: "test",
            streamId: "1",
            txHash: "0x1",
            sender: "S",
            receiver: "R",
            amount: "100",
            timestamp: new Date().toISOString()
        };

        // This will likely log "No active webhooks found" if DB is empty/not connected
        await service.trigger(payload);

        global.fetch = originalFetch;
    });
});
