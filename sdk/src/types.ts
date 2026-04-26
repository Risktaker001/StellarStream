/**
 * Shared types for Nebula SDK
 */

export interface Stream {
  id: string;
  streamId?: string;
  sender: string;
  receiver: string;
  amount: string;
  tokenAddress: string;
  duration: number;
  status: StreamStatus;
  withdrawn: string;
  createdAt: Date;
  yieldEnabled: boolean;
  accruedInterest: string;
}

export enum StreamStatus {
  ACTIVE = "ACTIVE",
  PAUSED = "PAUSED",
  COMPLETED = "COMPLETED",
  CANCELED = "CANCELED",
  ARCHIVED = "ARCHIVED",
}

export interface StreamEvent {
  id: string;
  eventType: string;
  streamId: string;
  txHash: string;
  ledger: number;
  ledgerClosedAt: string;
  sender?: string;
  receiver?: string;
  amount?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface YieldData {
  streamId: string;
  accruedInterest: string;
  yieldRate: number;
  lastAccrualAt: Date;
}

export interface StreamHistory {
  stream: Stream;
  events: StreamEvent[];
  yield?: YieldData;
}

export interface CreateStreamParams {
  receiver: string;
  amount: string;
  tokenAddress: string;
  duration: number;
  yieldEnabled?: boolean;
}

export interface WithdrawParams {
  streamId: string;
  amount?: string;
}

export interface CancelStreamParams {
  streamId: string;
}
