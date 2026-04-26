/**
 * Stellar Ledger Loader Types
 * 
 * Type definitions for the Stellar Ledger Loader component
 */

/**
 * Props for the StellarLedgerLoader component
 */
export interface StellarLedgerLoaderProps {
  /**
   * Controls the visibility of the loader overlay
   */
  isOpen: boolean;

  /**
   * Custom message to display while waiting
   * @default "Waiting for Stellar Ledger to close..."
   */
  message?: string;

  /**
   * Estimated duration in milliseconds for the ledger to close
   * @default 5000 (5 seconds)
   */
  estimatedDuration?: number;

  /**
   * Callback function triggered when progress reaches 100%
   * Use this to hide the loader or trigger follow-up actions
   */
  onComplete?: () => void;
}

/**
 * Loader state management interface
 * Useful for managing loader state in parent components
 */
export interface LoaderState {
  isOpen: boolean;
  message: string;
  duration?: number;
}

/**
 * Transaction operation types that might use the loader
 */
export type TransactionOperation =
  | "create_stream"
  | "withdraw"
  | "cancel_stream"
  | "approve_token"
  | "transfer_receiver"
  | "update_stream"
  | "batch_create"
  | "custom";

/**
 * Helper type for transaction context
 */
export interface TransactionContext {
  operation: TransactionOperation;
  message: string;
  estimatedDuration?: number;
}

/**
 * Predefined transaction contexts for common operations
 */
export const TRANSACTION_CONTEXTS: Record<TransactionOperation, TransactionContext> = {
  create_stream: {
    operation: "create_stream",
    message: "Creating your payment stream...",
    estimatedDuration: 5000,
  },
  withdraw: {
    operation: "withdraw",
    message: "Processing withdrawal...",
    estimatedDuration: 5000,
  },
  cancel_stream: {
    operation: "cancel_stream",
    message: "Cancelling stream...",
    estimatedDuration: 5000,
  },
  approve_token: {
    operation: "approve_token",
    message: "Approving token spending...",
    estimatedDuration: 5000,
  },
  transfer_receiver: {
    operation: "transfer_receiver",
    message: "Transferring stream ownership...",
    estimatedDuration: 5000,
  },
  update_stream: {
    operation: "update_stream",
    message: "Updating stream parameters...",
    estimatedDuration: 5000,
  },
  batch_create: {
    operation: "batch_create",
    message: "Creating multiple streams...",
    estimatedDuration: 7000,
  },
  custom: {
    operation: "custom",
    message: "Processing transaction...",
    estimatedDuration: 5000,
  },
};

/**
 * Hook return type for useLoader custom hook
 */
export interface UseLoaderReturn {
  isOpen: boolean;
  message: string;
  duration: number;
  showLoader: (context: TransactionOperation | TransactionContext) => void;
  hideLoader: () => void;
  updateMessage: (message: string) => void;
}

/**
 * Animation configuration type
 */
export interface AnimationConfig {
  rotationSpeed: number;
  glowPulseSpeed: number;
  shimmerSpeed: number;
  entranceDuration: number;
  exitDuration: number;
}

/**
 * Default animation configuration
 */
export const DEFAULT_ANIMATION_CONFIG: AnimationConfig = {
  rotationSpeed: 3,
  glowPulseSpeed: 2,
  shimmerSpeed: 1.5,
  entranceDuration: 0.4,
  exitDuration: 0.3,
};
