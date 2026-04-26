# Copy Ripple Component

A G-Address display component with an electric cyan ripple effect that expands from the click point when copying.

## Features

- **Electric Cyan Ripple**: Radial gradient ripple expands from click position
- **Clipboard Copy**: Automatic copy to clipboard with visual feedback
- **Click Position Tracking**: Ripple originates from exact click location
- **Visual Feedback**: Icon changes to checkmark with tooltip
- **Keyboard Accessible**: Full keyboard navigation support
- **Responsive Design**: Adapts to mobile and desktop
- **Customizable Content**: Support for custom address display
- **Multiple Ripples**: Handles multiple rapid clicks gracefully

## Installation

```bash
# Copy the component file to your project
cp copy-ripple.tsx your-project/components/
```

## Basic Usage

```tsx
import CopyRipple from './components/copy-ripple';

function MyComponent() {
  return (
    <CopyRipple
      address="GCKFBEIYV2U22IO2BJ4KVJOIP7XPWQGQFKKWXR6DOSJBV7STMAQSMEK"
      label="Stellar Address"
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `address` | `string` | Required | The address to copy |
| `label` | `string` | `"G-Address"` | Label displayed above address |
| `onCopy` | `() => void` | `undefined` | Callback when address is copied |
| `className` | `string` | `""` | Additional CSS classes |
| `children` | `ReactNode` | `undefined` | Custom address display |

## Examples

### Default Display (Shortened)

```tsx
<CopyRipple
  address="GCKFBEIYV2U22IO2BJ4KVJOIP7XPWQGQFKKWXR6DOSJBV7STMAQSMEK"
  label="Stellar Address"
/>
```

Displays: `GCKFBE...AQSMEK`

### Full Address Display

```tsx
<CopyRipple
  address="GCKFBEIYV2U22IO2BJ4KVJOIP7XPWQGQFKKWXR6DOSJBV7STMAQSMEK"
  label="Full Address"
>
  GCKFBEIYV2U22IO2BJ4KVJOIP7XPWQGQFKKWXR6DOSJBV7STMAQSMEK
</CopyRipple>
```

### With Callback

```tsx
<CopyRipple
  address="GBVOL67TMUQBGL4TZYNMY3ZQ5WGQYFPFD5VJRWXR72VA33VFNL225PL5"
  label="Recipient Address"
  onCopy={() => {
    console.log('Address copied!');
    // Track analytics, show notification, etc.
  }}
/>
```

### Custom Styling

```tsx
<CopyRipple
  address="GDQP2KPQGKIHYJGXNUIYOMHARUARCA7DJT5FO2FFOOKY3B2WSQHG4W37"
  label="Stream Sender"
  className="my-custom-class"
/>
```

## Ripple Effect

The ripple effect:
- Expands from the exact click position
- Uses electric cyan color (#00e5ff)
- Radial gradient with opacity falloff
- 800ms animation duration
- Cubic-bezier easing for smooth expansion
- Multiple ripples can exist simultaneously

### Ripple Gradient

```css
background: radial-gradient(
  circle,
  rgba(0, 229, 255, 0.6) 0%,
  rgba(0, 229, 255, 0.3) 30%,
  rgba(0, 229, 255, 0.1) 60%,
  transparent 100%
);
```

## Visual States

### Default State
- Cyan border and background
- Copy icon visible
- Hover effect on button

### Copied State
- Green border and background
- Checkmark icon
- "Copied!" tooltip
- Auto-resets after 2 seconds

### Hover State
- Button scales up (1.05x)
- Brighter background
- Stronger border

### Active State
- Button scales down (0.95x)
- Haptic feedback feel

## Accessibility

### ARIA Attributes
- `aria-label`: Describes button action
- Dynamic label: "Copy address" / "Copied!"

### Keyboard Support
- **Tab**: Focus the copy button
- **Enter/Space**: Trigger copy action
- **Focus Indicator**: 2px cyan outline

### Screen Readers
- Button announces current state
- Label provides context
- Tooltip provides feedback

## Styling

### Colors

**Electric Cyan:**
- Primary: `#00e5ff`
- Background: `rgba(0, 229, 255, 0.1)`
- Border: `rgba(0, 229, 255, 0.3)`
- Ripple: Radial gradient with opacity

**Success Green:**
- Primary: `#00ff88`
- Background: `rgba(0, 255, 136, 0.2)`
- Border: `rgba(0, 255, 136, 0.5)`

**Card:**
- Background: `rgba(10, 10, 20, 0.6)`
- Border: `rgba(100, 100, 120, 0.3)`
- Backdrop blur: `12px`

### Dimensions
- Card padding: `20px 24px`
- Border radius: `16px` (card), `12px` (button)
- Button size: `44px × 44px`
- Icon size: `20px × 20px`

### Typography
- Label: `11px`, uppercase, `0.1em` letter-spacing
- Address: `16px`, monospace font
- Font family: 'Syne' (UI), 'Courier New' (address)

## Animation Details

### Ripple Animation
```css
@keyframes ripple-expand {
  0% {
    width: 0;
    height: 0;
    opacity: 1;
  }
  100% {
    width: 600px;
    height: 600px;
    opacity: 0;
  }
}
```

- Duration: `800ms`
- Easing: `cubic-bezier(0.4, 0, 0.2, 1)`
- Origin: Click position
- Max size: `600px × 600px`

### Tooltip Animation
```css
@keyframes tooltip-fade-in {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

- Duration: `200ms`
- Easing: `ease`
- Direction: Slide up

## Responsive Behavior

### Desktop (>640px)
- Card padding: `20px 24px`
- Address font: `16px`
- Button size: `44px × 44px`
- Icon size: `20px × 20px`

### Mobile (≤640px)
- Card padding: `16px 20px`
- Address font: `14px`
- Button size: `40px × 40px`
- Icon size: `18px × 18px`

## Use Cases

1. **Wallet Addresses**: Display and copy Stellar addresses
2. **Transaction IDs**: Copy transaction hashes
3. **Stream Details**: Copy stream identifiers
4. **Account Info**: Display account public keys
5. **Contract Addresses**: Copy smart contract addresses
6. **API Keys**: Display and copy API credentials

## Browser Support

✅ Chrome, Firefox, Safari, Edge (latest)
✅ Mobile Safari, Chrome Mobile
✅ Clipboard API support required
✅ CSS animations and transforms

## Performance

- **Ripple Management**: Automatic cleanup after animation
- **State Updates**: Minimal re-renders
- **Animation**: GPU-accelerated transforms
- **Memory**: Ripples removed from DOM after completion
- **Multiple Clicks**: Handles rapid clicks without lag

## Best Practices

### DO:
- Use for addresses and identifiers
- Provide clear labels
- Test on mobile devices
- Ensure sufficient contrast
- Handle copy failures gracefully

### DON'T:
- Use for sensitive data without encryption
- Forget to handle clipboard permissions
- Use for very long text (>100 chars)
- Disable the ripple effect
- Skip accessibility testing

## Troubleshooting

### Clipboard Not Working
```tsx
// Check clipboard permissions
if (!navigator.clipboard) {
  console.error('Clipboard API not available');
}
```

### Ripple Not Visible
- Check card overflow is set to `hidden`
- Verify z-index stacking
- Ensure card has position: relative

### Address Not Formatting
- Check address length
- Verify formatAddress function
- Use custom children for full control

## Integration Example

```tsx
import { useState } from 'react';
import CopyRipple from './components/copy-ripple';

function WalletDashboard() {
  const [copyCount, setCopyCount] = useState(0);

  return (
    <div>
      <h2>Your Wallet</h2>
      <CopyRipple
        address="GCKFBEIYV2U22IO2BJ4KVJOIP7XPWQGQFKKWXR6DOSJBV7STMAQSMEK"
        label="Wallet Address"
        onCopy={() => {
          setCopyCount(prev => prev + 1);
          // Show toast notification
          // Track analytics
        }}
      />
      <p>Copied {copyCount} times</p>
    </div>
  );
}
```

## Related Components

- `glitch-text.tsx` - Animated text headers
- `magnetic-button.tsx` - Interactive buttons
- `projection-tabs.tsx` - Tab navigation

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.
