# Nebula Skeleton Visual Guide

Visual reference for the Nebula Pulse skeleton component design specifications.

## Design Specifications

### Glass Card Properties

```
Background: rgba(10, 10, 20, 0.85)
Backdrop Filter: blur(24px)
Border: 1px solid rgba(0, 229, 255, 0.15)
Border Radius: 24px
Box Shadow: Multi-layered with glow effects
```

### Color Palette

```
Primary Cyan: #00e5ff (rgb(0, 229, 255))
Primary Violet: #8a2be2 (rgb(138, 43, 226))
Background Dark: rgba(10, 10, 20, 0.85)
Text Light: #e8eaf6 (rgb(232, 234, 246))
```

### Animation Timings

```
Nebula Sweep: 3s ease-in-out infinite
Nebula Pulse: 4s ease-in-out infinite
Shimmer Glow: 3s ease-in-out infinite
```

## Variant Dimensions

### Card Variant
```
Width: 380px
Height: auto
Min-Height: 400px
Padding: 24px
Gap: 16px

Use Case: Stream cards, profile cards, detailed content
```

### Bento Small Variant
```
Width: 360px
Height: 200px
Padding: 24px
Gap: 16px

Use Case: Dashboard tiles, grid items, compact widgets
```

### Bento Large Variant
```
Width: 100%
Height: 320px
Padding: 24px
Gap: 16px

Use Case: Featured content, hero sections, wide tiles
```

### List Item Variant
```
Width: 100%
Height: 80px
Padding: 24px
Gap: 12px

Use Case: List views, table rows, compact layouts
```

## Animation Effects

### 1. Nebula Sweep (Primary Effect)

The main shimmering gradient that sweeps across the card:

```css
background: linear-gradient(
  110deg,
  transparent 0%,
  transparent 35%,
  rgba(0, 229, 255, 0.15) 45%,
  rgba(138, 43, 226, 0.2) 50%,
  rgba(0, 229, 255, 0.15) 55%,
  transparent 65%,
  transparent 100%
);
background-size: 200% 100%;
animation: nebula-sweep 3s ease-in-out infinite;
filter: blur(20px);
```

**Visual Effect:**
- Gradient moves from left (-200%) to right (200%)
- Creates a "scanning" or "sweeping" effect
- Blurred for soft, nebula-like appearance
- Cyan and violet colors blend smoothly

### 2. Nebula Pulse (Secondary Effect)

Radial gradients that pulse in and out:

```css
background: 
  radial-gradient(ellipse at 20% 30%, rgba(0, 229, 255, 0.08) 0%, transparent 50%),
  radial-gradient(ellipse at 80% 70%, rgba(138, 43, 226, 0.12) 0%, transparent 50%);
animation: nebula-pulse 4s ease-in-out infinite;
```

**Visual Effect:**
- Two elliptical gradients positioned at opposite corners
- Opacity fades between 0.4 and 0.7
- Creates a "breathing" effect
- Adds depth to the skeleton

### 3. Shimmer Glow (Border Effect)

Border and shadow that pulses with the gradient:

```css
animation: shimmer-glow 3s ease-in-out infinite;

/* Keyframes */
0%, 100%: 
  box-shadow: 
    0 0 0 1px rgba(0, 229, 255, 0.05),
    0 8px 40px rgba(0, 0, 0, 0.6),
    0 0 60px rgba(0, 229, 255, 0.04) inset;

50%:
  box-shadow: 
    0 0 0 1px rgba(0, 229, 255, 0.12),
    0 8px 40px rgba(0, 0, 0, 0.6),
    0 0 80px rgba(138, 43, 226, 0.08) inset;
```

**Visual Effect:**
- Border glow intensifies and fades
- Inner shadow shifts from cyan to violet
- Synchronized with the sweep animation
- Enhances the glass morphism effect

## Skeleton Elements

### Header Section
```
┌─────────────────────────────────────┐
│ [████████] ............ [██████]    │  Title bar + Badge
└─────────────────────────────────────┘
```

### Avatar Row (Card Variant)
```
┌─────────────────────────────────────┐
│ ●  [Label]  ──→  [Label]  ●         │  Avatars + Labels
│    [Address]     [Address]          │
└─────────────────────────────────────┘
```

### Content Block
```
┌─────────────────────────────────────┐
│ ┌─────────────────────────────────┐ │
│ │ [Label] .......... [Value]      │ │
│ │ ─────────────────────────────── │ │
│ │ [Label] .......... [Value]      │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### Progress Section (Card Variant)
```
┌─────────────────────────────────────┐
│ [Label] ............... [Percent]   │
│ ▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░   │  Progress bar
│ ........................ [Time]     │
└─────────────────────────────────────┘
```

### Button (Card Variant)
```
┌─────────────────────────────────────┐
│ [████████████████████████████████]  │  Full-width button
└─────────────────────────────────────┘
```

## Element Styles

### Skeleton Bar
```css
background: rgba(255, 255, 255, 0.06);
border-radius: 8px;
position: relative;
overflow: hidden;

/* Animated overlay */
::before {
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(0, 229, 255, 0.1) 50%,
    transparent 100%
  );
  animation: nebula-sweep 2s ease-in-out infinite;
}
```

### Skeleton Circle
```css
background: rgba(255, 255, 255, 0.06);
border-radius: 50%;
position: relative;
overflow: hidden;

/* Animated overlay */
::before {
  background: radial-gradient(
    circle at center,
    rgba(0, 229, 255, 0.15) 0%,
    transparent 70%
  );
  animation: nebula-pulse 2s ease-in-out infinite;
}
```

### Skeleton Block
```css
background: rgba(255, 255, 255, 0.04);
border: 1px solid rgba(255, 255, 255, 0.06);
border-radius: 12px;
padding: 14px 16px;
position: relative;
overflow: hidden;

/* Animated overlay */
::before {
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(138, 43, 226, 0.08) 50%,
    transparent 100%
  );
  animation: nebula-sweep 2.5s ease-in-out infinite;
}
```

## Layout Examples

### Card Variant Layout
```
┌───────────────────────────────────┐
│ [Title] ............... [Badge]   │ ← Header (20px + 24px)
│                                   │
│ ● [From] ──→ [To] ●               │ ← Avatar Row (38px circles)
│                                   │
│ ┌───────────────────────────────┐ │
│ │ Amount Streamed ... 342.75    │ │ ← Content Block
│ │ ───────────────────────────── │ │
│ │ Total ............. 1000 USDC │ │
│ └───────────────────────────────┘ │
│                                   │
│ Stream Progress .......... 34.28% │ ← Progress Section
│ ▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░  │
│ ........................ 7d 12h   │
│                                   │
│ [View Details →]                  │ ← Button (42px height)
└───────────────────────────────────┘
```

### Bento Small Layout
```
┌─────────────────────────┐
│ [Title] ...... [Badge]  │ ← Header
│                         │
│ [Content Line 1]        │ ← Content
│ [Content Line 2]        │
│                         │
│                         │
└─────────────────────────┘
```

### Bento Large Layout
```
┌─────────────────────────────────────┐
│ [Title] .................. [Badge]  │ ← Header
│                                     │
│ [Content Line 1]                    │ ← Content
│ [Content Line 2]                    │
│                                     │
│ [Additional Line 1]                 │ ← Extra content
│ [Additional Line 2]                 │
│ [Additional Line 3]                 │
└─────────────────────────────────────┘
```

### List Item Layout
```
┌─────────────────────────────────────────┐
│ ● [Title Line] ............... [Action] │
│   [Subtitle Line]                       │
└─────────────────────────────────────────┘
```

## Responsive Behavior

### Desktop (> 768px)
- Full dimensions as specified
- All animations enabled
- Optimal blur effects

### Tablet (768px - 1024px)
- Maintains aspect ratios
- May scale down proportionally
- All effects preserved

### Mobile (< 768px)
- Width: 100% (respects container)
- Height: Maintains aspect ratio
- Consider reducing blur for performance

## Color Variations

### Default (Cyan + Violet)
```
Primary: #00e5ff
Secondary: #8a2be2
```

### Alternative Palettes (Future Enhancement)

**Green + Blue:**
```
Primary: #00ff88
Secondary: #0088ff
```

**Orange + Pink:**
```
Primary: #ff8800
Secondary: #ff0088
```

**Gold + Purple:**
```
Primary: #ffd700
Secondary: #9400d3
```

## Accessibility Features

### Screen Reader Support
```html
<div role="status" aria-label="Loading content">
  <!-- Skeleton content -->
  <span class="sr-only">Loading...</span>
</div>
```

### Reduced Motion Support (Future Enhancement)
```css
@media (prefers-reduced-motion: reduce) {
  .nebula-skeleton::before,
  .nebula-skeleton::after,
  .skeleton-bar::before,
  .skeleton-circle::before,
  .skeleton-block::before {
    animation: none;
  }
}
```

## Performance Considerations

### Hardware Acceleration
All animations use `transform` and `opacity` for GPU acceleration:
- ✅ `transform: translateX()`
- ✅ `opacity`
- ❌ Avoid `left`, `top`, `width`, `height`

### Blur Performance
`backdrop-filter: blur(24px)` is GPU-accelerated but can be expensive:
- Limit number of simultaneous skeletons
- Consider reducing blur on mobile
- Test on low-end devices

### Animation Staggering (Future Enhancement)
For lists, consider staggering animation start times:
```css
.skeleton-item:nth-child(1) { animation-delay: 0s; }
.skeleton-item:nth-child(2) { animation-delay: 0.1s; }
.skeleton-item:nth-child(3) { animation-delay: 0.2s; }
```

## Browser Support

### Full Support
- Chrome 76+ (backdrop-filter)
- Firefox 103+ (backdrop-filter)
- Safari 9+ (backdrop-filter with -webkit-)
- Edge 79+ (backdrop-filter)

### Fallback
For browsers without backdrop-filter support:
```css
@supports not (backdrop-filter: blur(24px)) {
  .nebula-skeleton {
    background: rgba(10, 10, 20, 0.95); /* More opaque */
  }
}
```

## Design System Integration

The Nebula Skeleton maintains consistency with the existing design system:

### Typography
- Font Family: 'Syne', 'Space Mono' (monospace for values)
- Font Weights: 400, 600, 700, 800
- Letter Spacing: 0.02em - 0.12em

### Spacing
- Padding: 24px (consistent with glass cards)
- Gap: 16px (between sections)
- Border Radius: 24px (glass card spec), 12px (inner elements)

### Colors
- Matches StreamSummaryCard color palette
- Uses same cyan/violet gradient system
- Consistent opacity values

### Effects
- Same backdrop-blur as glass cards
- Similar box-shadow layering
- Matching border treatments

## Testing Checklist

Visual Testing:
- [ ] All variants render correctly
- [ ] Animations are smooth (60fps)
- [ ] Colors match design system
- [ ] Border radius is consistent (24px)
- [ ] Blur effect is visible

Functional Testing:
- [ ] Accessible to screen readers
- [ ] Keyboard navigation works
- [ ] Works in all supported browsers
- [ ] Responsive on all screen sizes
- [ ] Performance is acceptable

Integration Testing:
- [ ] Transitions smoothly to real content
- [ ] Matches actual content dimensions
- [ ] Works with Suspense boundaries
- [ ] Handles loading state changes

## Future Enhancements

1. **Staggered Animations**: Delay animations for list items
2. **Custom Colors**: Props for color customization
3. **Reduced Motion**: Respect prefers-reduced-motion
4. **Dark/Light Modes**: Adapt to theme
5. **More Variants**: Table, form, modal variants
6. **Animation Speed**: Props to control timing
7. **Pulse Intensity**: Adjustable effect strength
