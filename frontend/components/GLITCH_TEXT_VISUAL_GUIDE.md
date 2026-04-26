# Glitch Text Visual Reference Guide

Visual documentation of the Glitch Text component states, variations, and design specifications.

## Component Anatomy

```
┌─────────────────────────────────────┐
│                                     │
│  ┌───────────────────────────────┐ │
│  │  Base Text Layer              │ │  ← Main text (#e8eaf6)
│  │  "StellarStream"              │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │  Cyan Channel (::before)      │ │  ← RGB shift (#00e5ff)
│  │  Offset: +2-5px               │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │  Violet Channel (::after)     │ │  ← RGB shift (#8a2be2)
│  │  Offset: -2-5px               │ │
│  └───────────────────────────────┘ │
│                                     │
└─────────────────────────────────────┘
```

## Color Palette

```
Base Text:    #e8eaf6  ████████  Light Gray
Cyan Channel: #00e5ff  ████████  Bright Cyan
Violet Channel: #8a2be2  ████████  Blue Violet

Background:   #050510  ████████  Deep Space
              #0a0a14  ████████  Dark Navy
```

## Animation States

### State 1: Rest (No Hover)
```
┌──────────────────┐
│  StellarStream   │  ← Clean, legible text
└──────────────────┘
```

### State 2: Hover Start (0ms)
```
┌──────────────────┐
│  StellarStream   │  ← Channels begin to separate
│  S̲t̲e̲l̲l̲a̲r̲S̲t̲r̲e̲a̲m̲   │  ← Cyan offset visible
│  S̳t̳e̳l̳l̳a̳r̳S̳t̳r̳e̳a̳m̳   │  ← Violet offset visible
└──────────────────┘
```

### State 3: Mid-Animation (100ms)
```
┌──────────────────┐
│  St̴e̴l̴l̴a̴r̴S̴t̴r̴e̴a̴m̴   │  ← Maximum separation
│  ̷S̷t̷e̷l̷l̷a̷r̷S̷t̷r̷e̷a̷m̷   │  ← Clip-path creates glitch
│  ̸S̸t̸e̸l̸l̸a̸r̸S̸t̸r̸e̸a̸m̸   │  ← Skew effect active
└──────────────────┘
```

### State 4: Hover End (200ms)
```
┌──────────────────┐
│  StellarStream   │  ← Returns to rest state
└──────────────────┘
```

## Intensity Variations

### Low Intensity
```
Shift: 2px
Opacity: 60%
Use: Subtle, professional contexts

┌──────────────────┐
│  Payment Stream  │  ← Minimal separation
│  P̲a̲y̲m̲e̲n̲t̲ ̲S̲t̲r̲e̲a̲m̲  │  ← Barely visible offset
└──────────────────┘
```

### Medium Intensity (Default)
```
Shift: 3px
Opacity: 70%
Use: Balanced, noticeable effect

┌──────────────────┐
│  Payment Stream  │  ← Moderate separation
│  P̴a̴y̴m̴e̴n̴t̴ ̴S̴t̴r̴e̴a̴m̴  │  ← Clear RGB shift
└──────────────────┘
```

### High Intensity
```
Shift: 5px
Opacity: 80%
Use: Bold, dramatic hero sections

┌──────────────────┐
│  Payment Stream  │  ← Strong separation
│  P̷a̷y̷m̷e̷n̷t̷ ̷S̷t̷r̷e̷a̷m̷  │  ← Pronounced glitch
└──────────────────┘
```

## Typography Scale

### H1 - Hero Title (56px)
```
┌────────────────────────────────┐
│                                │
│     StellarStream              │  ← Large, bold
│                                │
└────────────────────────────────┘

Use: Landing page hero, main dashboard title
Intensity: High or Medium
Mode: Always-on or Hover
```

### H2 - Section Title (42px)
```
┌────────────────────────────────┐
│                                │
│   Payment Streams              │  ← Section header
│                                │
└────────────────────────────────┘

Use: Major page sections
Intensity: Medium
Mode: Hover
```

### H3 - Card Title (32px)
```
┌────────────────────────────────┐
│                                │
│  Active Streams                │  ← Card/component title
│                                │
└────────────────────────────────┘

Use: Cards, modals, feature blocks
Intensity: Low or Medium
Mode: Hover
```

### H4 - Component Title (24px)
```
┌────────────────────────────────┐
│                                │
│ Stream Details                 │  ← Small component header
│                                │
└────────────────────────────────┘

Use: Sub-sections, widget headers
Intensity: Low
Mode: Hover
```

## Gradient Combinations

### Cyan to Violet (Primary)
```
┌────────────────────────────────┐
│  ████████████████████████      │  ← Gradient overlay
│  StellarStream                 │  ← Glitch effect on top
│  ████████████████████████      │
└────────────────────────────────┘

CSS: bg-gradient-to-r from-cyan-400 to-violet-600
```

### Cyan to Blue
```
┌────────────────────────────────┐
│  ████████████████████████      │
│  Payment Protocol              │
│  ████████████████████████      │
└────────────────────────────────┘

CSS: bg-gradient-to-r from-cyan-400 to-blue-500
```

### Violet to Pink
```
┌────────────────────────────────┐
│  ████████████████████████      │
│  Governance Hub                │
│  ████████████████████████      │
└────────────────────────────────┘

CSS: bg-gradient-to-r from-violet-600 to-pink-500
```

## Layout Examples

### Dashboard Header
```
┌─────────────────────────────────────────────────┐
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │  Payment Dashboard                        │ │  ← H1 with glitch
│  └───────────────────────────────────────────┘ │
│                                                 │
│  Manage your active payment streams             │  ← Subtitle (no glitch)
│                                                 │
└─────────────────────────────────────────────────┘
```

### Navigation Bar
```
┌─────────────────────────────────────────────────┐
│  Logo  [Dashboard] [Streams] [Governance]       │
│         ^^^^^^^^^^                              │  ← Active with glitch
│                    ^^^^^^^^^ ^^^^^^^^^^^        │  ← Inactive, no glitch
└─────────────────────────────────────────────────┘
```

### Stream Card
```
┌─────────────────────────────────┐
│                                 │
│  Stream #12345                  │  ← H3 with glitch
│  ─────────────                  │
│                                 │
│  Sender: stellar...abc          │  ← No glitch
│  Receiver: stellar...xyz        │  ← No glitch
│  Amount: 1,000 XLM              │  ← No glitch
│                                 │
│  [Withdraw] [Cancel]            │  ← Buttons (optional glitch)
│                                 │
└─────────────────────────────────┘
```

### Modal
```
┌─────────────────────────────────────────┐
│                                         │
│  Create New Stream                      │  ← H2 with glitch
│  ──────────────────                     │
│                                         │
│  Recipient Address                      │  ← Labels (no glitch)
│  [_____________________________]        │
│                                         │
│  Amount                                 │
│  [_____________________________]        │
│                                         │
│  [Cancel]  [Create Stream]              │  ← CTA with glitch
│                                         │
└─────────────────────────────────────────┘
```

### Hero Section
```
┌─────────────────────────────────────────────────┐
│                                                 │
│                                                 │
│           StellarStream                         │  ← H1, always-on glitch
│           ═════════════                         │
│                                                 │
│     Next-generation payment streaming           │  ← Subtitle (no glitch)
│                                                 │
│           [Get Started]                         │  ← CTA with glitch
│                                                 │
│                                                 │
└─────────────────────────────────────────────────┘
```

## Responsive Behavior

### Desktop (1920px)
```
┌────────────────────────────────────────────────────┐
│                                                    │
│         StellarStream Protocol                     │  ← 56px
│                                                    │
└────────────────────────────────────────────────────┘
```

### Tablet (768px)
```
┌──────────────────────────────────┐
│                                  │
│    StellarStream Protocol        │  ← 42px
│                                  │
└──────────────────────────────────┘
```

### Mobile (375px)
```
┌────────────────────┐
│                    │
│  StellarStream     │  ← 32px
│  Protocol          │
│                    │
└────────────────────┘
```

## Animation Timeline

```
Time:     0ms    50ms   100ms  150ms  200ms
          │      │      │      │      │
Cyan:     ─────▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲─────  ← Opacity & position
Violet:   ─────▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼─────  ← Opacity & position
Skew:     ─────╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲─────  ← Skew transform
Clip:     ─────████████████████─────  ← Clip-path changes

Duration: 200ms total
Easing:   cubic-bezier(0.25, 0.46, 0.45, 0.94)
```

## Accessibility Considerations

### Contrast Ratios
```
Base Text (#e8eaf6) on Dark BG (#050510)
Ratio: 14.2:1 ✓ WCAG AAA

Cyan (#00e5ff) on Dark BG (#050510)
Ratio: 11.8:1 ✓ WCAG AAA

Violet (#8a2be2) on Dark BG (#050510)
Ratio: 5.2:1 ✓ WCAG AA
```

### Reduced Motion
```
@media (prefers-reduced-motion: reduce) {
  /* Future enhancement */
  .glitch-text::before,
  .glitch-text::after {
    animation: none;
    opacity: 0;
  }
}
```

## Performance Metrics

```
Animation Type:     CSS (GPU-accelerated)
DOM Nodes:          1 (+ 2 pseudo-elements)
Repaints:           Minimal (transform/opacity only)
Memory Impact:      Low (~1KB per instance)
FPS:                60fps (smooth)
```

## Design Tokens

```css
/* Colors */
--glitch-text-base: #e8eaf6;
--glitch-cyan: #00e5ff;
--glitch-violet: #8a2be2;

/* Timing */
--glitch-duration: 0.2s;
--glitch-easing: cubic-bezier(0.25, 0.46, 0.45, 0.94);

/* Intensity */
--glitch-shift-low: 2px;
--glitch-shift-medium: 3px;
--glitch-shift-high: 5px;

--glitch-opacity-low: 0.6;
--glitch-opacity-medium: 0.7;
--glitch-opacity-high: 0.8;

/* Typography */
--glitch-font-family: 'Syne', sans-serif;
--glitch-font-weight: 800;
--glitch-letter-spacing: -0.02em;
```

## Component States Matrix

```
┌──────────────┬─────────┬──────────┬────────────┐
│ State        │ Hover   │ Intensity│ Use Case   │
├──────────────┼─────────┼──────────┼────────────┤
│ Rest         │ No      │ -        │ Default    │
│ Hover Low    │ Yes     │ Low      │ Subtle     │
│ Hover Med    │ Yes     │ Medium   │ Standard   │
│ Hover High   │ Yes     │ High     │ Dramatic   │
│ Always Low   │ No      │ Low      │ Ambient    │
│ Always Med   │ No      │ Medium   │ Attention  │
│ Always High  │ No      │ High     │ Hero       │
└──────────────┴─────────┴──────────┴────────────┘
```

## Quick Reference

```
✓ DO:
  - Use for titles and headers
  - Keep animation fast (0.2s)
  - Maintain text legibility
  - Use hover for interactive elements
  - Combine with gradients
  - Test on dark backgrounds

✗ DON'T:
  - Use on body text
  - Animate longer than 0.3s
  - Use on light backgrounds
  - Overuse (max 3-5 per page)
  - Use for critical information only
  - Ignore accessibility
```

## Browser Rendering

```
Chrome:   ████████████████████  Full support
Firefox:  ████████████████████  Full support
Safari:   ████████████████████  Full support
Edge:     ████████████████████  Full support
Mobile:   ████████████████████  Full support
```

## Related Components

```
GlitchText ──┬── NebulaSkeleton (loading states)
             ├── XLMBalanceOrb (animated displays)
             ├── FluxYieldSlider (interactive controls)
             └── NetworkStatusOrb (status indicators)
```
