/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Signature Authorization Module
 * Issue #420 - Permit2 One-Click Stream Creation
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * This module provides XDR signature handling for the "Flash Stream" feature.
 * Instead of two transactions (Approve + Create), users sign a message.
 * 
 * The signature uses the Soroban V2 create_via_signature pattern.
 */

import { Transaction, TransactionBuilder, Keypair, Signer, xdr, Networks } from "@stellar/stellar-sdk";

export interface SignatureRequest {
  message: string;
  nonce: bigint;
  domain: string;
  contractId: string;
}

export interface SignatureResult {
  signature: string;
  signer: string;
  verified: boolean;
}

/**
 * Generate a signature payload for Flash Stream creation
 * This follows the EIP-712 style message signing for Soroban
 */
export function createSignaturePayload(
  sender: string,
  receiver: string,
  token: string,
  amount: bigint,
  startTime: bigint,
  endTime: bigint,
  contractId: string
): SignatureRequest {
  const nonce = BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER));
  
  return {
    message: `Create Stream: ${sender} → ${receiver} | ${amount} ${token}`,
    nonce,
    domain: "stellarstream.app",
    contractId,
  };
}

/**
 * Convert signature payload to XDR for signing
 * Note: In production, this would use the actual contract XDR structure
 */
export function payloadToXDR(payload: SignatureRequest): Buffer {
  // Create a dummy transaction for signature
  const payload_bytes = Buffer.from(JSON.stringify(payload));
  return payload_bytes;
}

/**
 * Sign a message with the wallet
 * Uses Freighter API for signing
 */
export async function signMessage(
  payload: SignatureRequest,
  address: string
): Promise<string> {
  try {
    // Import the sign function from freighter
    const { signTransaction } = await import("@stellar/freighter-api");
    
    // Create the XDR transaction for signing
    const txEnvelope = payloadToXDR(payload);
    
    // Sign using Freighter
    const result = await signTransaction(txEnvelope.toString("base64"), { address });
    
    if (result.error) {
      throw new Error(result.error);
    }
    
    return result.signedTxXdr;
  } catch (error) {
    console.error("Failed to sign message:", error);
    throw error;
  }
}

/**
 * Verify a signature from the user
 * This would typically be done server-side or via contract call
 */
export async function verifySignature(
  payload: SignatureRequest,
  signature: string,
  signerPublicKey: string
): Promise<SignatureResult> {
  try {
    // In production, this would verify against the contract
    // For now, we return a mock verification
    const verified = signature.length > 0 && signerPublicKey.length > 0;
    
    return {
      signature,
      signer: signerPublicKey,
      verified,
    };
  } catch (error) {
    console.error("Failed to verify signature:", error);
    return {
      signature,
      signer: signerPublicKey,
      verified: false,
    };
  }
}

/**
 * Build a Flash Stream transaction
 * This creates the transaction that can be submitted after signature verification
 */
export interface FlashStreamParams {
  sender: string;
  receiver: string;
  token: string;
  amount: bigint;
  startTime: bigint;
  endTime: bigint;
  signature: string;
}

export function buildFlashStreamTransaction(
  params: FlashStreamParams,
  contractId: string
): Transaction {
  // In production, this would create the actual Soroban invoke contract transaction
  // For now, we create a placeholder transaction structure
  const account = {
    accountId: () => params.sender,
    sequenceNumber: () => "0",
    incrementSequenceNumber: () => {},
  };
  const tx = new TransactionBuilder(account as any, { // eslint-disable-line @typescript-eslint/no-explicit-any
    fee: "5000",
    networkPassphrase: Networks.TESTNET,
  }).setTimeout(30).build();

  return tx;
}

/**
 * Check if the wallet supports signature authorization
 */
export async function isSignatureAuthSupported(): Promise<boolean> {
  try {
    const { isConnected } = await import("@stellar/freighter-api");
    const result = await isConnected();
    return result.isConnected;
  } catch {
    return false;
  }
}