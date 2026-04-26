# Glitch Text Component

A cyberpunk-style digital glitch animation component for titles and headers with RGB channel shifting effects.

## Overview

The `GlitchText` component creates a futuristic "digital glitch" effect by briefly shifting RGB channels (Cyan and Violet) on hover or continuously. The effect is fast (0.2s) and maintains text legibility while reinforcing the cyberpunk aesthetic.

## Features

- **RGB Channel Shifting**: Cyan (#00e5ff) and Violet (#8a2be2) color separation
- **Fast Animation**: 0.2s duration for quick, subtle effect
- **Hover or Always-On**: Toggle between hover-triggered or continuous animation
- **Intensity Control**: Low, medium, or high glitch intensity
- **Semantic HTML**: Supports h1-h6, span, and p elements
- **Legible Typography**: Optimized rendering ensures text remains readable
- **Customizable**: Accepts custom className for additional styling

## Installation

The component is already integrated. Import it from the components directory:

```tsx
import GlitchText from "@/components/glitch-text";
```

## Basic Usage

```tsx
// Simple hover glitch
<GlitchText as="h1">
  StellarStream Protocol
</GlitchText>

// Always-on glitch
<GlitchText as="h2" glitchOnHover={false}>
  Active Streams
</GlitchText>

// With custom intensity
<GlitchText as="h3" glitchIntensity="high">
  Payment Dashboard
</GlitchText>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | Required | Text content to display |
| `as` | `"h1" \| "h2" \| "h3" \| "h4" \| "h5" \| "h6" \| "span" \| "p"` | `"h1"` | HTML element to render |
| `className` | `string` | `""` | Additional CSS classes |
| `glitchOnHover` | `boolean` | `true` | Trigger glitch on hover (true) or always-on (false) |
| `glitchIntensity` | `"low" \| "medium" \| "high"` | `"medium"` | Intensity of the glitch effect |

## Intensity Levels

- **Low**: 2px shift, 60% opacity - Subtle, professional
- **Medium**: 3px shift, 70% opacity - Balanced, noticeable
- **High**: 5px shift, 80% opacity - Bold, dramatic

## Use Cases

### Dashboard Headers
```tsx
<GlitchText as="h1" className="text-6xl font-bold">
  Payment Dashboard
</GlitchText>
```

### Section Titles
```tsx
<GlitchText as="h2" glitchIntensity="low">
  Active Streams
</GlitchText>
```

### Card Titles
```tsx
<GlitchText as="h3" className="text-2xl">
  Stream #{streamId}
</GlitchText>
```

### With Gradient
```tsx
<GlitchText 
  as="h1" 
  className="bg-gradient-to-r from-cyan-400 to-violet-600 bg-clip-text text-transparent"
>
  Futuristic Design
</GlitchText>
```

### Navigation Items
```tsx
<GlitchText as="span" glitchIntensity="low">
  Governance
</GlitchText>
```

### Call-to-Action
```tsx
<button className="px-6 py-3">
  <GlitchText as="span" glitchIntensity="medium">
    Create Stream
  </GlitchText>
</button>
```

## Design Patterns

### Hover-Triggered (Recommended)
Best for interactive elements where the glitch provides feedback:
- Navigation links
- Button labels
- Card titles
- Interactive headers

```tsx
<GlitchText as="h2" glitchOnHover={true}>
  Hover Me
</GlitchText>
```

### Always-On
Best for hero sections or attention-grabbing elements:
- Landing page titles
- Feature highlights
- Status indicators
- Loading states

```tsx
<GlitchText as="h1" glitchOnHover={false}>
  Always Glitching
</GlitchText>
```

## Technical Details

### Animation Keyframes
- **glitch-anim-1**: Cyan channel with clip-path and transform
- **glitch-anim-2**: Violet channel with clip-path and transform
- **glitch-skew**: Subtle skew effect for added distortion

### Color Palette
- **Cyan**: #00e5ff (RGB channel 1)
- **Violet**: #8a2be2 (RGB channel 2)
- **Base Text**: #e8eaf6 (Light gray)

### Performance
- Uses CSS animations (GPU-accelerated)
- Pseudo-elements for RGB channels (no extra DOM nodes)
- 0.2s duration prevents performance issues
- Cubic-bezier easing for smooth motion

## Accessibility

- Text remains fully legible during animation
- Respects `prefers-reduced-motion` (consider adding)
- Semantic HTML elements for proper heading hierarchy
- Color contrast maintained for readability

## Browser Support

- Modern browsers with CSS animation support
- Chrome, Firefox, Safari, Edge (latest versions)
- Mobile browsers supported

## Example Page

See `glitch-text-example.tsx` for a comprehensive demo with:
- Interactive controls for intensity and mode
- Typography size examples (H1-H4)
- Gradient combinations
- Real-world use cases
- Responsive design

## Tips

1. **Use sparingly**: Too many glitch effects can be overwhelming
2. **Match intensity to context**: Low for subtle, high for hero sections
3. **Combine with gradients**: Enhances the cyberpunk aesthetic
4. **Consider hierarchy**: Reserve for important headings
5. **Test legibility**: Ensure text remains readable at all sizes

## Related Components

- `nebula-skeleton.tsx` - Loading state with similar aesthetic
- `xlm-balance-orb.tsx` - Animated balance display
- `flux-yield-slider.tsx` - Interactive slider with cyberpunk styling

## Future Enhancements

- [ ] Add `prefers-reduced-motion` support
- [ ] Custom color scheme props
- [ ] Variable animation duration
- [ ] Glitch trigger on scroll/intersection
- [ ] Sound effects integration
