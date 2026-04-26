# Projection Tabs Component

A futuristic tab navigation component with light beam projection effect and high-intensity backdrop blur.

## Overview

The Projection Tabs component creates a premium navigation experience with a conical gradient "light beam" that appears to shine from the bottom of the active tab, combined with high-intensity backdrop blur for depth and focus.

## Features

- **Light Beam Effect**: Conical radial gradient projection from bottom
- **Backdrop Blur**: High-intensity blur (24px) on active tab
- **Smooth Transitions**: Cubic-bezier easing for premium feel
- **Glow Effect**: Active tab has cyan glow and shadow
- **Keyboard Accessible**: Full keyboard navigation support
- **Responsive**: Adapts to mobile with vertical layout
- **Customizable**: Easy to add any content to tabs
- **ARIA Compliant**: Proper accessibility attributes

## Installation

Import the component:

```tsx
import ProjectionTabs, { Tab } from "@/components/projection-tabs";
```

## Basic Usage

```tsx
const tabs: Tab[] = [
  {
    id: "daily",
    label: "Daily",
    content: <div>Daily content here</div>,
  },
  {
    id: "monthly",
    label: "Monthly",
    content: <div>Monthly content here</div>,
  },
];

<ProjectionTabs tabs={tabs} defaultTab="daily" />
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tabs` | `Tab[]` | Required | Array of tab objects |
| `defaultTab` | `string` | First tab | ID of initially active tab |
| `onChange` | `(tabId: string) => void` | `undefined` | Callback when tab changes |
| `className` | `string` | `""` | Additional CSS classes |

## Tab Interface

```tsx
interface Tab {
  id: string;        // Unique identifier
  label: string;     // Display text
  content: ReactNode; // Tab panel content
}
```

## Use Cases

### 1. Daily/Monthly Views
```tsx
const viewTabs: Tab[] = [
  {
    id: "daily",
    label: "Daily",
    content: <DailyStats />,
  },
  {
    id: "monthly",
    label: "Monthly",
    content: <MonthlyStats />,
  },
];

<ProjectionTabs tabs={viewTabs} />
```

### 2. Stream Status
```tsx
const statusTabs: Tab[] = [
  {
    id: "active",
    label: "Active",
    content: <ActiveStreams />,
  },
  {
    id: "paused",
    label: "Paused",
    content: <PausedStreams />,
  },
  {
    id: "completed",
    label: "Completed",
    content: <CompletedStreams />,
  },
];

<ProjectionTabs tabs={statusTabs} defaultTab="active" />
```

### 3. Settings Navigation
```tsx
const settingsTabs: Tab[] = [
  {
    id: "general",
    label: "General",
    content: <GeneralSettings />,
  },
  {
    id: "security",
    label: "Security",
    content: <SecuritySettings />,
  },
  {
    id: "notifications",
    label: "Notifications",
    content: <NotificationSettings />,
  },
];

<ProjectionTabs tabs={settingsTabs} />
```

### 4. Dashboard Views
```tsx
const dashboardTabs: Tab[] = [
  {
    id: "overview",
    label: "Overview",
    content: <DashboardOverview />,
  },
  {
    id: "analytics",
    label: "Analytics",
    content: <Analytics />,
  },
  {
    id: "reports",
    label: "Reports",
    content: <Reports />,
  },
];

<ProjectionTabs tabs={dashboardTabs} />
```

### 5. With State Management
```tsx
const [activeView, setActiveView] = useState("daily");

<ProjectionTabs
  tabs={viewTabs}
  defaultTab={activeView}
  onChange={setActiveView}
/>
```

## Design Specifications

### Colors

**Active Tab:**
- Background: `rgba(0, 229, 255, 0.1)`
- Border: `rgba(0, 229, 255, 0.3)`
- Text: `#ffffff`
- Glow: `0 0 20px rgba(0, 229, 255, 0.3)`

**Inactive Tab:**
- Background: `transparent`
- Text: `rgba(232, 234, 246, 0.6)`
- Hover: `rgba(0, 229, 255, 0.05)`

**Light Beam:**
- Gradient: `radial-gradient(ellipse at bottom, rgba(0, 229, 255, 0.4) 0%, rgba(0, 229, 255, 0.2) 30%, transparent 70%)`

### Dimensions
- Tab Padding: `12px 24px`
- Border Radius: `12px` (tabs), `16px` (container)
- Gap: `8px` between tabs
- Font Size: `14px`
- Font Weight: `600`

### Effects

**Backdrop Blur:**
- Active Tab: `24px` (high-intensity)
- Container: `8px`
- Content Panel: `8px`

**Light Beam:**
- Height: `200%` of tab
- Width: `120%` of tab
- Position: Bottom center
- Opacity: `0` (inactive) → `1` (active)

**Glow Line:**
- Width: `60%` of tab
- Height: `2px`
- Position: Bottom center
- Color: `#00e5ff`
- Shadow: `0 0 10px rgba(0, 229, 255, 0.8)`

## Animations

### Tab Switch
- Duration: `0.3s`
- Easing: `cubic-bezier(0.4, 0, 0.2, 1)`
- Properties: opacity, background, border, color

### Content Fade
- Duration: `0.3s`
- Easing: `ease`
- Effect: Fade in + slide up (10px)

### Light Beam
- Duration: `0.3s`
- Easing: `ease`
- Effect: Opacity fade

## Accessibility

### Keyboard Navigation
- **Tab**: Move between tabs
- **Enter/Space**: Activate focused tab
- **Arrow Keys**: Navigate tabs (optional enhancement)

### ARIA Attributes
```tsx
role="tablist"           // Container
role="tab"               // Tab buttons
aria-selected={boolean}  // Active state
aria-controls="panel-id" // Associated panel
role="tabpanel"          // Content panel
aria-labelledby="tab-id" // Panel label
```

### Focus Management
- Visible focus indicator (2px cyan outline)
- Focus offset: 2px
- Keyboard accessible

## Responsive Behavior

### Desktop (>640px)
- Horizontal layout
- Full padding and spacing
- Side-by-side tabs

### Mobile (≤640px)
- Vertical layout (column)
- Reduced padding
- Stacked tabs
- Smaller font size

## Performance

- **CSS Animations**: GPU-accelerated
- **Minimal Re-renders**: Only on tab change
- **Lazy Content**: Only active panel rendered
- **Optimized Transitions**: Transform and opacity only

## Browser Support

✅ Chrome, Firefox, Safari, Edge (latest)  
✅ Mobile Safari, Chrome Mobile  
✅ Backdrop-filter support (with fallback)

## Integration Examples

### With Router
```tsx
import { useRouter, useSearchParams } from "next/navigation";

function TabsWithRouter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const view = searchParams.get("view") || "daily";

  return (
    <ProjectionTabs
      tabs={tabs}
      defaultTab={view}
      onChange={(tabId) => router.push(`?view=${tabId}`)}
    />
  );
}
```

### With Context
```tsx
import { useViewContext } from "@/contexts/ViewContext";

function TabsWithContext() {
  const { currentView, setCurrentView } = useViewContext();

  return (
    <ProjectionTabs
      tabs={tabs}
      defaultTab={currentView}
      onChange={setCurrentView}
    />
  );
}
```

### Dynamic Content
```tsx
const [data, setData] = useState(null);

const tabs: Tab[] = [
  {
    id: "daily",
    label: "Daily",
    content: data ? <DailyView data={data} /> : <Loading />,
  },
  // ...
];

<ProjectionTabs tabs={tabs} />
```

## Styling

### Custom Wrapper
```tsx
<div className="max-w-4xl mx-auto">
  <ProjectionTabs tabs={tabs} />
</div>
```

### With Additional Classes
```tsx
<ProjectionTabs
  tabs={tabs}
  className="my-custom-class"
/>
```

## Best Practices

### DO:
- Use for 2-5 tabs (optimal)
- Keep labels short and clear
- Provide meaningful content
- Use consistent tab order
- Test keyboard navigation
- Ensure content is accessible

### DON'T:
- Use for more than 7 tabs
- Use long tab labels
- Nest tabs inside tabs
- Forget default tab
- Skip accessibility testing
- Use for primary navigation

## Technical Implementation

### Light Beam Effect
```css
background: radial-gradient(
  ellipse at bottom,
  rgba(0, 229, 255, 0.4) 0%,
  rgba(0, 229, 255, 0.2) 30%,
  transparent 70%
);
```

### Backdrop Blur
```css
backdrop-filter: blur(24px);
```

### Glow Effect
```css
box-shadow: 
  0 0 20px rgba(0, 229, 255, 0.3),
  inset 0 0 20px rgba(0, 229, 255, 0.1);
```

## Related Components

- `glitch-text.tsx` - Animated headers
- `magnetic-button.tsx` - Interactive buttons
- `biometric-security-toggle.tsx` - Toggle switches

## Future Enhancements

- [ ] Swipe gestures (mobile)
- [ ] Arrow key navigation
- [ ] Tab badges/counters
- [ ] Vertical tab orientation
- [ ] Animated tab indicator
- [ ] Custom light beam colors

## Example Page

See `projection-tabs-example.tsx` for:
- Daily/Monthly view example
- Stream status tabs
- Settings navigation
- Feature showcase
- Responsive design
