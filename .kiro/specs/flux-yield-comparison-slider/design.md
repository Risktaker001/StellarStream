# Design Document: Flux Yield Comparison Slider

## Overview

The Flux Yield Comparison Slider is a React component built with TypeScript, Framer Motion, and Tailwind CSS. It implements a split-view comparison interface with a draggable glass divider that allows users to visualize yield differences between idle and streaming funds in real-time.

The component follows the Stellar Glass design system, utilizing glass morphism, nebula glow effects, and electric cyan accents. It's designed as an atomic, reusable component that can be integrated into vault detail pages, landing pages, or dashboard views.

## Architecture

### Component Structure

```
FluxYieldComparisonSlider (Container)
├── SplitView (Layout Manager)
│   ├── IdleView (Left Panel)
│   │   ├── YieldDisplay
│   │   └── StaticGrowthIndicator
│   ├── GlassDivider (Draggable Handle)
│   │   └── DragHandle
│   └── StreamingView (Right Panel)
│       ├── NebulaGlowOverlay
│       ├── YieldDisplay
│       └── EnhancedGrowthIndicator
└── ElectricCyanBadges (Floating Labels)
    ├── IdleBadge
    └── StreamingBadge
```

### Technology Stack

- **React 18+**: Component framework with hooks for state management
- **TypeScript**: Type safety and developer experience
- **Framer Motion**: Animation library for smooth drag interactions and visual effects
- **Tailwind CSS**: Utility-first styling with custom Stellar Glass utilities
- **React Hooks**: useState, useCallback, useMemo, useEffect for state and performance

## Components and Interfaces

### FluxYieldComparisonSlider (Main Component)

**Props Interface:**
```typescript
interface FluxYieldComparisonSliderProps {
  principalAmount: number;        // Amount in base currency
  timePeriod: number;             // Time period in days
  idleYieldRate: number;          // Annual yield rate for idle funds (e.g., 0.02 for 2%)
  streamingYieldRate: number;     // Annual yield rate for streaming funds (e.g., 0.08 for 8%)
  currency?: string;              // Currency symbol (default: "XLM")
  className?: string;             // Additional CSS classes
  onSliderChange?: (position: number) => void; // Callback when slider moves
}
```

**State Management:**
```typescript
interface SliderState {
  dividerPosition: number;        // Percentage (0-100)
  isDragging: boolean;            // Drag state
  idleYield: number;              // Calculated idle yield
  streamingYield: number;         // Calculated streaming yield
  yieldDifference: number;        // Percentage difference
}
```

### GlassDivider (Draggable Component)

**Props Interface:**
```typescript
interface GlassDividerProps {
  position: number;               // Current position (0-100)
  onDrag: (newPosition: number) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  containerRef: React.RefObject<HTMLDivElement>;
}
```

**Behavior:**
- Listens for mouse and touch events
- Calculates position relative to container bounds
- Constrains movement between 10% and 90%
- Provides visual feedback during drag (scale, glow)

### YieldCalculator (Utility Module)

**Function Signatures:**
```typescript
function calculateSimpleYield(
  principal: number,
  rate: number,
  days: number
): number;

function calculateYieldDifference(
  idleYield: number,
  streamingYield: number
): number;

function formatCurrency(
  amount: number,
  currency: string
): string;

function formatPercentage(
  value: number,
  decimals?: number
): string;
```

**Calculation Logic:**
- Simple interest formula: `yield = principal * (rate / 365) * days`
- Percentage difference: `((streaming - idle) / idle) * 100`
- Memoized calculations to prevent unnecessary re-computation

### NebulaGlowOverlay (Visual Effect Component)

**Props Interface:**
```typescript
interface NebulaGlowOverlayProps {
  intensity?: number;             // Opacity multiplier (0-1)
  animate?: boolean;              // Enable/disable animation
}
```

**Implementation:**
- Two overlapping gradient blobs (cyan and violet)
- CSS blur filter for soft glow effect
- Framer Motion for subtle drift animation
- Respects prefers-reduced-motion

### ElectricCyanBadge (Label Component)

**Props Interface:**
```typescript
interface ElectricCyanBadgeProps {
  label: string;                  // Badge text
  value: string;                  // Displayed value
  position: "left" | "right";     // Placement
  highlight?: boolean;            // Enhanced glow effect
}
```

**Styling:**
- Background: `rgba(0, 245, 255, 0.12)`
- Border: `1px solid rgba(0, 245, 255, 0.3)`
- Box shadow: `0 0 16px rgba(0, 245, 255, 0.2)`
- Font: Poppins, 14px, font-weight 600

## Data Models

### YieldComparison

```typescript
interface YieldComparison {
  idle: {
    principal: number;
    rate: number;
    yield: number;
    total: number;
  };
  streaming: {
    principal: number;
    rate: number;
    yield: number;
    total: number;
  };
  difference: {
    absolute: number;
    percentage: number;
  };
}
```

### DragState

```typescript
interface DragState {
  isActive: boolean;
  startX: number;
  startPosition: number;
  currentPosition: number;
}
```

### AnimationConfig

```typescript
interface AnimationConfig {
  dragTransition: {
    type: "spring";
    stiffness: number;
    damping: number;
  };
  glowTransition: {
    duration: number;
    repeat: number;
    ease: string;
  };
}
```

## Error Handling

### Input Validation

**Invalid Props:**
- If `principalAmount <= 0`: Log warning, default to 1000
- If `timePeriod <= 0`: Log warning, default to 30
- If `idleYieldRate < 0` or `streamingYieldRate < 0`: Log warning, default to 0
- If `streamingYieldRate < idleYieldRate`: Log warning but allow (edge case)

**Boundary Conditions:**
- Divider position clamped to [10, 90] range
- Touch/mouse coordinates validated against container bounds
- NaN/Infinity results from calculations replaced with 0

### Event Handling Errors

**Drag Event Failures:**
```typescript
try {
  const newPosition = calculatePosition(event, containerRef);
  onDrag(newPosition);
} catch (error) {
  console.error("Drag calculation failed:", error);
  // Maintain last valid position
}
```

**Animation Errors:**
- Framer Motion errors caught and logged
- Fallback to CSS transitions if Motion fails
- Graceful degradation for unsupported browsers

### Accessibility Errors

**Keyboard Navigation:**
- Arrow key handlers wrapped in try-catch
- Focus management errors logged but don't break component
- ARIA attributes validated at runtime (development mode)

## Testing Strategy

### Unit Tests

**YieldCalculator Module:**
- Test simple interest calculations with various inputs
- Test edge cases: zero principal, zero rate, zero days
- Test negative inputs (should handle gracefully)
- Test very large numbers (overflow protection)
- Test currency formatting with different locales
- Test percentage formatting with various decimal places

**Component Rendering:**
- Test component renders with default props
- Test component renders with custom props
- Test conditional rendering based on state
- Test className prop merging
- Test currency symbol display

**State Management:**
- Test initial state values
- Test state updates on slider drag
- Test state updates on keyboard navigation
- Test callback invocation with correct parameters

### Property-Based Tests

Property-based tests will validate universal behaviors across randomized inputs using a PBT library (fast-check for TypeScript). Each test will run a minimum of 100 iterations.

**Configuration:**
- Library: fast-check
- Iterations per test: 100
- Seed: Random (logged for reproducibility)
- Shrinking: Enabled for minimal failing examples

### Integration Tests

**User Interactions:**
- Test drag interaction updates yield calculations
- Test keyboard navigation updates divider position
- Test touch events on mobile viewports
- Test focus management with Tab key
- Test callback props are invoked correctly

**Visual Regression:**
- Snapshot test for idle state
- Snapshot test for streaming state
- Snapshot test for mid-drag state
- Snapshot test for mobile viewport
- Snapshot test with reduced motion enabled

### Performance Tests

**Render Performance:**
- Measure time to first render
- Measure re-render count during drag
- Verify no unnecessary re-renders with React DevTools Profiler
- Test with React.memo optimization

**Animation Performance:**
- Verify 60fps during drag (16ms frame budget)
- Test GPU acceleration with Chrome DevTools
- Measure paint and composite times
- Test with throttled CPU (4x slowdown)


## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: Divider Position Clamping

*For any* drag position input (including out-of-bounds values), the Glass_Divider position should always be constrained to the range [10, 90] inclusive.

**Validates: Requirements 1.5**

### Property 2: Drag State Consistency

*For any* sequence of drag events (start, move, end), the component state should accurately reflect the drag lifecycle: isDragging is true during drag, false after release, and the final position matches the last drag position.

**Validates: Requirements 1.2, 1.3, 1.4**

### Property 3: Split View Proportionality

*For any* divider position P (where 10 ≤ P ≤ 90), the left panel width should be P% of the container width and the right panel width should be (100 - P)% of the container width.

**Validates: Requirements 2.3**

### Property 4: Yield Calculation Correctness

*For any* valid input parameters (principal > 0, rate ≥ 0, days > 0), the calculated yield should equal `principal * (rate / 365) * days` with a tolerance of 0.01 for floating-point precision.

**Validates: Requirements 4.3, 4.4**

### Property 5: Yield Difference Calculation

*For any* two yield values (idle and streaming), the percentage difference should equal `((streaming - idle) / idle) * 100` when idle > 0, and should handle the edge case of idle = 0 gracefully by returning 0 or Infinity as appropriate.

**Validates: Requirements 4.5**

### Property 6: Reactive Yield Updates

*For any* change in divider position, principal amount, time period, or yield rates, the displayed yield values and percentage badges should update to reflect the new calculations.

**Validates: Requirements 4.1, 5.2**

### Property 7: Pointer Interaction Support

*For any* pointer input type (mouse or touch), the Glass_Divider should respond to drag gestures and update its position accordingly.

**Validates: Requirements 6.1, 6.2**

### Property 8: Keyboard Navigation Increments

*For any* current divider position P, pressing the right arrow key should move the divider to min(P + 5, 90), and pressing the left arrow key should move the divider to max(P - 5, 10).

**Validates: Requirements 8.2**

### Property 9: Responsive Container Scaling

*For any* container width W (where W > 0), the component should scale proportionally to fill the container while maintaining the correct aspect ratio and draggable functionality.

**Validates: Requirements 6.3, 6.5**

### Property 10: Calculation Debouncing

*For any* rapid sequence of slider movements (more than 10 position changes within 100ms), expensive yield calculations should be debounced such that calculations occur at most once every 50ms.

**Validates: Requirements 9.4**

### Example-Based Tests

The following acceptance criteria are best validated through specific example tests rather than property-based tests:

**Initial State (Requirement 1.1):**
- Test that component renders with divider at 50% position on mount

**Component Structure (Requirements 2.1, 2.2, 2.5):**
- Test that IdleView renders on the left
- Test that StreamingView renders on the right
- Test that NebulaGlowOverlay is present in StreamingView

**Visual Styling (Requirements 2.4, 3.1, 3.2, 3.3, 3.4, 5.3, 5.4, 5.5, 7.1, 7.2, 7.3, 7.4, 7.5, 9.3):**
- Test glass-card utility class is applied
- Test Nebula_Glow uses correct colors (#00f5ff, #8a00ff)
- Test backdrop-blur is applied to Glass_Divider
- Test Electric_Cyan_Badge uses #00f5ff color
- Test z-index layering is correct
- Test font families (Poppins, Lato) are applied
- Test border opacity is white/[0.08]
- Test CSS transforms and will-change are used for animations

**Badge Display (Requirements 5.1):**
- Test that ElectricCyanBadge components render

**Calculator Interface (Requirement 4.2):**
- Test that calculateSimpleYield accepts principal, rate, and days parameters

**Responsive Breakpoint (Requirement 6.4):**
- Test that badge font-size changes at 640px breakpoint

**Accessibility (Requirements 8.1, 8.3, 8.4, 8.5):**
- Test focus indicator is visible when Glass_Divider is focused
- Test ARIA labels are present
- Test aria-live regions are present on badges
- Test animations are disabled when prefers-reduced-motion is enabled

### Edge Cases

**Zero and Negative Inputs:**
- Test behavior when principal = 0
- Test behavior when rate = 0
- Test behavior when days = 0
- Test behavior when negative values are provided (should handle gracefully)

**Boundary Positions:**
- Test divider at exactly 10% position
- Test divider at exactly 90% position
- Test attempting to drag below 10% (should clamp)
- Test attempting to drag above 90% (should clamp)

**Extreme Values:**
- Test with very large principal amounts (e.g., 1e15)
- Test with very small rates (e.g., 0.0001)
- Test with very long time periods (e.g., 10000 days)

**Animation Edge Cases:**
- Test Nebula_Glow doesn't obscure content (z-index validation)
- Test animations work when component is mounted/unmounted rapidly
