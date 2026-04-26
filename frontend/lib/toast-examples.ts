/**
 * Toast Notification Examples
 * 
 * Quick reference for common toast notification patterns in StellarStream.
 * Import and use these examples as templates for your components.
 */

import { toast } from "./toast";

// ═══════════════════════════════════════════════════════════════════════════
// STREAM OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Example: Stream Creation Success
 * Use when a new payment stream is successfully created
 */
export const exampleStreamCreated = (txHash: string) => {
  toast.streamCreated(txHash);
};

/**
 * Example: Withdrawal Success
 * Use when funds are successfully withdrawn from a stream
 */
export const exampleWithdrawal = (amount: string, token: string, txHash: string) => {
  toast.withdrawalComplete(amount, token, txHash);
};

/**
 * Example: Stream Cancellation
 * Use when a stream is cancelled by sender or receiver
 */
export const exampleStreamCancelled = (txHash: string) => {
  toast.streamCancelled(txHash);
};

/**
 * Example: Transaction Failure
 * Use when any blockchain transaction fails
 */
export const exampleTransactionFailed = (reason?: string) => {
  toast.transactionFailed(reason);
};

// ═══════════════════════════════════════════════════════════════════════════
// WALLET OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Example: Wallet Connected
 */
export const exampleWalletConnected = (address: string) => {
  toast.success({
    title: "Wallet Connected",
    description: `Connected to ${address.slice(0, 8)}...${address.slice(-6)}`,
    duration: 4000,
  });
};

/**
 * Example: Wallet Disconnected
 */
export const exampleWalletDisconnected = () => {
  toast.info({
    title: "Wallet Disconnected",
    description: "Your wallet has been safely disconnected",
    duration: 3000,
  });
};

/**
 * Example: Insufficient Balance
 */
export const exampleInsufficientBalance = (token: string) => {
  toast.error({
    title: "Insufficient Balance",
    description: `You don't have enough ${token} to complete this transaction`,
    duration: 6000,
  });
};

// ═══════════════════════════════════════════════════════════════════════════
// APPROVAL & AUTHORIZATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Example: Token Approval Required
 */
export const exampleApprovalRequired = (token: string) => {
  toast.warning({
    title: "Approval Required",
    description: `Please approve ${token} spending in your wallet`,
    duration: 8000,
  });
};

/**
 * Example: Token Approved
 */
export const exampleTokenApproved = (token: string, txHash: string) => {
  toast.success({
    title: "Token Approved",
    description: `${token} spending approved successfully`,
    txHash,
    duration: 5000,
  });
};

// ═══════════════════════════════════════════════════════════════════════════
// NETWORK & CONNECTION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Example: Network Error
 */
export const exampleNetworkError = () => {
  toast.error({
    title: "Network Error",
    description: "Unable to connect to Stellar network. Please try again.",
    duration: 6000,
  });
};

/**
 * Example: Transaction Pending
 */
export const exampleTransactionPending = () => {
  toast.info({
    title: "Transaction Pending",
    description: "Your transaction is being processed on the blockchain",
    duration: 5000,
  });
};

/**
 * Example: Network Congestion
 */
export const exampleNetworkCongestion = () => {
  toast.warning({
    title: "Network Congestion",
    description: "Transactions may take longer than usual to process",
    duration: 7000,
  });
};

// ═══════════════════════════════════════════════════════════════════════════
// VALIDATION & INPUT
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Example: Invalid Address
 */
export const exampleInvalidAddress = () => {
  toast.error({
    title: "Invalid Address",
    description: "Please enter a valid Stellar address (G...)",
    duration: 5000,
  });
};

/**
 * Example: Invalid Amount
 */
export const exampleInvalidAmount = () => {
  toast.error({
    title: "Invalid Amount",
    description: "Please enter a valid amount greater than 0",
    duration: 5000,
  });
};

/**
 * Example: Form Validation Error
 */
export const exampleValidationError = (field: string) => {
  toast.error({
    title: "Validation Error",
    description: `Please check the ${field} field and try again`,
    duration: 5000,
  });
};

// ═══════════════════════════════════════════════════════════════════════════
// SETTINGS & CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Example: Settings Saved
 */
export const exampleSettingsSaved = () => {
  toast.success({
    title: "Settings Saved",
    description: "Your preferences have been updated",
    duration: 3000,
  });
};

/**
 * Example: Profile Updated
 */
export const exampleProfileUpdated = () => {
  toast.success({
    title: "Profile Updated",
    description: "Your profile information has been saved",
    duration: 4000,
  });
};

// ═══════════════════════════════════════════════════════════════════════════
// INTEREST & VAULT OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Example: Interest Accrued
 */
export const exampleInterestAccrued = (amount: string, token: string) => {
  toast.info({
    title: "Interest Accrued",
    description: `You've earned ${amount} ${token} in interest`,
    duration: 5000,
  });
};

/**
 * Example: Vault Strategy Updated
 */
export const exampleVaultStrategyUpdated = (strategy: string, txHash: string) => {
  toast.success({
    title: "Vault Strategy Updated",
    description: `Now using ${strategy} strategy`,
    txHash,
    duration: 5000,
  });
};

// ═══════════════════════════════════════════════════════════════════════════
// BATCH OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Example: Batch Stream Creation
 */
export const exampleBatchStreamsCreated = (count: number, txHash: string) => {
  toast.success({
    title: "Batch Streams Created",
    description: `Successfully created ${count} payment streams`,
    txHash,
    duration: 6000,
  });
};

/**
 * Example: Batch Operation Failed
 */
export const exampleBatchOperationFailed = (successCount: number, totalCount: number) => {
  toast.warning({
    title: "Partial Success",
    description: `${successCount} of ${totalCount} operations completed successfully`,
    duration: 7000,
  });
};

// ═══════════════════════════════════════════════════════════════════════════
// COPY & CLIPBOARD
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Example: Copied to Clipboard
 */
export const exampleCopiedToClipboard = (item: string = "Address") => {
  toast.success({
    title: "Copied!",
    description: `${item} copied to clipboard`,
    duration: 2000,
  });
};

// ═══════════════════════════════════════════════════════════════════════════
// USAGE IN COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Example: Complete Stream Creation Flow
 */
export const exampleCompleteStreamCreation = async () => {
  try {
    // Show pending state
    toast.info({
      title: "Creating Stream",
      description: "Please confirm the transaction in your wallet",
      duration: 5000,
    });

    // Simulate API call
    const result = await createStreamAPI();

    // Show success
    toast.streamCreated(result.txHash);

  } catch (error: any) {
    // Show error
    if (error.code === "INSUFFICIENT_BALANCE") {
      toast.transactionFailed("Insufficient XLM for gas fees");
    } else if (error.code === "USER_REJECTED") {
      toast.info({
        title: "Transaction Cancelled",
        description: "You rejected the transaction",
        duration: 3000,
      });
    } else {
      toast.transactionFailed(error.message);
    }
  }
};

/**
 * Example: Complete Withdrawal Flow
 */
export const exampleCompleteWithdrawal = async (streamId: string) => {
  try {
    toast.info({
      title: "Processing Withdrawal",
      description: "Please wait while we process your request",
      duration: 5000,
    });

    const result = await withdrawFromStreamAPI(streamId);

    toast.withdrawalComplete(
      result.amount,
      result.token,
      result.txHash
    );

  } catch (error: any) {
    toast.transactionFailed(error.message || "Withdrawal failed");
  }
};

// Mock API functions for examples
async function createStreamAPI(): Promise<{ txHash: string }> {
  return { txHash: "mock_tx_hash_123" };
}

async function withdrawFromStreamAPI(streamId: string): Promise<{ amount: string; token: string; txHash: string }> {
  return { amount: "1,250.50", token: "USDC", txHash: "mock_tx_hash_456" };
}
