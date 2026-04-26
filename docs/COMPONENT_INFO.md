# Stellar Address Input Component

## Current Status

✅ Component created: `frontend/components/stellar-address-input.tsx`
✅ Demo page created: `frontend/app/demo/page.tsx`
⚠️ TypeScript errors showing because dependencies need to be installed

## Fix the Errors

Run these commands in the frontend directory:

```bash
cd frontend
npm install
```

This will install all dependencies from package.json and the TypeScript errors will disappear.

## Features Implemented

1. **Validation**
   - Stellar G-Addresses (56 characters, starts with G, uses base32 alphabet)
   - Federated addresses (name*domain.tld format)
   - Debounced validation (300ms delay)

2. **Success State**
   - Green glowing border (`border-green-500` with shadow)
   - Recipient avatar icon (User icon from lucide-react)
   - Success checkmark icon
   - "Valid recipient address" message

3. **Error State**
   - Hyper Violet border (`#8a00ff` - matches your design system)
   - Shake animation (0.5s duration)
   - Alert icon
   - Contextual error messages:
     - "G-Address must be exactly 56 characters"
     - "Invalid federated address format (name*domain.tld)"
     - "Enter a valid G-Address or federated name"

4. **Design Integration**
   - Uses `glass-card` utility from your design system
   - Matches Stellar Glass aesthetic
   - Smooth transitions and animations
   - Monospace font for addresses

## Test Examples

Valid G-Address:
```
GCDNJUBQSX7AJWLJACMJ7I4BC3Z47BQUTMHEICZLE6MU4KQBRYG5JY6B
```

Valid Federated Address:
```
alice*stellar.org
```

Invalid Examples:
```
INVALID123
G123 (too short)
alice@stellar.org (wrong separator)
```

## Component Props

```typescript
interface StellarAddressInputProps {
  value: string;                              // Current input value
  onChange: (value: string) => void;          // Called on input change
  onValidationChange?: (isValid: boolean) => void;  // Called when validation state changes
  placeholder?: string;                       // Input placeholder text
  label?: string;                            // Label text above input
}
```

## Usage Example

```tsx
'use client';

import { useState } from 'react';
import { StellarAddressInput } from '@/components/stellar-address-input';
import NetworkStatusOrb from '@/components/networkstatusorb';

export default function SendPage() {
  const [recipientAddress, setRecipientAddress] = useState('');
  const [isValidAddress, setIsValidAddress] = useState(false);

  const handleSend = () => {
    if (isValidAddress) {
      // Process payment to recipientAddress
      console.log('Sending to:', recipientAddress);
    }
  };

  return (
    <div className="p-8 space-y-8">
      <StellarAddressInput
        value={recipientAddress}
        onChange={setRecipientAddress}
        onValidationChange={setIsValidAddress}
        label="Send To"
        placeholder="Enter recipient address"
      />
      
      <button
        onClick={handleSend}
        disabled={!isValidAddress}
        className="mt-4 px-6 py-3 bg-primary rounded-lg disabled:opacity-50"
      >
        Send Payment
      </button>

      <div className="space-y-2">
        <h4 className="text-white font-semibold">Network Status Widget</h4>
        <p className="text-white/70 text-sm">
          The orb reflects congestion level and pulses faster when lag is higher.
        </p>
        <NetworkStatusOrb congestionLevel={0.3} averageFee={0.002} />
      </div>
    </div>
  );
}
```

---

## New Component: NetworkStatusOrb

### Current Status

✅ Component created: `frontend/components/networkstatusorb.tsx`
✅ Demo snippet added in `frontend/app/demo/page.tsx`

### Description
A compact glowing orb that indicates the current health of the Stellar
network. It uses color transitions (green/yellow/red) to reflect congestion
levels and pulses faster when the network is lagging. Hovering the orb
reveals a tooltip with exact congestion percentage and average fee.

### Props
```ts
interface NetworkStatusOrbProps {
  congestionLevel?: number; // 0 (smooth) to 1 (jammed)
  averageFee?: number;      // optional numeric fee value
  size?: number;            // diameter in pixels (default 20)
}
```

### Example Usage
```tsx
<NetworkStatusOrb congestionLevel={0.75} averageFee={0.005} size={24} />
```
