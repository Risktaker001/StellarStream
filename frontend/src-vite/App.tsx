import { useState } from 'react';
import { TransactionPendingOrb } from './components/TransactionPendingOrb';
import type { WalletStatus } from './types/wallet';
import './App.css';

function App() {
  const [walletStatus, setWalletStatus] = useState<WalletStatus>('idle');

  const simulateTransaction = () => {
    setWalletStatus('pending');
    
    // Simulate wallet signature after 5 seconds
    setTimeout(() => {
      setWalletStatus(Math.random() > 0.5 ? 'signed' : 'rejected');
      
      // Reset after 1 second
      setTimeout(() => {
        setWalletStatus('idle');
      }, 1000);
    }, 5000);
  };

  return (
    <div className="app">
      <div className="content">
        <h1>Soroban Transaction Pending Orb</h1>
        <p>Current wallet status: <strong>{walletStatus}</strong></p>
        
        <button 
          onClick={simulateTransaction}
          disabled={walletStatus === 'pending'}
          className="simulate-btn"
        >
          {walletStatus === 'pending' ? 'Transaction Pending...' : 'Simulate Transaction'}
        </button>

        <div className="info">
          <h2>Features:</h2>
          <ul>
            <li>✓ Fixed position, bottom-right corner</li>
            <li>✓ 3D-like orb with Hyper Violet glow</li>
            <li>✓ Smooth breathing animation (CSS only)</li>
            <li>✓ Non-blocking, pointer-events: none</li>
            <li>✓ Accessible with ARIA live regions</li>
            <li>✓ Respects prefers-reduced-motion</li>
            <li>✓ No layout shifts (contain: layout)</li>
            <li>✓ Appears on pending, disappears immediately on signed/rejected</li>
          </ul>
        </div>
      </div>

      <TransactionPendingOrb walletStatus={walletStatus} />
    </div>
  );
}

export default App;
