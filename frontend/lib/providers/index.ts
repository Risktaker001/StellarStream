/**
 * Stellar Providers
 * 
 * This module provides multi-contract support for interacting with both
 * V1 (Legacy) and V2 (Nebula) StellarStream contracts simultaneously.
 */

// Main provider component
export { StellarProvider } from "./StellarProvider";

// Custom hooks
export { useContract, useActiveContract, useBalances, useStellarProvider } from "./StellarProvider";

// Contract constants
export { CONTRACT_ID, NEBULA_CONTRACT_ID } from "./StellarProvider";

// Types
export type {
  ContractVersion,
  ContractConfig,
  BalanceInfo,
  ContractBalance,
  StellarProviderState,
} from "./StellarProvider";
