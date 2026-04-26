# Token Flow Badge Component

An interactive, animated badge component that visually indicates the direction of token streams in the StellarStream application.

## Features

- **Direction Indicators**: Clear visual distinction between incoming and outgoing streams
- **Animated Pulse Effects**: Smooth, continuous animations that draw attention
- **Glass Design Pattern**: Modern glassmorphism styling with backdrop blur
- **Multiple Sizes**: Three size variants (sm, md, lg) for different use cases
- **Accessibility**: Proper contrast ratios and semantic markup

## Design Specifications

### Incoming Streams
- **Color**: Cyan (#00e5ff)
- **Icon**: Arrow pointing down (↓)
- **Animation**: Gentle inward pulse (2s cycle)
- **Effect**: Soft cyan glow and shadow

### Outgoing Streams
- **Color**: Violet (#8a2be2)
- **Icon**: Arrow pointing up (↑)
- **Animation**: Energetic outward pulse (1.8s cycle)
- **Effect**: Soft violet glow and shadow

### Glass Container
- **Shape**: Pill-shaped with rounded corners
- **Border**: 1px semi-transparent border
- **Background**: Semi-transparent with backdrop blur
- **Overlay**: Subtle white gradient for glass effect

## Usage

```tsx
import TokenFlowBadge from '@/components/token-flow-badge';

// Basic usage
<TokenFlowBadge direction="incoming" />
<TokenFlowBadge direction="outgoing" />

// With size variants
<TokenFlowBadge direction="incoming" size="sm" />
<TokenFlowBadge direction="incoming" size="md" /> // default
<TokenFlowBadge direction="incoming" size="lg" />

// With custom styling
<TokenFlowBadge 
  direction="outgoing" 
  size="lg" 
  className="ml-2" 
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `direction` | `"incoming" \| "outgoing"` | - | **Required.** Direction of the stream flow |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Size variant of the badge |
| `className` | `string` | `""` | Additional CSS classes |

## Size Specifications

| Size | Container | Icon Size | Use Case |
|------|-----------|-----------|----------|
| `sm` | 20×32px | 12px | Compact lists, mobile views |
| `md` | 24×40px | 14px | Standard lists, default usage |
| `lg` | 28×48px | 16px | Prominent displays, headers |

## Animation Details

The component uses Framer Motion for smooth animations:

- **Pulse Animation**: Icons scale and fade in continuous loops
- **Container Glow**: Subtle shadow effects that breathe with the pulse
- **Performance**: Optimized with `initial={false}` to prevent layout shifts

## Integration Examples

### Stream List Item
```tsx
<div className="flex items-center gap-3">
  <TokenFlowBadge direction="incoming" />
  <div>
    <div className="text-white font-medium">USDC Stream</div>
    <div className="text-slate-400 text-sm">From: GCKFBEIYTKP...</div>
  </div>
</div>
```

### Dashboard Summary
```tsx
<div className="flex items-center justify-between">
  <span>Active Streams</span>
  <div className="flex gap-2">
    <TokenFlowBadge direction="incoming" size="sm" />
    <span>5</span>
    <TokenFlowBadge direction="outgoing" size="sm" />
    <span>3</span>
  </div>
</div>
```

## Dependencies

- **framer-motion**: For smooth animations
- **lucide-react**: For arrow icons
- **tailwindcss**: For styling

## Accessibility

- Uses semantic HTML structure
- Proper color contrast ratios
- Icons have appropriate stroke width for visibility
- Animations respect user preferences (can be disabled via CSS)

## Testing

The component includes comprehensive tests covering:
- Rendering with different directions
- Size variant application
- Color class application
- Custom className handling
- Icon rendering
- Glass effect elements

Run tests with:
```bash
npm test token-flow-badge.test.tsx
```

## Demo

View the interactive demo at `/demo/token-flow-badge` to see all variants and usage examples.