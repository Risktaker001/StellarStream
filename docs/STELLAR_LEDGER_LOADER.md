# Stellar Ledger Loader Component

## Overview

A full-screen overlay component that displays while waiting for the Stellar blockchain ledger to close. Features a 3D rotating cube with Stellar branding, real-time progress tracking, and smooth animations powered by Framer Motion.

## Design Philosophy

The loader follows the **Stellar Glass Design System** with:
- Glass morphism effects with backdrop blur
- Neon cyan (#00f5ff) and hyper violet (#8a00ff) gradients
- 3D perspective animations
- Smooth entrance/exit transitions
- Accessibility-first approach

## Features

### 🎨 Visual Design
- **3D Rotating Cube**: Smooth 3D animation with 6 faces featuring Stellar gradients
- **Glow Effects**: Pulsing radial gradient background with cyan/violet colors
- **Blurred Background**: Heavy backdrop blur (24px) for focus
- **Glass Morphism**: Semi-transparent overlays with border highlights

### 📊 Progress Tracking
- **Real-time Progress Bar**: Fills from 0-100% based on estimated duration
- **Shimmer Effect**: Animated gradient overlay on progress bar
- **Percentage Display**: Live percentage counter below progress bar
- **Pulsing Indicators**: Three animated dots showing active state

### ⚡ Animations
- **Entrance**: Scale + fade in with spring physics
- **Exit**: Scale + fade out with smooth easing
- **3D Rotation**: Continuous Y-axis rotation with subtle X-axis tilt
- **Glow Pulse**: Breathing effect on background glow
- **Shimmer**: Moving highlight across progress bar

## Component API

### Props

```typescript
interface StellarLedgerLoaderProps {
  isOpen: boolean;              // Controls visibility
  message?: string;             // Custom message text
  estimatedDuration?: number;   // Duration in milliseconds
  onComplete?: () => void;      // Callback when progress reaches 100%
}
```

### Default Values

```typescript
{
  message: "Waiting for Stellar Ledger to close...",
  estimatedDuration: 5000, // 5 seconds
}
```

## Usage Examples

### Basic Usage

```tsx
import { StellarLedgerLoader } from "@/components/stellar-ledger-loader";
import { useState } from "react";

function StreamCreation() {
  const [isWaiting, setIsWaiting] = useState(false);

  const createStream = async () => {
    setIsWaiting(true);
    
    try {
      // Submit transaction to Stellar
      await submitTransaction();
    } finally {
      setIsWaiting(false);
    }
  };

  return (
    <>
      <button onClick={createStream}>Create Stream</button>
      
      <StellarLedgerLoader
        isOpen={isWaiting}
        onComplete={() => setIsWaiting(false)}
      />
    </>
  );
}
```

### Custom Message & Duration

```tsx
<StellarLedgerLoader
  isOpen={isWaiting}
  message="Processing your withdrawal..."
  estimatedDuration={7000}
  onComplete={handleComplete}
/>
```

### With Transaction Feedback

```tsx
function WithdrawFunds() {
  const [isWaiting, setIsWaiting] = useState(false);

  const handleWithdraw = async () => {
    setIsWaiting(true);

    try {
      const result = await withdrawFromStream();
      
      // Show success toast after loader completes
      toast.success({
        title: "Withdrawal Complete",
        description: `${result.amount} ${result.token} transferred`,
        txHash: result.txHash,
      });
    } catch (error) {
      toast.error({
        title: "Withdrawal Failed",
        description: error.message,
      });
    } finally {
      setIsWaiting(false);
    }
  };

  return (
    <>
      <button onClick={handleWithdraw}>Withdraw</button>
      
      <StellarLedgerLoader
        isOpen={isWaiting}
        message="Waiting for ledger confirmation..."
        onComplete={() => {
          // Optional: Add delay before hiding
          setTimeout(() => setIsWaiting(false), 500);
        }}
      />
    </>
  );
}
```

## Integration Points

### Where to Use

1. **Stream Creation**: When creating a new payment stream
2. **Withdrawals**: When withdrawing funds from a stream
3. **Stream Cancellation**: When cancelling an active stream
4. **Token Approvals**: When approving token spending
5. **Any Stellar Transaction**: Any operation requiring ledger confirmation

### Recommended Flow

```
User Action → Show Loader → Submit Transaction → Wait for Ledger → Hide Loader → Show Result Toast
```

## Technical Details

### Dependencies

- `framer-motion`: For animations and transitions
- `react`: Hooks (useState, useEffect)
- Next.js 16+ with App Router

### Performance

- **Lightweight**: Minimal DOM elements
- **GPU Accelerated**: Uses transform3d for smooth 60fps animations
- **Efficient Updates**: Progress updates every 16ms (60fps)
- **Clean Unmount**: Clears intervals on component unmount

### Accessibility

- **Keyboard Navigation**: Fully accessible via keyboard
- **Screen Readers**: Semantic HTML with proper ARIA labels
- **Reduced Motion**: Respects `prefers-reduced-motion` media query
- **Focus Management**: Traps focus within overlay when open

## Styling

### CSS Variables Used

```css
--stellar-primary: #00f5ff;    /* Cyan */
--stellar-secondary: #8a00ff;  /* Violet */
--stellar-background: #030303; /* Dark background */
--stellar-foreground: #ffffff; /* White text */
```

### Tailwind Classes

The component uses Tailwind CSS v4 with custom utilities:
- `glass-card`: Glass morphism effect
- `liquid-chrome`: Animated gradient text
- `neon-glow`: Cyan glow effect
- `font-heading`: Lato font family
- `font-body`: Poppins font family

## Browser Support

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

### Fallbacks

- Backdrop blur falls back to solid overlay on unsupported browsers
- 3D transforms degrade gracefully to 2D on older devices

## Demo

Visit `/demo/ledger-loader` to see the component in action with interactive controls.

## Customization

### Changing Colors

Edit the gradient colors in the component:

```tsx
// Change cube colors
background: "linear-gradient(90deg, #YOUR_COLOR_1 0%, #YOUR_COLOR_2 100%)"

// Change glow color
background: "radial-gradient(circle, rgba(YOUR_RGB, 0.4) 0%, transparent 70%)"
```

### Adjusting Animation Speed

```tsx
// Rotation speed
transition={{
  rotateY: {
    duration: 3, // Change this value
    repeat: Infinity,
    ease: "linear",
  },
}}
```

### Custom Progress Bar Style

```tsx
// In the progress bar section
style={{
  background: "linear-gradient(90deg, #YOUR_START 0%, #YOUR_END 100%)",
  boxShadow: "0 0 20px rgba(YOUR_RGB, 0.6)",
}}
```

## Best Practices

### ✅ Do

- Use for operations that require ledger confirmation
- Set realistic `estimatedDuration` (5-7 seconds typical)
- Provide clear, action-specific messages
- Handle errors gracefully with toast notifications
- Clean up state in `onComplete` callback

### ❌ Don't

- Use for instant operations (< 1 second)
- Block user interaction unnecessarily
- Forget to handle the `onComplete` callback
- Use generic messages like "Loading..."
- Leave loader open indefinitely

## Troubleshooting

### Loader doesn't appear

```tsx
// Ensure isOpen is properly controlled
const [isOpen, setIsOpen] = useState(false);

// Check z-index conflicts
// Component uses z-50, ensure no higher z-index elements
```

### Progress bar doesn't animate

```tsx
// Verify estimatedDuration is set
<StellarLedgerLoader
  isOpen={true}
  estimatedDuration={5000} // Must be > 0
/>
```

### Animation performance issues

```tsx
// Reduce animation complexity on low-end devices
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

// Conditionally disable complex animations
```

## Future Enhancements

- [ ] Add sound effects option
- [ ] Support for custom 3D models
- [ ] Network status indicator
- [ ] Retry mechanism for failed transactions
- [ ] Multiple loader themes
- [ ] Confetti animation on success

## Related Components

- `toast.tsx`: For post-transaction feedback
- `toast-provider.tsx`: Toast notification system
- `stellar-address-input.tsx`: Address validation

## Support

For issues or questions:
1. Check the demo page at `/demo/ledger-loader`
2. Review this documentation
3. Check browser console for errors
4. Verify Framer Motion is installed

## License

Part of the StellarStream project. See main LICENSE file.
