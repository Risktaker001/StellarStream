# Requirements Document

## Introduction

The Flux Yield Comparison Slider is an interactive frontend component that visualizes the difference in yield between idle funds and streaming funds in StellarStream vaults. Using a split-view design with a draggable glass divider, users can compare static wallet growth against StellarStream's enhanced yield with real-time calculations.

## Glossary

- **Flux_Yield_Comparison_Slider**: The interactive comparison component that displays yield differences
- **Glass_Divider**: A vertical draggable separator with glass morphism styling
- **Idle_Funds**: Standard wallet funds that generate no yield or minimal yield
- **Streaming_Funds**: Funds deposited in StellarStream vaults that generate enhanced yield
- **Nebula_Glow**: A visual effect using cyan/violet gradients that highlights the streaming side
- **Electric_Cyan_Badge**: A floating label displaying percentage gains in the primary cyan color (#00f5ff)
- **Split_View**: The dual-panel layout showing idle vs streaming comparisons
- **Yield_Calculator**: The mathematical logic that computes projected profits based on slider position

## Requirements

### Requirement 1: Interactive Slider Component

**User Story:** As a user, I want to drag a slider to adjust comparison parameters, so that I can see how different amounts affect yield differences.

#### Acceptance Criteria

1. WHEN the component loads, THE Flux_Yield_Comparison_Slider SHALL display a vertical Glass_Divider at the 50% position
2. WHEN a user clicks and drags the Glass_Divider, THE Flux_Yield_Comparison_Slider SHALL move the divider horizontally within the component bounds
3. WHEN a user releases the Glass_Divider, THE Flux_Yield_Comparison_Slider SHALL maintain the divider position
4. WHEN the Glass_Divider is being dragged, THE Flux_Yield_Comparison_Slider SHALL provide visual feedback indicating the active drag state
5. THE Glass_Divider SHALL be constrained between 10% and 90% of the component width

### Requirement 2: Split View Layout

**User Story:** As a user, I want to see a clear visual separation between idle and streaming yields, so that I can easily compare the two options.

#### Acceptance Criteria

1. THE Flux_Yield_Comparison_Slider SHALL display the Idle_Funds view on the left side of the Glass_Divider
2. THE Flux_Yield_Comparison_Slider SHALL display the Streaming_Funds view on the right side of the Glass_Divider
3. WHEN the Glass_Divider position changes, THE Split_View SHALL adjust the visible width of each side proportionally
4. THE Idle_Funds view SHALL use a muted color scheme consistent with static growth
5. THE Streaming_Funds view SHALL include a Nebula_Glow overlay effect

### Requirement 3: Nebula Glow Visual Effect

**User Story:** As a user, I want the streaming side to have an eye-catching visual effect, so that I can immediately identify the enhanced yield option.

#### Acceptance Criteria

1. THE Streaming_Funds view SHALL display a Nebula_Glow overlay using cyan (#00f5ff) and violet (#8a00ff) gradients
2. THE Nebula_Glow SHALL have a blur effect consistent with the Stellar Glass design system
3. THE Nebula_Glow SHALL animate subtly to create a flowing effect
4. THE Nebula_Glow SHALL not obscure the yield data displayed on the Streaming_Funds side

### Requirement 4: Yield Calculation Logic

**User Story:** As a user, I want to see accurate yield projections update in real-time, so that I can make informed decisions about streaming my funds.

#### Acceptance Criteria

1. WHEN the Glass_Divider position changes, THE Yield_Calculator SHALL recalculate projected profits for both Idle_Funds and Streaming_Funds
2. THE Yield_Calculator SHALL accept input parameters including principal amount, time period, and yield rates
3. THE Yield_Calculator SHALL compute Idle_Funds yield using a standard interest calculation
4. THE Yield_Calculator SHALL compute Streaming_Funds yield using the enhanced StellarStream rate
5. THE Yield_Calculator SHALL return the percentage difference between Idle_Funds and Streaming_Funds yields

### Requirement 5: Electric Cyan Badges

**User Story:** As a user, I want to see percentage gains displayed prominently, so that I can quickly understand the yield advantage.

#### Acceptance Criteria

1. THE Flux_Yield_Comparison_Slider SHALL display Electric_Cyan_Badge elements showing percentage gains
2. WHEN yield calculations update, THE Electric_Cyan_Badge SHALL update to reflect the new percentage values
3. THE Electric_Cyan_Badge SHALL use the Electric Cyan color (#00f5ff) from the design system
4. THE Electric_Cyan_Badge SHALL float above the content with appropriate z-index layering
5. THE Electric_Cyan_Badge SHALL include a subtle glow effect consistent with the neon-glow utility class

### Requirement 6: Responsive Behavior

**User Story:** As a user on different devices, I want the comparison slider to work smoothly, so that I can use it on mobile, tablet, or desktop.

#### Acceptance Criteria

1. WHEN viewed on mobile devices, THE Flux_Yield_Comparison_Slider SHALL maintain draggable functionality with touch events
2. WHEN viewed on desktop devices, THE Flux_Yield_Comparison_Slider SHALL respond to mouse drag events
3. THE Flux_Yield_Comparison_Slider SHALL scale proportionally to its container width
4. WHEN the viewport width is below 640px, THE Electric_Cyan_Badge SHALL adjust font size for readability
5. THE Glass_Divider SHALL remain draggable across all supported viewport sizes

### Requirement 7: Glass Morphism Styling

**User Story:** As a user, I want the component to match the Stellar Glass design aesthetic, so that it integrates seamlessly with the rest of the application.

#### Acceptance Criteria

1. THE Flux_Yield_Comparison_Slider SHALL use the glass-card utility class for the container
2. THE Glass_Divider SHALL have backdrop-blur and semi-transparent background consistent with glass morphism
3. THE component SHALL use colors from the Stellar Glass design system (--stellar-primary, --stellar-secondary)
4. THE component SHALL use the Poppins font family for body text and Lato for headings
5. THE component SHALL include subtle border styling with white/[0.08] opacity

### Requirement 8: Accessibility

**User Story:** As a user with accessibility needs, I want the slider to be keyboard navigable and screen reader friendly, so that I can use it effectively.

#### Acceptance Criteria

1. WHEN a user focuses the Glass_Divider with keyboard navigation, THE Flux_Yield_Comparison_Slider SHALL display a visible focus indicator
2. WHEN a user presses arrow keys while the Glass_Divider is focused, THE Flux_Yield_Comparison_Slider SHALL move the divider in 5% increments
3. THE Flux_Yield_Comparison_Slider SHALL include ARIA labels describing the slider purpose
4. THE Electric_Cyan_Badge SHALL include aria-live regions for dynamic content updates
5. WHEN prefers-reduced-motion is enabled, THE Nebula_Glow animation SHALL be disabled or significantly reduced

### Requirement 9: Performance

**User Story:** As a user, I want the slider to respond instantly to my interactions, so that the experience feels smooth and professional.

#### Acceptance Criteria

1. WHEN the Glass_Divider is dragged, THE Yield_Calculator SHALL update within 16ms to maintain 60fps
2. THE Flux_Yield_Comparison_Slider SHALL use React hooks for state management to minimize re-renders
3. THE Nebula_Glow animation SHALL use CSS transforms and will-change properties for GPU acceleration
4. THE component SHALL debounce expensive calculations during rapid slider movements
5. THE component SHALL render without layout shift or content jumping
