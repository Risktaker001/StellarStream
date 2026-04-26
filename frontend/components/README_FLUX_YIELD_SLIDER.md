# Flux Yield Comparison Slider

An interactive React component that visualizes the difference in yield between idle funds and streaming funds in StellarStream vaults using a split-view design with a draggable glass divider.

## Features

- **Interactive Draggable Divider**: Smooth drag interactions with mouse, touch, and keyboard support
- **Real-time Yield Calculations**: Automatic calculation and display of yield differences
- **Nebula Glow Effect**: Eye-catching visual effect on the streaming side using cyan/violet gradients
- **Electric Cyan Badges**: Floating labels displaying yield values with neon glow effects
- **Glass Morphism Design**: Follows the Stellar Glass design system
- **Fully Accessible**: ARIA labels, keyboard navigation, and screen reader support
- **Performance Optimized**: React.memo, debouncing, and GPU-accelerated animations
- **Responsive**: Works seamlessly on mobile, tablet, and desktop devices
- **Reduced Motion Support**: Respects user's motion preferences

## Usage

```tsx
import { FluxYieldComparisonSlider } from "@/components/flux-yield-comparison-slider";

function MyComponent() {
  return (
    <FluxYieldComparisonSlider
      principalAmount={10000}
      timePeriod={365}
      idleYieldRate={0.02}
      streamingYieldRate={0.08}
      currency="XLM"
      onSliderChange={(position) => console.log(position)}
      className="w-full h-[500px]"
    />
  );
}
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `principalAmount` | `number` | Yes | - | Principal amount in base currency |
| `timePeriod` | `number` | Yes | - | Time period in days |
| `idleYieldRate` | `number` | Yes | - | Annual yield rate for idle funds (e.g., 0.02 for 2%) |
| `streamingYieldRate` | `number` | Yes | - | Annual yield rate for streaming funds (e.g., 0.08 for 8%) |
| `currency` | `string` | No | `"XLM"` | Currency symbol to display |
| `className` | `string` | No | `""` | Additional CSS classes |
| `onSliderChange` | `(position: number) => void` | No | - | Callback when slider position changes |

## Keyboard Navigation

- **Tab**: Focus the divider
- **Arrow Left**: Move divider left by 5%
- **Arrow Right**: Move divider right by 5%

## Demo

Visit `/demo/flux-yield-slider` to see the component in action with interactive controls.

## Implementation Details

### Components

- **FluxYieldComparisonSlider**: Main container component
- **GlassDivider**: Draggable divider with glass morphism styling
- **SplitView**: Layout manager for left/right panels
- **NebulaGlowOverlay**: Animated gradient overlay effect
- **ElectricCyanBadge**: Floating label component

### Utilities

- **yield-calculator.ts**: Mathematical functions for yield calculations
  - `calculateSimpleYield()`: Simple interest calculation
  - `calculateYieldDifference()`: Percentage difference calculation
  - `formatCurrency()`: Currency formatting
  - `formatPercentage()`: Percentage formatting

### Performance

- Debounced calculations (50ms) for smooth dragging
- React.memo for child components
- GPU-accelerated animations with CSS transforms
- Optimized re-renders with useMemo and useCallback

### Accessibility

- ARIA role="slider" with proper attributes
- Keyboard navigation support
- Focus indicators
- aria-live regions for dynamic content
- Respects prefers-reduced-motion

## Browser Support

- Modern browsers with ES6+ support
- Framer Motion for animations
- CSS backdrop-filter for glass morphism

## Dependencies

- React 18+
- Framer Motion
- Tailwind CSS
- TypeScript
