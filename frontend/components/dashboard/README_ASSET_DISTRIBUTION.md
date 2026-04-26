# Asset Distribution Chart

A semi-transparent donut chart component that displays the distribution of assets currently being streamed by the user, following the "Donut Glass" design pattern with Stellar Glass aesthetics.

## Features

- **Donut Glass Design**: Semi-transparent donut chart with glassmorphism effects
- **Nebula Gradients**: Each segment uses unique gradient colors from the Stellar design system
- **Interactive Hover**: Segments "pop out" when hovered with enhanced glow effects
- **Dynamic Center Text**: Shows total value by default, switches to individual token value on hover
- **Custom Tooltips**: Stellar Glass styled tooltips with blur and thin borders
- **Responsive Legend**: Interactive legend items that sync with chart hover states
- **Accessibility**: Keyboard navigation and screen reader support

## Installation

The component uses Recharts which is already installed in the project:

```json
"recharts": "^3.7.0"
```

## Usage

### Basic Usage

```tsx
import AssetDistributionChart from "@/components/dashboard/asset-distribution-chart";

const assets = [
  {
    token: "USDC",
    amount: 15000,
    usdValue: 15000,
    color: "#00f5ff",
  },
  {
    token: "XLM",
    amount: 50000,
    usdValue: 10000,
    color: "#8a00ff",
  },
];

<AssetDistributionChart assets={assets} />
```

### With Glass Card Container

```tsx
<div className="glass-card p-8">
  <h2 className="text-2xl font-bold mb-6">Asset Distribution</h2>
  <AssetDistributionChart assets={assets} />
</div>
```

### Example Component

See `asset-distribution-example.tsx` for a complete implementation with:
- Glass card container
- Header section
- Usage instructions
- Sample data

## Props

### AssetDistributionChart

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `assets` | `AssetData[]` | Yes | Array of asset data to display |
| `className` | `string` | No | Additional CSS classes |

### AssetData Interface

```typescript
interface AssetData {
  token: string;      // Token symbol (e.g., "USDC", "XLM")
  amount: number;     // Token amount
  usdValue: number;   // USD value of the asset
  color: string;      // Hex color (optional, gradients are auto-assigned)
}
```

## Design Patterns

### Donut Glass

The chart implements the "Donut Glass" pattern with:
- Semi-transparent background (`rgba(10, 10, 20, 0.85)`)
- Backdrop blur effect (`blur(24px)`)
- Subtle border (`1px solid rgba(255, 255, 255, 0.1)`)
- Glass sheen overlay (radial gradient)

### Nebula Gradients

Five unique gradient combinations:
1. **Nebula Cyan**: `#00f5ff → #00d4e6`
2. **Nebula Violet**: `#8a00ff → #b84dff`
3. **Nebula Pink**: `#ff3b5c → #ff6b88`
4. **Nebula Amber**: `#ffb300 → #ffd54f`
5. **Nebula Emerald**: `#00e676 → #69f0ae`

## Interactions

### Hover Effects

1. **Chart Segment Hover**:
   - Segment expands by 10px
   - Enhanced glow effect
   - Center text updates to show token value
   - Other segments fade to 50% opacity

2. **Legend Item Hover**:
   - Background lightens
   - Border becomes more visible
   - Slight upward translation
   - Syncs with chart segment

### Active States

- Active segments have enhanced drop shadow
- Active legend items show cyan accent color
- Smooth transitions (0.3s ease)

## Styling

### Custom CSS Variables

The component uses inline styles but respects global CSS variables:
- `--stellar-primary`: `#00f5ff`
- `--stellar-secondary`: `#8a00ff`
- `--stellar-background`: #030303`

### Typography

- **Headings**: Syne font family
- **Values**: Space Mono (monospace)
- **Labels**: Uppercase with letter spacing

## Integration with Streaming Protocol

### Fetching Real Data

```typescript
// Example: Fetch user's streaming assets
async function fetchStreamingAssets(userAddress: string) {
  const streams = await getActiveStreams(userAddress);
  
  const assetMap = new Map<string, { amount: number; usdValue: number }>();
  
  streams.forEach(stream => {
    const existing = assetMap.get(stream.token) || { amount: 0, usdValue: 0 };
    assetMap.set(stream.token, {
      amount: existing.amount + stream.remainingAmount,
      usdValue: existing.usdValue + (stream.remainingAmount * stream.tokenPrice),
    });
  });
  
  return Array.from(assetMap.entries()).map(([token, data]) => ({
    token,
    ...data,
    color: getTokenColor(token),
  }));
}
```

### Real-time Updates

```typescript
"use client";

import { useEffect, useState } from "react";
import AssetDistributionChart from "./asset-distribution-chart";

export default function LiveAssetDistribution({ userAddress }: { userAddress: string }) {
  const [assets, setAssets] = useState<AssetData[]>([]);
  
  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchStreamingAssets(userAddress);
      setAssets(data);
    };
    
    fetchData();
    const interval = setInterval(fetchData, 30000); // Update every 30s
    
    return () => clearInterval(interval);
  }, [userAddress]);
  
  return <AssetDistributionChart assets={assets} />;
}
```

## Accessibility

- Semantic HTML structure
- ARIA labels for screen readers
- Keyboard navigation support
- Focus indicators
- Reduced motion support (respects `prefers-reduced-motion`)

## Performance

- Optimized re-renders with React hooks
- Efficient SVG gradients
- CSS transitions instead of JavaScript animations
- Responsive container queries

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (with `-webkit-backdrop-filter`)
- Mobile: Responsive design with touch support

## Customization

### Custom Colors

Override gradient colors by modifying the `nebulaGradients` array:

```typescript
const nebulaGradients = [
  { id: "custom-1", colors: ["#yourColor1", "#yourColor2"] },
  // ... more gradients
];
```

### Chart Dimensions

Adjust inner/outer radius in the `<Pie>` component:

```tsx
<Pie
  innerRadius={80}  // Adjust for thicker/thinner donut
  outerRadius={110}
  // ...
/>
```

### Animation Speed

Modify transition duration in CSS:

```css
transition: all 0.3s ease; /* Change 0.3s to your preference */
```

## Troubleshooting

### Chart not rendering

- Ensure Recharts is installed: `npm install recharts`
- Check that `assets` prop has valid data
- Verify `usdValue` is a positive number

### Gradients not showing

- Check browser support for SVG gradients
- Ensure gradient IDs are unique
- Verify `fill` attribute uses `url(#gradient-id)`

### Hover not working

- Check z-index stacking
- Ensure pointer-events are not disabled
- Verify event handlers are attached

## Related Components

- `stream-chart.tsx` - Line chart for stream progress
- `xlm-balance-orb.tsx` - Balance indicator with glass design
- `token-flow-badge.tsx` - Token flow indicators

## Future Enhancements

- [ ] Add animation on initial load
- [ ] Support for custom tooltip content
- [ ] Export chart as image
- [ ] Add comparison mode (current vs previous period)
- [ ] Support for nested donut charts (sub-categories)
- [ ] Add drill-down functionality

## License

Part of the StellarStream project.
