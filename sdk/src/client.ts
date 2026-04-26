import axios, { AxiosInstance } from "axios";
import {
  Stream,
  StreamEvent,
  StreamHistory,
  YieldData,
  CreateStreamParams,
  WithdrawParams,
  CancelStreamParams,
} from "./types.js";

export class NebulaClient {
  private client: AxiosInstance;
  private baseUrl: string;

  constructor(baseUrl: string = "http://localhost:3000/api/v1") {
    this.baseUrl = baseUrl;
    this.client = axios.create({
      baseURL: baseUrl,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  /**
   * Set authentication token for subsequent requests
   */
  setAuthToken(token: string): void {
    this.client.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }

  /**
   * Create a new stream
   */
  async createStream(params: CreateStreamParams): Promise<Stream> {
    const response = await this.client.post("/streams", params);
    return response.data;
  }

  /**
   * Get stream details by ID
   */
  async getStream(streamId: string): Promise<Stream> {
    const response = await this.client.get(`/streams/${streamId}`);
    return response.data;
  }

  /**
   * Get all streams for a user
   */
  async getStreams(
    address: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<Stream[]> {
    const response = await this.client.get("/streams", {
      params: { address, limit, offset },
    });
    return response.data;
  }

  /**
   * Withdraw from a stream
   */
  async withdrawFromStream(params: WithdrawParams): Promise<{ txHash: string }> {
    const response = await this.client.post("/streams/withdraw", params);
    return response.data;
  }

  /**
   * Cancel a stream
   */
  async cancelStream(params: CancelStreamParams): Promise<{ txHash: string }> {
    const response = await this.client.post("/streams/cancel", params);
    return response.data;
  }

  /**
   * Get stream history (events)
   */
  async getStreamHistory(streamId: string): Promise<StreamHistory> {
    const response = await this.client.get(`/audit-log/${streamId}`);
    return response.data;
  }

  /**
   * Get yield data for a stream
   */
  async getYieldData(streamId: string): Promise<YieldData> {
    const response = await this.client.get(`/yield/${streamId}`);
    return response.data;
  }

  /**
   * Calculate projected yield
   */
  async calculateYield(
    streamId: string,
    projectionDays: number = 30,
  ): Promise<{ projected: string; rate: number }> {
    const response = await this.client.get(`/yield/${streamId}/projection`, {
      params: { days: projectionDays },
    });
    return response.data;
  }

  /**
   * Get stream events
   */
  async getStreamEvents(streamId: string, limit: number = 50): Promise<StreamEvent[]> {
    const response = await this.client.get(`/audit-log/${streamId}`, {
      params: { limit },
    });
    return response.data.events || [];
  }

  /**
   * Get protocol statistics
   */
  async getStats(): Promise<Record<string, any>> {
    const response = await this.client.get("/stats");
    return response.data;
  }

  /**
   * Search streams
   */
  async searchStreams(query: string): Promise<Stream[]> {
    const response = await this.client.get("/search", {
      params: { q: query },
    });
    return response.data;
  }
}
