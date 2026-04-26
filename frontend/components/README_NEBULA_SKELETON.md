# Nebula Pulse Skeleton

A futuristic loading skeleton component with a shimmering nebula effect for Glass cards. Replaces outdated spinners with an elegant, animated gradient sweep (Cyan to Violet) that maintains the glass morphism aesthetic.

## Design Pattern: Nebula Pulse

The skeleton features:
- **Soft, blurred gradient** that sweeps across the card (Cyan #00e5ff → Violet #8a2be2)
- **Glass Spec compliance**: 24px rounded corners, backdrop-blur(24px)
- **Radial pulse animations** that create a breathing nebula effect
- **Shimmer glow** on the card border that pulses with the gradient

## Features

- ✨ Multiple variants for different layouts (card, bento-small, bento-large, list-item)
- 🎨 Maintains glass morphism design system
- ♿ Accessible with proper ARIA labels
- 📱 Responsive and adaptive
- 🎭 Smooth animations with hardware acceleration
- 🔧 Fully customizable with className prop

## Usage

### Basic Import

```tsx
import NebulaSkeleton from "@/components/nebula-skeleton";
```

### Card Variant (Default)

Perfect for stream cards, profile cards, or any detailed content card:

```tsx
<NebulaSkeleton variant="card" />
```

Dimensions: 380px × auto (min-height: 400px)

### Bento Grid Variants

For dashboard tiles and grid layouts:

```tsx
{/* Small bento tile */}
<NebulaSkeleton variant="bento-small" />

{/* Large bento tile */}
<NebulaSkeleton variant="bento-large" />
```

Dimensions:
- `bento-small`: 360px × 200px
- `bento-large`: 100% × 320px

### List Item Variant

For list views, tables, or compact layouts:

```tsx
<NebulaSkeleton variant="list-item" />
```

Dimensions: 100% × 80px

### Custom Styling

Add custom classes for additional styling:

```tsx
<NebulaSkeleton 
  variant="card" 
  className="my-custom-class"
/>
```

## Complete Example

```tsx
"use client";

import { useState, useEffect } from "react";
import NebulaSkeleton from "@/components/nebula-skeleton";
import StreamSummaryCard from "@/components/streamsummarycard";

export default function StreamList() {
  const [isLoading, setIsLoading] = useState(true);
  const [streams, setStreams] = useState([]);

  useEffect(() => {
    // Simulate API call
    fetchStreams().then((data) => {
      setStreams(data);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return (
      <div className="stream-grid">
        <NebulaSkeleton variant="card" />
        <NebulaSkeleton variant="card" />
        <NebulaSkeleton variant="card" />
      </div>
    );
  }

  return (
    <div className="stream-grid">
      {streams.map((stream) => (
        <StreamSummaryCard key={stream.id} {...stream} />
      ))}
    </div>
  );
}
```

## Bento Grid Layout Example

```tsx
<div className="bento-grid">
  <NebulaSkeleton variant="bento-small" />
  <NebulaSkeleton variant="bento-small" />
  <NebulaSkeleton variant="bento-small" />
  <NebulaSkeleton variant="bento-small" />
  <div className="bento-large">
    <NebulaSkeleton variant="bento-large" />
  </div>
</div>

<style>{`
  .bento-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
  
  .bento-large {
    grid-column: span 2;
  }
`}</style>
```

## Animation Details

### Nebula Sweep
- **Duration**: 3s
- **Easing**: ease-in-out
- **Effect**: Gradient sweeps from left (-200%) to right (200%)
- **Colors**: Cyan (#00e5ff) and Violet (#8a2be2) with transparency

### Nebula Pulse
- **Duration**: 4s
- **Easing**: ease-in-out
- **Effect**: Radial gradients fade in/out (opacity 0.4 → 0.7)

### Shimmer Glow
- **Duration**: 3s
- **Easing**: ease-in-out
- **Effect**: Border and shadow intensity pulses

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `"card"` \| `"bento-small"` \| `"bento-large"` \| `"list-item"` | `"card"` | Layout variant |
| `className` | `string` | `""` | Additional CSS classes |

## Accessibility

The component includes proper accessibility features:
- `role="status"` for screen readers
- `aria-label="Loading content"` to announce loading state
- Hidden "Loading..." text for screen readers via `.sr-only`

## Design System Integration

The skeleton maintains consistency with the glass card design system:

- **Background**: `rgba(10, 10, 20, 0.85)` with `backdrop-filter: blur(24px)`
- **Border**: `1px solid rgba(0, 229, 255, 0.15)`
- **Border Radius**: `24px` (matching glass card spec)
- **Colors**: Cyan (#00e5ff) and Violet (#8a2be2) from the design system
- **Shadows**: Multi-layered with glow effects

## Performance

- Uses CSS animations (hardware accelerated)
- No JavaScript animations (better performance)
- Efficient with `transform` and `opacity` properties
- Minimal repaints and reflows

## Browser Support

Works in all modern browsers with support for:
- CSS backdrop-filter
- CSS animations
- CSS gradients
- Flexbox and Grid

## Demo

To see all variants in action, use the example component:

```tsx
import NebulaSkeletonExample from "@/components/nebula-skeleton-example";

<NebulaSkeletonExample />
```

## Tips

1. **Match content structure**: The skeleton mimics the structure of actual content for a seamless transition
2. **Use appropriate variants**: Choose the variant that matches your content layout
3. **Consistent timing**: Keep loading states visible for at least 300ms to avoid flashing
4. **Batch loading**: Show multiple skeletons when loading lists or grids

## Related Components

- `StreamSummaryCard` - The actual card component this skeleton represents
- `CrossChainBento` - Bento grid component with nebula effects
- `ToastProvider` - Notification system with glass morphism

## Future Enhancements

Potential improvements:
- Custom color schemes via props
- Adjustable animation speeds
- More layout variants (grid, table, etc.)
- Staggered animation delays for lists
