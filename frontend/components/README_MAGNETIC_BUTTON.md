# Magnetic Button Component

A high-end button with magnetic cursor attraction and haptic feedback for premium transaction actions.

## Overview

The Magnetic Button creates an engaging interaction by subtly following the user's cursor when nearby, providing a "magnetic" feel. Built with framer-motion for smooth, spring-based animations. Features include cursor attraction (5-10px), haptic-style scale down on click, electric cyan background, and expanding hyper violet shadow.

## Features

- **Magnetic Attraction**: Button shifts 5-10px toward cursor for magnetic feel
- **Haptic Feedback**: Scale down to 0.95x on click for tactile response
- **Electric Cyan Background**: Solid gradient background (#00e5ff to #00b8d4)
- **Hyper Violet Shadow**: Expanding shadow on hover (rgba(138, 43, 226))
- **Ripple Effect**: Click activation ripple animation
- **Three Variants**: Primary, secondary, and danger styles
- **Smooth Transitions**: Cubic-bezier easing for premium feel
- **Configurable**: Adjustable magnetic strength
- **Accessible**: Disabled state support

## Installation

Import the component:

```tsx
import MagneticButton from "@/components/magnetic-button";
```

## Basic Usage

```tsx
// Simple magnetic button
<MagneticButton onClick={() => console.log('Signed!')}>
  Sign Transaction
</MagneticButton>

// With variant
<MagneticButton variant="secondary" onClick={handleApprove}>
  Approve
</MagneticButton>

// Custom magnetic strength
<MagneticButton magneticStrength={10} onClick={handleSign}>
  Sign with Wallet
</MagneticButton>

// Disabled state
<MagneticButton disabled>
  Insufficient Balance
</MagneticButton>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | Required | Button content |
| `onClick` | `() => void` | `undefined` | Click handler |
| `disabled` | `boolean` | `false` | Disable button interaction |
| `className` | `string` | `""` | Additional CSS classes |
| `magneticStrength` | `number` | `8` | Magnetic attraction distance (5-10px recommended) |
| `variant` | `"primary" \| "secondary" \| "danger"` | `"primary"` | Button style variant |

## Variants

### Primary (Default)
```tsx
<MagneticButton variant="primary">
  Sign Transaction
</MagneticButton>
```
- Background: Electric cyan gradient (#00e5ff → #00b8d4)
- Shadow: Hyper violet (rgba(138, 43, 226, 0.4))
- Hover Shadow: Expanded violet (rgba(138, 43, 226, 0.6))
- Use: Primary actions, transaction signing

### Secondary
```tsx
<MagneticButton variant="secondary">
  Approve
</MagneticButton>
```
- Background: Hyper violet gradient (#8a2be2 → #6a1bb2)
- Shadow: Cyan (rgba(0, 229, 255, 0.4))
- Hover Shadow: Expanded cyan (rgba(0, 229, 255, 0.6))
- Use: Secondary actions, approvals

### Danger
```tsx
<MagneticButton variant="danger">
  Cancel Stream
</MagneticButton>
```
- Background: Red gradient (#ff4757 → #ee5a6f)
- Shadow: Red (rgba(255, 71, 87, 0.4))
- Hover Shadow: Expanded red (rgba(255, 71, 87, 0.6))
- Use: Destructive actions, cancellations

## Magnetic Strength

Control the attraction distance:

```tsx
// Subtle attraction (5px)
<MagneticButton magneticStrength={5}>
  Subtle
</MagneticButton>

// Default attraction (8px)
<MagneticButton magneticStrength={8}>
  Default
</MagneticButton>

// Strong attraction (10px)
<MagneticButton magneticStrength={10}>
  Strong
</MagneticButton>
```

**Recommended values**: 5-10px for optimal UX

## Use Cases

### 1. Transaction Signing
```tsx
<MagneticButton
  variant="primary"
  onClick={handleSignTransaction}
  disabled={!wallet.connected}
>
  Sign Transaction
</MagneticButton>
```

### 2. Stream Creation
```tsx
<MagneticButton
  variant="primary"
  onClick={handleCreateStream}
  magneticStrength={9}
>
  Create Stream
</MagneticButton>
```

### 3. Governance Voting
```tsx
<MagneticButton
  variant="secondary"
  onClick={handleVote}
>
  Cast Vote
</MagneticButton>
```

### 4. Fund Withdrawal
```tsx
<MagneticButton
  variant="primary"
  onClick={handleWithdraw}
  disabled={balance === 0}
>
  Withdraw Funds
</MagneticButton>
```

### 5. Stream Cancellation
```tsx
<MagneticButton
  variant="danger"
  onClick={handleCancel}
>
  Cancel Stream
</MagneticButton>
```

### 6. Wallet Connection
```tsx
<MagneticButton
  variant="primary"
  onClick={connectWallet}
  magneticStrength={10}
>
  Connect Wallet
</MagneticButton>
```

## Design Specifications

### Colors

**Primary Variant:**
- Background: `linear-gradient(135deg, #00e5ff, #00b8d4)`
- Shadow: `0 8px 32px rgba(138, 43, 226, 0.4)`
- Hover Shadow: `0 12px 48px rgba(138, 43, 226, 0.6)`

**Secondary Variant:**
- Background: `linear-gradient(135deg, #8a2be2, #6a1bb2)`
- Shadow: `0 8px 32px rgba(0, 229, 255, 0.4)`
- Hover Shadow: `0 12px 48px rgba(0, 229, 255, 0.6)`

**Danger Variant:**
- Background: `linear-gradient(135deg, #ff4757, #ee5a6f)`
- Shadow: `0 8px 32px rgba(255, 71, 87, 0.4)`
- Hover Shadow: `0 12px 48px rgba(255, 71, 87, 0.6)`

### Dimensions
- Padding: `16px 48px`
- Font Size: `16px`
- Font Weight: `700`
- Border Radius: `12px`
- Letter Spacing: `0.05em`

### Animations

**Magnetic Attraction:**
- Distance: 5-10px (configurable)
- Timing: Real-time cursor tracking
- Easing: Calculated based on distance

**Haptic Click:**
- Scale: `0.95` (5% reduction)
- Duration: `0.15s`
- Easing: `cubic-bezier(0.4, 0, 0.2, 1)`

**Shadow Expansion:**
- Default: `8px blur, 32px spread`
- Hover: `12px blur, 48px spread`
- Transition: `0.15s`

**Ripple Effect:**
- Size: `300px` diameter
- Duration: `0.6s`
- Opacity: `0.3`

## Interaction Behavior

### Magnetic Effect
1. Cursor enters button area
2. Calculate distance from cursor to button center
3. Apply proportional attraction (closer = stronger)
4. Button shifts toward cursor (5-10px max)
5. Cursor leaves → button returns to original position

### Click Feedback
1. Mouse down → scale to 0.95x
2. Ripple animation starts from click point
3. Mouse up → scale returns to 1.0x
4. onClick callback fires

### Hover State
1. Mouse enters → shadow expands
2. Gradient overlay fades in
3. Mouse leaves → shadow contracts

## Performance

- **Mouse Tracking**: Optimized with useRef for no re-renders
- **Transforms**: GPU-accelerated (translate, scale)
- **Transitions**: Hardware-accelerated properties only
- **Memory**: Minimal state (position, hover, pressed)
- **Frame Rate**: 60fps smooth animations

## Accessibility

### Keyboard Support
- **Tab**: Focus button
- **Enter/Space**: Activate button
- **Escape**: Remove focus

### Disabled State
- Reduced opacity (0.5)
- Cursor: not-allowed
- No magnetic effect
- No click handler

### Screen Readers
- Button role preserved
- Disabled state announced
- Click action announced

## Browser Support

✅ Chrome, Firefox, Safari, Edge (latest)  
✅ Mobile Safari, Chrome Mobile  
✅ Supports CSS transforms and transitions

## Integration Examples

### With Form
```tsx
<form onSubmit={handleSubmit}>
  <input type="text" placeholder="Amount" />
  <MagneticButton variant="primary" type="submit">
    Create Stream
  </MagneticButton>
</form>
```

### With Loading State
```tsx
const [loading, setLoading] = useState(false);

<MagneticButton
  variant="primary"
  onClick={async () => {
    setLoading(true);
    await signTransaction();
    setLoading(false);
  }}
  disabled={loading}
>
  {loading ? 'Signing...' : 'Sign Transaction'}
</MagneticButton>
```

### With Icon
```tsx
<MagneticButton variant="primary">
  <svg>...</svg>
  Sign Transaction
</MagneticButton>
```

### Multiple Buttons
```tsx
<div className="flex gap-4">
  <MagneticButton variant="secondary" onClick={handleCancel}>
    Cancel
  </MagneticButton>
  <MagneticButton variant="primary" onClick={handleConfirm}>
    Confirm
  </MagneticButton>
</div>
```

## Best Practices

### DO:
- Use for primary transaction actions
- Set appropriate magnetic strength (5-10px)
- Provide clear button labels
- Disable when action unavailable
- Use danger variant for destructive actions
- Test on mobile devices

### DON'T:
- Overuse (limit to 1-2 per screen)
- Use for navigation links
- Set magnetic strength > 15px
- Use without clear purpose
- Forget disabled states
- Use for non-critical actions

## Styling

### Custom Wrapper
```tsx
<div className="flex justify-center">
  <MagneticButton variant="primary">
    Sign Transaction
  </MagneticButton>
</div>
```

### With Additional Classes
```tsx
<MagneticButton
  variant="primary"
  className="w-full md:w-auto"
>
  Sign Transaction
</MagneticButton>
```

## Technical Implementation

### Magnetic Effect Algorithm
1. Get button bounding rectangle
2. Calculate button center point
3. Calculate cursor distance from center
4. Normalize distance vector
5. Apply magnetic strength with falloff
6. Update button position via framer-motion springs

### State Management
- `x`: framer-motion spring for horizontal offset
- `y`: framer-motion spring for vertical offset
- `isHovered`: Boolean for shadow expansion

### Framer Motion Integration
- **Springs**: `useSpring` with stiffness: 150, damping: 15
- **whileTap**: Scale animation (0.95x) on click
- **Smooth Transitions**: Hardware-accelerated transforms
- **Performance**: GPU-accelerated, 60fps animations

### Performance Optimizations
- useRef for button element (no re-renders)
- Framer-motion springs (optimized animations)
- Transform-only animations (GPU)
- Hardware-accelerated properties

## Related Components

- `glitch-text.tsx` - Animated headers
- `biometric-security-toggle.tsx` - Security toggles
- `nebula-skeleton.tsx` - Loading states

## Future Enhancements

- [ ] Sound effects on click
- [ ] Haptic feedback API (mobile)
- [ ] Custom gradient colors
- [ ] Animation speed control
- [ ] Multiple magnetic zones
- [ ] Particle effects on click

## Example Page

See `magnetic-button-example.tsx` for:
- Interactive demo with all variants
- Real-time interaction stats
- Use case examples
- Feature showcase
- Responsive design
