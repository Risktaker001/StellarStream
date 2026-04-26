import { useEffect, useRef } from 'react';
import type { WalletStatus } from '../types/wallet';
import './TransactionPendingOrb.css';

export interface TransactionPendingOrbProps {
  walletStatus: WalletStatus;
  ariaLabel?: string;
}

export type { WalletStatus };

export const TransactionPendingOrb: React.FC<TransactionPendingOrbProps> = ({
  walletStatus,
  ariaLabel = 'Transaction status',
}) => {
  const liveRegionRef = useRef<HTMLDivElement>(null);
  const isPending = walletStatus === 'pending';

  useEffect(() => {
    if (liveRegionRef.current && isPending) {
      liveRegionRef.current.textContent = 'Awaiting Ledger Authorization...';
    } else if (liveRegionRef.current) {
      liveRegionRef.current.textContent = '';
    }
  }, [isPending]);

  if (!isPending) {
    return null;
  }

  return (
    <div
      className="transaction-pending-orb-container"
      role="status"
      aria-label={ariaLabel}
      aria-live="polite"
    >
      <div className="orb-wrapper">
        <div className="orb" />
      </div>
      <div className="orb-text">Awaiting Ledger Authorization...</div>
      <div ref={liveRegionRef} className="sr-only" aria-live="polite" aria-atomic="true" />
    </div>
  );
};
