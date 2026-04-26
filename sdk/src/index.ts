import { NebulaClient } from "./client.js";
import {
  Stream,
  StreamStatus,
  StreamEvent,
  StreamHistory,
  YieldData,
  CreateStreamParams,
  WithdrawParams,
  CancelStreamParams,
} from "./types.js";

/**
 * Nebula SDK - TypeScript wrapper for StellarStream protocol
 */
export class Nebula {
  private static client: NebulaClient;

  /**
   * Initialize the SDK with a backend URL
   */
  static initialize(baseUrl?: string): void {
    this.client = new NebulaClient(baseUrl);
  }

  /**
   * Set authentication token
   */
  static setAuthToken(token: string): void {
    if (!this.client) {
      throw new Error("SDK not initialized. Call Nebula.initialize() first.");
    }
    this.client.setAuthToken(token);
  }

  /**
   * Create a new stream
   */
  static async createStream(params: CreateStreamParams): Promise<Stream> {
    return this.client.createStream(params);
  }

  /**
   * Get stream details
   */
  static async getStream(streamId: string): Promise<Stream> {
    return this.client.getStream(streamId);
  }

  /**
   * Get all streams for a user
   */
  static async getStreams(
    address: string,
    limit?: number,
    offset?: number,
  ): Promise<Stream[]> {
    return this.client.getStreams(address, limit, offset);
  }

  /**
   * Withdraw from a stream
   */
  static async withdrawFromStream(params: WithdrawParams): Promise<{ txHash: string }> {
    return this.client.withdrawFromStream(params);
  }

  /**
   * Cancel a stream
   */
  static async cancelStream(params: CancelStreamParams): Promise<{ txHash: string }> {
    return this.client.cancelStream(params);
  }

  /**
   * Get stream history with all events
   */
  static async getStreamHistory(streamId: string): Promise<StreamHistory> {
    return this.client.getStreamHistory(streamId);
  }

  /**
   * Get yield data for a stream
   */
  static async getYieldData(streamId: string): Promise<YieldData> {
    return this.client.getYieldData(streamId);
  }

  /**
   * Calculate projected yield
   */
  static async calculateYield(
    streamId: string,
    projectionDays?: number,
  ): Promise<{ projected: string; rate: number }> {
    return this.client.calculateYield(streamId, projectionDays);
  }

  /**
   * Get stream events
   */
  static async getStreamEvents(streamId: string, limit?: number): Promise<StreamEvent[]> {
    return this.client.getStreamEvents(streamId, limit);
  }

  /**
   * Get protocol statistics
   */
  static async getStats(): Promise<Record<string, any>> {
    return this.client.getStats();
  }

  /**
   * Search streams
   */
  static async searchStreams(query: string): Promise<Stream[]> {
    return this.client.searchStreams(query);
  }
}

// Export types
export type {
  Stream,
  StreamEvent,
  StreamHistory,
  YieldData,
  CreateStreamParams,
  WithdrawParams,
  CancelStreamParams,
};

export { StreamStatus };
