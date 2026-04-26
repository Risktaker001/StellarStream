/**
 * Type definitions for the Stellar Glass Toast Notification System
 */

export type ToastVariant = "success" | "error" | "warning" | "info";

export interface BaseToastOptions {
  /**
   * Main message displayed in the toast
   */
  title: string;

  /**
   * Additional details or context (optional)
   */
  description?: string;

  /**
   * Duration in milliseconds before auto-dismiss
   * @default 5000 for success/warning/info, 6000 for error
   */
  duration?: number;
}

export interface TransactionToastOptions extends BaseToastOptions {
  /**
   * Stellar transaction hash for Stellar.Expert link
   */
  txHash?: string;
}

export interface StreamCreatedOptions {
  /**
   * Stellar transaction hash (required)
   */
  txHash: string;

  /**
   * Custom title (optional)
   * @default "Stream Created Successfully"
   */
  title?: string;

  /**
   * Custom description (optional)
   * @default "Your payment stream is now active"
   */
  description?: string;

  /**
   * Duration in milliseconds
   * @default 6000
   */
  duration?: number;
}

export interface WithdrawalCompleteOptions {
  /**
   * Amount withdrawn (formatted string)
   */
  amount: string;

  /**
   * Token symbol (e.g., "USDC", "XLM")
   */
  token: string;

  /**
   * Stellar transaction hash (required)
   */
  txHash: string;

  /**
   * Custom title (optional)
   * @default "Withdrawal Complete"
   */
  title?: string;

  /**
   * Duration in milliseconds
   * @default 6000
   */
  duration?: number;
}

export interface StreamCancelledOptions {
  /**
   * Stellar transaction hash (optional)
   */
  txHash?: string;

  /**
   * Custom title (optional)
   * @default "Stream Cancelled"
   */
  title?: string;

  /**
   * Custom description (optional)
   * @default "Remaining funds returned to sender"
   */
  description?: string;

  /**
   * Duration in milliseconds
   * @default 5000
   */
  duration?: number;
}

export interface TransactionFailedOptions {
  /**
   * Reason for failure (optional)
   */
  reason?: string;

  /**
   * Custom title (optional)
   * @default "Transaction Failed"
   */
  title?: string;

  /**
   * Duration in milliseconds
   * @default 6000
   */
  duration?: number;
}

/**
 * Common error codes for Stellar/Soroban transactions
 */
export enum StellarErrorCode {
  INSUFFICIENT_BALANCE = "INSUFFICIENT_BALANCE",
  INSUFFICIENT_GAS = "INSUFFICIENT_GAS",
  USER_REJECTED = "USER_REJECTED",
  NETWORK_ERROR = "NETWORK_ERROR",
  TIMEOUT = "TIMEOUT",
  UNAUTHORIZED = "UNAUTHORIZED",
  STREAM_NOT_ACTIVE = "STREAM_NOT_ACTIVE",
  INVALID_ADDRESS = "INVALID_ADDRESS",
  INVALID_AMOUNT = "INVALID_AMOUNT",
  WALLET_NOT_FOUND = "WALLET_NOT_FOUND",
  CONTRACT_ERROR = "CONTRACT_ERROR",
}

/**
 * Stellar transaction error with code and message
 */
export interface StellarTransactionError extends Error {
  code: StellarErrorCode | string;
  txHash?: string;
  details?: any;
}

/**
 * Toast notification configuration
 */
export interface ToastConfig {
  /**
   * Default position for toasts
   * @default "bottom-right"
   */
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "top-center" | "bottom-center";

  /**
   * Gap between multiple toasts in pixels
   * @default 12
   */
  gap?: number;

  /**
   * Whether toasts should expand on hover
   * @default false
   */
  expand?: boolean;

  /**
   * Maximum number of toasts to show at once
   * @default 3
   */
  maxToasts?: number;
}

/**
 * Stellar.Expert explorer configuration
 */
export interface StellarExpertConfig {
  /**
   * Base URL for Stellar.Expert
   * @default "https://stellar.expert/explorer/public"
   */
  baseUrl?: string;

  /**
   * Network to use (public, testnet)
   * @default "public"
   */
  network?: "public" | "testnet";
}

/**
 * Toast notification result
 */
export interface ToastResult {
  /**
   * Unique identifier for the toast
   */
  id: string | number;

  /**
   * Dismiss the toast programmatically
   */
  dismiss: () => void;
}

/**
 * Stream operation result from contract
 */
export interface StreamOperationResult {
  /**
   * Transaction hash
   */
  txHash: string;

  /**
   * Stream ID (for create operations)
   */
  streamId?: string;

  /**
   * Amount involved in the operation
   */
  amount?: string;

  /**
   * Token symbol
   */
  token?: string;

  /**
   * Additional metadata
   */
  metadata?: Record<string, any>;
}

/**
 * Withdrawal operation result
 */
export interface WithdrawalResult extends StreamOperationResult {
  /**
   * Amount withdrawn (required)
   */
  amount: string;

  /**
   * Token symbol (required)
   */
  token: string;

  /**
   * Receiver address
   */
  receiver?: string;
}

/**
 * Batch operation result
 */
export interface BatchOperationResult {
  /**
   * Number of successful operations
   */
  successCount: number;

  /**
   * Total number of operations attempted
   */
  totalCount: number;

  /**
   * Transaction hashes for successful operations
   */
  txHashes: string[];

  /**
   * Errors for failed operations
   */
  errors?: Array<{
    index: number;
    error: StellarTransactionError;
  }>;
}

/**
 * Toast notification API
 */
export interface ToastAPI {
  success: (options: TransactionToastOptions) => ToastResult;
  error: (options: TransactionToastOptions) => ToastResult;
  warning: (options: BaseToastOptions) => ToastResult;
  info: (options: BaseToastOptions) => ToastResult;
  streamCreated: (txHash: string, options?: Partial<StreamCreatedOptions>) => ToastResult;
  withdrawalComplete: (amount: string, token: string, txHash: string, options?: Partial<WithdrawalCompleteOptions>) => ToastResult;
  streamCancelled: (txHash?: string, options?: Partial<StreamCancelledOptions>) => ToastResult;
  transactionFailed: (reason?: string, options?: Partial<TransactionFailedOptions>) => ToastResult;
}

/**
 * Utility type for async operations with toast notifications
 */
export type ToastAsyncOperation<T = any> = {
  /**
   * Execute the operation with automatic toast notifications
   */
  execute: () => Promise<T>;

  /**
   * Loading toast options
   */
  loading?: BaseToastOptions;

  /**
   * Success toast options (can be a function that receives the result)
   */
  success?: TransactionToastOptions | ((result: T) => TransactionToastOptions);

  /**
   * Error toast options (can be a function that receives the error)
   */
  error?: TransactionToastOptions | ((error: StellarTransactionError) => TransactionToastOptions);
};
