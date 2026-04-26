# Glitch Text Quick Reference

Fast lookup guide for the Glitch Text component.
One-page reference for the Cyberpunk Glitch Text component.

## Import

```tsx
import GlitchText from "@/components/glitch-text";
```

## Basic Usage

```tsx
<GlitchText as="h1">Your Title</GlitchText>
```

## Props Quick Reference

| Prop | Type | Default | Options |
|------|------|---------|---------|
| `as` | string | `"h1"` | h1, h2, h3, h4, h5, h6, span, p |
| `glitchOnHover` | boolean | `true` | true (hover), false (always-on) |
| `glitchIntensity` | string | `"medium"` | low, medium, high |
| `className` | string | `""` | Any CSS classes |
| `children` | ReactNode | Required | Text content |

## Common Patterns

### Hero Title (Always-On)
```tsx
<GlitchText 
  as="h1" 
  glitchOnHover={false} 
  glitchIntensity="high"
  className="text-7xl font-bold"
>
  StellarStream
</GlitchText>
```

### Section Header (Hover)
```tsx
<GlitchText 
  as="h2" 
  glitchIntensity="medium"
  className="text-4xl"
>
  Payment Streams
</GlitchText>
```

### Card Title (Subtle)
```tsx
<GlitchText 
  as="h3" 
  glitchIntensity="low"
  className="text-2xl"
>
  Stream Details
</GlitchText>
```

### With Gradient
```tsx
<GlitchText 
  className="bg-gradient-to-r from-cyan-400 to-violet-600 bg-clip-text text-transparent"
>
  Gradient Text
</GlitchText>
```

### Button Label
```tsx
<button>
  <GlitchText as="span" glitchIntensity="medium">
    Create Stream
  </GlitchText>
</button>
```

## Intensity Guide

| Level | Shift | Opacity | Best For |
|-------|-------|---------|----------|
| Low | 2px | 60% | Subtle effects, small text |
| Medium | 3px | 70% | Standard headers, balanced |
| High | 5px | 80% | Hero sections, dramatic |

## When to Use

✅ **DO USE FOR:**
- Page titles (H1)
- Section headers (H2-H3)
- Card titles
- Modal headers
- Active navigation items
- Call-to-action buttons
- Hero sections

❌ **DON'T USE FOR:**
- Body text
- Paragraphs
- Form labels
- Small text (<16px)
- Light backgrounds
- More than 5 per page

## Mode Selection

| Mode | Trigger | Best For |
|------|---------|----------|
| Hover | On mouse hover | Interactive elements, navigation, cards |
| Always-On | Continuous loop | Hero sections, loading states, status |

## Color Palette

```
Base:   #e8eaf6  (Light Gray)
Cyan:   #00e5ff  (Bright Cyan)
Violet: #8a2be2  (Blue Violet)
```

## Animation Specs
## Props

| Prop | Type | Default | Options |
|------|------|---------|---------|
| `as` | string | `"h1"` | `"h1"` \| `"h2"` \| `"h3"` \| `"h4"` \| `"h5"` \| `"h6"` \| `"span"` \| `"p"` |
| `glitchOnHover` | boolean | `true` | `true` (hover) \| `false` (always on) |
| `glitchIntensity` | string | `"medium"` | `"low"` \| `"medium"` \| `"high"` |
| `className` | string | `""` | Any CSS class |

## Quick Examples

```tsx
// Basic
<GlitchText as="h1">Title</GlitchText>

// With intensity
<GlitchText as="h2" glitchIntensity="high">Hero</GlitchText>

// Always on
<GlitchText as="span" glitchOnHover={false}>LIVE</GlitchText>

// With gradient
<GlitchText 
  as="h1" 
  className="bg-gradient-to-r from-cyan-400 to-violet-600 bg-clip-text text-transparent"
>
  Cyberpunk
</GlitchText>
```

## Intensity Levels

| Level | Shift | Opacity | Use Case |
|-------|-------|---------|----------|
| Low | 2px | 0.6 | Subtle, small text |
| Medium | 3px | 0.7 | Balanced, most headings |
| High | 5px | 0.8 | Dramatic, hero titles |

## Colors

- **Cyan**: `#00e5ff`
- **Violet**: `#8a2be2`
- **Base**: `#e8eaf6`

## Animation

- **Duration**: 0.2s
- **Easing**: cubic-bezier(0.25, 0.46, 0.45, 0.94)
- **FPS**: 60fps
- **Type**: CSS (GPU-accelerated)

## Responsive Sizes

```tsx
// Desktop to Mobile
<GlitchText className="text-7xl md:text-5xl sm:text-3xl">
  Responsive Title
</GlitchText>
```

## Accessibility

- ✅ WCAG AA contrast compliant
- ✅ Semantic HTML elements
- ✅ Screen reader accessible
- ⚠️ Consider `prefers-reduced-motion` (future)

## Performance Tips

1. Limit to 3-5 per page
2. Prefer hover over always-on
3. Use lower intensity for multiple instances
4. Avoid on body text

## Browser Support

✅ Chrome, Firefox, Safari, Edge (latest)  
✅ Mobile Safari, Chrome Mobile

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Text not visible | Check dark background, verify color |
| Animation not working | Verify `glitchOnHover` prop, check CSS conflicts |
| Performance lag | Reduce always-on instances, lower intensity |
| Not legible | Increase font size, reduce intensity |

## File Locations

- Component: `frontend/components/glitch-text.tsx`
- Example: `frontend/components/glitch-text-example.tsx`
- Docs: `frontend/components/README_GLITCH_TEXT.md`

## Related Components

- `nebula-skeleton.tsx` - Loading states
- `xlm-balance-orb.tsx` - Animated displays
- `flux-yield-slider.tsx` - Interactive controls

## Quick Test

```tsx
// Test in your page
import GlitchText from "@/components/glitch-text";

export default function TestPage() {
  return (
    <div className="min-h-screen bg-[#050510] flex items-center justify-center">
      <GlitchText as="h1" className="text-6xl">
        Test Glitch
      </GlitchText>
    </div>
  );
}
```

## Design Tokens

```css
--glitch-duration: 0.2s
--glitch-cyan: #00e5ff
--glitch-violet: #8a2be2
--glitch-base: #e8eaf6
```

## Keyboard Shortcuts (Example Page)

- Hover over text to trigger effect
- Click intensity buttons to change level
- Toggle mode between hover/always-on

---

**Need more details?** See [README_GLITCH_TEXT.md](./README_GLITCH_TEXT.md)

## Common Patterns

### Hero Title
```tsx
<GlitchText as="h1" glitchIntensity="high" className="text-6xl">
  Welcome
</GlitchText>
```

### Section Header
```tsx
<GlitchText as="h2" glitchIntensity="medium">
  Features
</GlitchText>
```

### Card Title
```tsx
<GlitchText as="h3" glitchIntensity="low">
  Stream #123
</GlitchText>
```

### Status Badge
```tsx
<GlitchText as="span" glitchOnHover={false} glitchIntensity="low">
  ACTIVE
</GlitchText>
```

### CTA Button
```tsx
<button>
  <GlitchText as="span">Start Now</GlitchText>
</button>
```

## Best Practices

✅ Use sparingly (key headings only)  
✅ Match intensity to hierarchy  
✅ Hover for interactive elements  
✅ Always-on for status indicators  
✅ Combine with gradients  
❌ Don't overuse  
❌ Don't use on body text  

## Accessibility

- ✅ Text remains legible
- ✅ Fast animation (0.2s)
- ✅ Screen reader friendly
- ✅ Semantic HTML

## Performance

- CSS-only animations
- ~1KB bundle size
- 60fps on modern browsers
- Hardware accelerated

## Browser Support

- Chrome 76+
- Firefox 103+
- Safari 9+
- Edge 79+

## Troubleshooting

**Not glitching?**
→ Check browser support, ensure hover is working

**Too subtle?**
→ Increase intensity to "high"

**Too intense?**
→ Decrease intensity to "low" or use hover mode

**Performance issues?**
→ Limit simultaneous effects, use hover mode

## Related

- [Full Documentation](./README_GLITCH_TEXT.md)
- [Interactive Demo](./glitch-text-example.tsx)
- [Nebula Skeleton](./README_NEBULA_SKELETON.md)
