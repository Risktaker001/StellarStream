import { useState, useCallback } from 'react';
import { TransactionPendingOrb } from '../components/TransactionPendingOrb';
import type { WalletStatus } from '../types/wallet';

/**
 * Example integration with Soroban wallet
 * This demonstrates how to connect the orb to actual wallet state
 */

interface SorobanTransaction {
  id: string;
  operation: string;
}

export const SorobanIntegration = () => {
  const [walletStatus, setWalletStatus] = useState<WalletStatus>('idle');
  const [txHash, setTxHash] = useState<string>('');

  /**
   * Simulate Soroban transaction submission
   * In real implementation, this would call your Soroban SDK
   */
  const submitTransaction = useCallback(async (tx: SorobanTransaction) => {
    try {
      // Set status to pending when transaction is sent to wallet
      setWalletStatus('pending');
      
      // In real implementation, this would be:
      // const result = await sorobanClient.signTransaction(tx);
      // await sorobanClient.submitTransaction(result);
      
      // Simulate wallet signature delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Simulate random success/failure
      const success = Math.random() > 0.3;
      
      if (success) {
        setWalletStatus('signed');
        setTxHash('0x' + Math.random().toString(16).substring(2, 15));
        
        // Reset after showing success
        setTimeout(() => setWalletStatus('idle'), 2000);
      } else {
        setWalletStatus('rejected');
        
        // Reset after showing rejection
        setTimeout(() => setWalletStatus('idle'), 2000);
      }
    } catch (error) {
      console.error('Transaction failed:', error);
      setWalletStatus('rejected');
      setTimeout(() => setWalletStatus('idle'), 2000);
    }
  }, []);

  const handleSendPayment = () => {
    submitTransaction({
      id: Date.now().toString(),
      operation: 'payment',
    });
  };

  return (
    <div style={{ padding: '40px' }}>
      <h2>Soroban Wallet Integration Example</h2>
      
      <div style={{ marginTop: '20px' }}>
        <p>Status: <strong>{walletStatus}</strong></p>
        {txHash && <p>Transaction Hash: <code>{txHash}</code></p>}
      </div>

      <button 
        onClick={handleSendPayment}
        disabled={walletStatus === 'pending'}
        style={{
          marginTop: '20px',
          padding: '12px 24px',
          fontSize: '16px',
          cursor: walletStatus === 'pending' ? 'not-allowed' : 'pointer',
        }}
      >
        Send Payment
      </button>

      {/* The orb component - automatically shows/hides based on wallet status */}
      <TransactionPendingOrb 
        walletStatus={walletStatus}
        ariaLabel="Soroban transaction status"
      />
    </div>
  );
};

/**
 * Hook pattern for managing wallet state
 * Use this pattern in your actual application
 */
export const useSorobanWallet = () => {
  const [walletStatus, setWalletStatus] = useState<WalletStatus>('idle');

  const signTransaction = useCallback(async (tx: SorobanTransaction) => {
    setWalletStatus('pending');
    
    try {
      // Your Soroban SDK integration here
      // const signed = await wallet.signTransaction(tx);
      // const result = await client.submitTransaction(signed);
      
      setWalletStatus('signed');
      return { success: true };
    } catch (error) {
      setWalletStatus('rejected');
      return { success: false, error };
    } finally {
      // Reset status after a delay
      setTimeout(() => setWalletStatus('idle'), 2000);
    }
  }, []);

  return {
    walletStatus,
    signTransaction,
  };
};
