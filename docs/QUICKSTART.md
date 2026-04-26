# Quick Start Guide

## Installation

```bash
cd StellarStream
npm install
```

## Run Development Server

```bash
npm run dev
```

Then open your browser to the URL shown (typically `http://localhost:5173`)

## Run Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode (for development)
npm run test:watch
```

## Build for Production

```bash
npm run build
```

## Using the Component

### Basic Usage

```tsx
import { TransactionPendingOrb } from './components/TransactionPendingOrb';
import { useState } from 'react';

function App() {
  const [walletStatus, setWalletStatus] = useState('idle');

  return (
    <>
      <YourContent />
      <TransactionPendingOrb walletStatus={walletStatus} />
    </>
  );
}
```

### With Soroban Wallet

```tsx
import { useSorobanWallet } from './examples/SorobanIntegration';
import { TransactionPendingOrb } from './components/TransactionPendingOrb';

function SorobanApp() {
  const { walletStatus, signTransaction } = useSorobanWallet();

  const handleTransaction = async () => {
    await signTransaction({
      id: 'tx-123',
      operation: 'payment'
    });
  };

  return (
    <>
      <button onClick={handleTransaction}>Send Payment</button>
      <TransactionPendingOrb walletStatus={walletStatus} />
    </>
  );
}
```

## Component States

The orb responds to these wallet states:

- `idle` - Hidden (no transaction)
- `pending` - Visible with breathing animation (awaiting signature)
- `signed` - Hidden immediately (transaction signed)
- `rejected` - Hidden immediately (transaction rejected)

## Key Features Demonstrated

1. Click "Simulate Transaction" button
2. Watch the orb appear in bottom-right corner
3. Notice the smooth breathing animation
4. Orb disappears automatically after 5 seconds (simulated signature)
5. Try it multiple times to see consistent behavior

## Accessibility Testing

To test reduced motion support:

1. Enable "Reduce Motion" in your OS settings:
   - macOS: System Preferences → Accessibility → Display → Reduce motion
   - Windows: Settings → Ease of Access → Display → Show animations
2. Reload the page
3. The orb will appear without animation

## Performance Notes

- Component uses CSS-only animations (no JavaScript loops)
- Non-blocking (pointer-events: none)
- No layout shifts (CSS containment)
- Minimal re-renders (state-driven visibility)
- Clean effect cleanup (no memory leaks)

## Browser Compatibility

Tested and working on:
- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

## Troubleshooting

### Orb not appearing
- Check that `walletStatus` is set to `'pending'`
- Verify the component is rendered in your JSX
- Check browser console for errors

### Animation not working
- Ensure CSS file is imported
- Check if "Reduce Motion" is enabled (animation disabled by design)
- Verify browser supports CSS animations

### Tests failing
- Run `npm install` to ensure all dependencies are installed
- Check that jsdom is properly configured in vite.config.ts
- Ensure you're using Node.js 18+ for best compatibility
