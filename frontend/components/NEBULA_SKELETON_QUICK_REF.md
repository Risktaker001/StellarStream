# Nebula Skeleton Quick Reference

One-page reference for the Nebula Pulse skeleton component.

## Import

```tsx
import NebulaSkeleton from "@/components/nebula-skeleton";
```

## Props

| Prop | Type | Default | Options |
|------|------|---------|---------|
| `variant` | string | `"card"` | `"card"` \| `"bento-small"` \| `"bento-large"` \| `"list-item"` |
| `className` | string | `""` | Any CSS class |

## Variants

```tsx
// Card - 380px × auto (min 400px)
<NebulaSkeleton variant="card" />

// Bento Small - 360px × 200px
<NebulaSkeleton variant="bento-small" />

// Bento Large - 100% × 320px
<NebulaSkeleton variant="bento-large" />

// List Item - 100% × 80px
<NebulaSkeleton variant="list-item" />
```

## Common Patterns

### Single Item
```tsx
{loading ? <NebulaSkeleton variant="card" /> : <Content />}
```

### List
```tsx
{loading ? (
  <>
    <NebulaSkeleton variant="list-item" />
    <NebulaSkeleton variant="list-item" />
    <NebulaSkeleton variant="list-item" />
  </>
) : (
  items.map(item => <Item key={item.id} {...item} />)
)}
```

### Grid
```tsx
<div className="grid grid-cols-3 gap-6">
  {loading ? (
    Array.from({ length: 6 }).map((_, i) => (
      <NebulaSkeleton key={i} variant="card" />
    ))
  ) : (
    items.map(item => <Card key={item.id} {...item} />)
  )}
</div>
```

### Suspense
```tsx
<Suspense fallback={<NebulaSkeleton variant="card" />}>
  <AsyncContent />
</Suspense>
```

## Animations

- **Nebula Sweep**: 3s - Gradient moves left to right
- **Nebula Pulse**: 4s - Radial gradients breathe
- **Shimmer Glow**: 3s - Border intensity pulses

## Colors

- **Cyan**: `#00e5ff`
- **Violet**: `#8a2be2`
- **Background**: `rgba(10, 10, 20, 0.85)`
- **Border**: `rgba(0, 229, 255, 0.15)`

## Specs

- **Border Radius**: 24px
- **Backdrop Filter**: blur(24px)
- **Padding**: 24px
- **Gap**: 16px

## Accessibility

- ✅ `role="status"`
- ✅ `aria-label="Loading content"`
- ✅ Hidden "Loading..." text

## Performance

- ✅ 60fps animations
- ✅ Hardware accelerated
- ✅ CSS-only (no JS)
- ✅ ~2KB bundle size

## Browser Support

- Chrome 76+
- Firefox 103+
- Safari 9+
- Edge 79+

## Files

- `nebula-skeleton.tsx` - Component
- `nebula-skeleton-example.tsx` - Demo
- `README_NEBULA_SKELETON.md` - Full docs
- `NEBULA_SKELETON_INTEGRATION.md` - Integration guide
- `NEBULA_SKELETON_VISUAL_GUIDE.md` - Design specs

## Tips

1. Match skeleton variant to content type
2. Show for minimum 300ms (avoid flashing)
3. Use correct count for lists
4. Test with slow network
5. Verify accessibility

## Example Component

```tsx
"use client";

import { useState, useEffect } from "react";
import NebulaSkeleton from "@/components/nebula-skeleton";
import StreamSummaryCard from "@/components/streamsummarycard";

export default function StreamList() {
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStreams().then((data) => {
      setStreams(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <NebulaSkeleton variant="card" />
        <NebulaSkeleton variant="card" />
        <NebulaSkeleton variant="card" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {streams.map((stream) => (
        <StreamSummaryCard key={stream.id} {...stream} />
      ))}
    </div>
  );
}
```

## Troubleshooting

**Skeleton doesn't match content size**
→ Use correct variant or add custom className

**Animations are choppy**
→ Check browser support, reduce simultaneous skeletons

**Skeleton flashes briefly**
→ Implement minimum display time (300ms)

**Not accessible**
→ Component has built-in accessibility, ensure proper integration

## Need Help?

- Read: `README_NEBULA_SKELETON.md`
- Integration: `NEBULA_SKELETON_INTEGRATION.md`
- Design: `NEBULA_SKELETON_VISUAL_GUIDE.md`
- Demo: `nebula-skeleton-example.tsx`
