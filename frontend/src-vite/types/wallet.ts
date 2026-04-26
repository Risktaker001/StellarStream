/**
 * Wallet status types for Soroban transactions
 */

export type WalletStatus = 'idle' | 'pending' | 'signed' | 'rejected';

export interface TransactionState {
  status: WalletStatus;
  txHash?: string;
  error?: Error;
  timestamp?: number;
}

export interface WalletHook {
  walletStatus: WalletStatus;
  signTransaction: (tx: unknown) => Promise<{ success: boolean; error?: unknown }>;
  reset: () => void;
}

/**
 * Type guard to check if a value is a valid WalletStatus
 */
export function isWalletStatus(value: unknown): value is WalletStatus {
  return (
    typeof value === 'string' &&
    ['idle', 'pending', 'signed', 'rejected'].includes(value)
  );
}
