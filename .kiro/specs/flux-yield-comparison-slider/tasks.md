# Implementation Plan: Flux Yield Comparison Slider

## Overview

This implementation plan breaks down the Flux Yield Comparison Slider component into discrete, incremental tasks. The component will be built using React, TypeScript, Framer Motion, and Tailwind CSS, following the Stellar Glass design system. Each task builds on previous work, with property-based tests integrated close to implementation to catch errors early.

## Tasks

- [x] 1. Set up component structure and type definitions
  - Create `flux-yield-comparison-slider.tsx` in `frontend/components/`
  - Define TypeScript interfaces for all props and state
  - Create barrel export in components index if needed
  - Set up basic component skeleton with placeholder content
  - _Requirements: 1.1, 2.1, 2.2_

- [ ] 2. Implement yield calculation utilities
  - [x] 2.1 Create `yield-calculator.ts` utility module
    - Implement `calculateSimpleYield` function with simple interest formula
    - Implement `calculateYieldDifference` function for percentage difference
    - Implement `formatCurrency` and `formatPercentage` helper functions
    - Add input validation and error handling for edge cases
    - _Requirements: 4.2, 4.3, 4.4, 4.5_

  - [ ]* 2.2 Write property test for yield calculation correctness
    - **Property 4: Yield Calculation Correctness**
    - **Validates: Requirements 4.3, 4.4**
    - Generate random valid inputs (principal > 0, rate ≥ 0, days > 0)
    - Verify output matches formula: principal * (rate / 365) * days
    - Test with tolerance of 0.01 for floating-point precision

  - [ ]* 2.3 Write property test for yield difference calculation
    - **Property 5: Yield Difference Calculation**
    - **Validates: Requirements 4.5**
    - Generate random yield pairs
    - Verify percentage difference equals ((streaming - idle) / idle) * 100
    - Test edge case when idle = 0

  - [ ]* 2.4 Write unit tests for yield calculator edge cases
    - Test zero principal, zero rate, zero days
    - Test negative inputs (should handle gracefully)
    - Test very large numbers
    - Test currency and percentage formatting
    - _Requirements: 4.2, 4.3, 4.4, 4.5_

- [ ] 3. Implement GlassDivider draggable component
  - [x] 3.1 Create GlassDivider component with drag handlers
    - Set up Framer Motion drag constraints
    - Implement mouse and touch event handlers
    - Calculate position relative to container bounds
    - Apply glass morphism styling (backdrop-blur, semi-transparent background)
    - _Requirements: 1.2, 1.3, 1.4, 6.1, 6.2, 7.2_

  - [x] 3.2 Implement position clamping logic
    - Constrain divider position to [10, 90] range
    - Handle out-of-bounds drag attempts
    - _Requirements: 1.5_

  - [ ]* 3.3 Write property test for position clamping
    - **Property 1: Divider Position Clamping**
    - **Validates: Requirements 1.5**
    - Generate random drag positions including out-of-bounds values
    - Verify result is always within [10, 90] range

  - [ ]* 3.4 Write property test for drag state consistency
    - **Property 2: Drag State Consistency**
    - **Validates: Requirements 1.2, 1.3, 1.4**
    - Generate random drag event sequences (start, move, end)
    - Verify isDragging state transitions correctly
    - Verify final position matches last drag position

  - [x] 3.5 Add keyboard navigation support
    - Implement arrow key handlers for 5% increments
    - Add focus indicator styling
    - _Requirements: 8.1, 8.2_

  - [ ]* 3.6 Write property test for keyboard navigation
    - **Property 8: Keyboard Navigation Increments**
    - **Validates: Requirements 8.2**
    - Generate random starting positions
    - Verify arrow keys move divider by exactly 5%
    - Verify clamping at boundaries (10% and 90%)

- [x] 4. Checkpoint - Ensure draggable divider works correctly
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Implement SplitView layout component
  - [x] 5.1 Create SplitView with proportional panels
    - Implement left (IdleView) and right (StreamingView) panels
    - Calculate panel widths based on divider position
    - Apply responsive container scaling
    - _Requirements: 2.1, 2.2, 2.3, 6.3_

  - [ ]* 5.2 Write property test for split view proportionality
    - **Property 3: Split View Proportionality**
    - **Validates: Requirements 2.3**
    - Generate random divider positions in [10, 90]
    - Verify left width = P% and right width = (100-P)%

  - [ ]* 5.3 Write property test for responsive scaling
    - **Property 9: Responsive Container Scaling**
    - **Validates: Requirements 6.3, 6.5**
    - Generate random container widths
    - Verify component scales proportionally
    - Verify drag functionality remains intact

  - [ ]* 5.4 Write unit tests for split view rendering
    - Test IdleView renders on left
    - Test StreamingView renders on right
    - Test panel width calculations
    - _Requirements: 2.1, 2.2, 2.3_

- [ ] 6. Implement NebulaGlowOverlay visual effect
  - [x] 6.1 Create NebulaGlowOverlay component
    - Implement two gradient blobs (cyan #00f5ff and violet #8a00ff)
    - Apply blur filter for soft glow effect
    - Add Framer Motion drift animation
    - Ensure proper z-index layering (doesn't obscure content)
    - _Requirements: 2.5, 3.1, 3.2, 3.3, 3.4_

  - [x] 6.2 Add prefers-reduced-motion support
    - Detect prefers-reduced-motion media query
    - Disable or reduce animations when enabled
    - _Requirements: 8.5_

  - [ ]* 6.3 Write unit tests for nebula glow styling
    - Test correct colors are used (#00f5ff, #8a00ff)
    - Test blur effect is applied
    - Test animation is present
    - Test z-index doesn't obscure content
    - Test prefers-reduced-motion disables animation
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 8.5_

- [ ] 7. Implement ElectricCyanBadge component
  - [x] 7.1 Create ElectricCyanBadge with styling
    - Implement badge with Electric Cyan color (#00f5ff)
    - Apply neon-glow effect (box-shadow)
    - Position with appropriate z-index
    - Add aria-live region for accessibility
    - _Requirements: 5.1, 5.3, 5.4, 5.5, 8.4_

  - [ ]* 7.2 Write unit tests for badge styling and accessibility
    - Test #00f5ff color is used
    - Test z-index layering
    - Test glow effect (box-shadow) is present
    - Test aria-live attribute exists
    - Test responsive font-size at 640px breakpoint
    - _Requirements: 5.3, 5.4, 5.5, 6.4, 8.4_

- [ ] 8. Integrate yield calculations with component state
  - [x] 8.1 Wire yield calculator to component state
    - Connect divider position to yield calculations
    - Implement state management with React hooks (useState, useMemo)
    - Update badges when calculations change
    - Add debouncing for rapid slider movements (50ms)
    - _Requirements: 4.1, 5.2, 9.2, 9.4_

  - [ ]* 8.2 Write property test for reactive yield updates
    - **Property 6: Reactive Yield Updates**
    - **Validates: Requirements 4.1, 5.2**
    - Generate random changes to inputs (position, principal, rates, days)
    - Verify displayed values update to match new calculations

  - [ ]* 8.3 Write property test for calculation debouncing
    - **Property 10: Calculation Debouncing**
    - **Validates: Requirements 9.4**
    - Generate rapid slider movements (>10 changes in 100ms)
    - Verify calculations occur at most once every 50ms

- [x] 9. Checkpoint - Ensure calculations and reactivity work correctly
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 10. Apply Stellar Glass design system styling
  - [x] 10.1 Add glass morphism and design system styles
    - Apply glass-card utility class to container
    - Use Stellar Glass colors (--stellar-primary, --stellar-secondary)
    - Apply Poppins font for body text, Lato for headings
    - Add subtle border with white/[0.08] opacity
    - Apply muted color scheme to IdleView
    - _Requirements: 2.4, 7.1, 7.2, 7.3, 7.4, 7.5_

  - [ ]* 10.2 Write unit tests for design system compliance
    - Test glass-card class is applied
    - Test correct CSS variables are used
    - Test font families are correct
    - Test border opacity
    - Test backdrop-blur on divider
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 11. Implement accessibility features
  - [x] 11.1 Add ARIA labels and keyboard support
    - Add aria-label to slider describing purpose
    - Ensure focus indicator is visible
    - Verify keyboard navigation works (already implemented in task 3.5)
    - Test with screen reader (manual verification)
    - _Requirements: 8.1, 8.3_

  - [ ]* 11.2 Write unit tests for accessibility
    - Test ARIA labels are present
    - Test focus indicator styles
    - Test keyboard event handlers
    - _Requirements: 8.1, 8.3_

- [ ] 12. Add performance optimizations
  - [x] 12.1 Optimize rendering and animations
    - Use React.memo for child components
    - Apply CSS transforms and will-change for GPU acceleration
    - Verify no unnecessary re-renders with useMemo and useCallback
    - _Requirements: 9.2, 9.3_

  - [ ]* 12.2 Write unit tests for performance optimizations
    - Test CSS transforms and will-change are present
    - Test React.memo is applied where appropriate
    - _Requirements: 9.3_

- [ ] 13. Handle edge cases and error conditions
  - [x] 13.1 Add input validation and error handling
    - Validate props (principal > 0, rates ≥ 0, days > 0)
    - Handle invalid inputs gracefully with defaults
    - Add try-catch for drag calculations
    - Log warnings for invalid props in development
    - _Requirements: 4.2, 4.3, 4.4_

  - [ ]* 13.2 Write unit tests for edge cases
    - Test zero principal, rate, days
    - Test negative inputs
    - Test very large numbers
    - Test boundary positions (10%, 90%)
    - Test rapid mount/unmount
    - _Requirements: 4.2, 4.3, 4.4, 1.5_

- [ ] 14. Add callback prop and external integration
  - [x] 14.1 Implement onSliderChange callback
    - Add optional callback prop
    - Invoke callback when divider position changes
    - Pass current position and yield data to callback
    - _Requirements: 1.1_

  - [ ]* 14.2 Write unit tests for callback integration
    - Test callback is invoked with correct parameters
    - Test callback is optional (doesn't break if not provided)
    - _Requirements: 1.1_

- [ ] 15. Final integration and testing
  - [x] 15.1 Create example usage in demo page
    - Add component to demo page or storybook
    - Test with various prop combinations
    - Verify responsive behavior on different viewports
    - Test touch interactions on mobile
    - _Requirements: 1.1, 6.1, 6.2, 6.3, 6.4, 6.5_

  - [ ]* 15.2 Write integration tests
    - Test full user interaction flow (drag, keyboard, touch)
    - Test component with different prop combinations
    - Test responsive breakpoints
    - _Requirements: 1.1, 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 16. Final checkpoint - Ensure all tests pass and component is production-ready
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each property test should run minimum 100 iterations using fast-check
- Property tests should be tagged with comments referencing design properties
- Unit tests focus on specific examples, edge cases, and visual styling
- Integration tests validate end-to-end user flows
- Checkpoints ensure incremental validation throughout development
- All tasks reference specific requirements for traceability
