# Glitch Text Integration Guide

Quick reference for integrating the Glitch Text component into your StellarStream pages.

## Quick Start

```tsx
import GlitchText from "@/components/glitch-text";

export default function MyPage() {
  return (
    <GlitchText as="h1">
      My Cyberpunk Title
    </GlitchText>
  );
}
```

## Common Integration Patterns

### 1. Dashboard Page Header

```tsx
// app/dashboard/page.tsx
import GlitchText from "@/components/glitch-text";

export default function Dashboard() {
  return (
    <div className="p-8">
      <GlitchText 
        as="h1" 
        className="text-5xl font-bold mb-6"
        glitchIntensity="medium"
      >
        Payment Dashboard
      </GlitchText>
      {/* Rest of dashboard content */}
    </div>
  );
}
```

### 2. Stream Card Title

```tsx
// components/stream-card.tsx
import GlitchText from "@/components/glitch-text";

interface StreamCardProps {
  streamId: string;
  title: string;
}

export default function StreamCard({ streamId, title }: StreamCardProps) {
  return (
    <div className="card">
      <GlitchText 
        as="h3" 
        className="text-2xl mb-4"
        glitchIntensity="low"
      >
        {title}
      </GlitchText>
      <p className="text-sm text-gray-400">Stream #{streamId}</p>
    </div>
  );
}
```

### 3. Navigation with Active State

```tsx
// components/nav.tsx
import GlitchText from "@/components/glitch-text";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const pathname = usePathname();
  
  const navItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/streams", label: "Streams" },
    { href: "/governance", label: "Governance" },
  ];

  return (
    <nav className="flex gap-6">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        
        return (
          <a key={item.href} href={item.href}>
            {isActive ? (
              <GlitchText 
                as="span" 
                glitchIntensity="low"
                className="text-cyan-400"
              >
                {item.label}
              </GlitchText>
            ) : (
              <span className="text-gray-400 hover:text-white">
                {item.label}
              </span>
            )}
          </a>
        );
      })}
    </nav>
  );
}
```

### 4. Modal Header

```tsx
// components/create-stream-modal.tsx
import GlitchText from "@/components/glitch-text";

export default function CreateStreamModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <GlitchText 
          as="h2" 
          className="text-3xl mb-6"
          glitchIntensity="medium"
        >
          Create New Stream
        </GlitchText>
        {/* Modal form content */}
      </div>
    </div>
  );
}
```

### 5. Hero Section

```tsx
// app/page.tsx (Landing page)
import GlitchText from "@/components/glitch-text";

export default function LandingPage() {
  return (
    <section className="hero min-h-screen flex items-center justify-center">
      <div className="text-center">
        <GlitchText 
          as="h1" 
          className="text-7xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-violet-600 bg-clip-text text-transparent"
          glitchIntensity="high"
          glitchOnHover={false}
        >
          StellarStream
        </GlitchText>
        <p className="text-xl text-gray-400">
          Next-generation payment streaming protocol
        </p>
      </div>
    </section>
  );
}
```

### 6. Feature Section Titles

```tsx
// components/features-section.tsx
import GlitchText from "@/components/glitch-text";

const features = [
  { title: "Real-Time Streaming", description: "..." },
  { title: "Yield Optimization", description: "..." },
  { title: "Governance", description: "..." },
];

export default function FeaturesSection() {
  return (
    <section className="py-20">
      <GlitchText 
        as="h2" 
        className="text-4xl text-center mb-12"
        glitchIntensity="medium"
      >
        Core Features
      </GlitchText>
      
      <div className="grid grid-cols-3 gap-8">
        {features.map((feature) => (
          <div key={feature.title} className="feature-card">
            <GlitchText 
              as="h3" 
              className="text-2xl mb-4"
              glitchIntensity="low"
            >
              {feature.title}
            </GlitchText>
            <p className="text-gray-400">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
```

### 7. Button with Glitch Effect

```tsx
// components/glitch-button.tsx
import GlitchText from "@/components/glitch-text";

interface GlitchButtonProps {
  onClick: () => void;
  children: string;
  variant?: "primary" | "secondary";
}

export default function GlitchButton({ 
  onClick, 
  children, 
  variant = "primary" 
}: GlitchButtonProps) {
  const baseStyles = "px-6 py-3 rounded-lg font-semibold transition-all";
  const variantStyles = variant === "primary" 
    ? "bg-gradient-to-r from-cyan-500 to-violet-600 hover:shadow-lg hover:shadow-cyan-500/50"
    : "border border-cyan-400 hover:bg-cyan-400/10";

  return (
    <button 
      onClick={onClick}
      className={`${baseStyles} ${variantStyles}`}
    >
      <GlitchText 
        as="span" 
        glitchIntensity="medium"
      >
        {children}
      </GlitchText>
    </button>
  );
}
```

### 8. Status Badge with Glitch

```tsx
// components/stream-status-badge.tsx
import GlitchText from "@/components/glitch-text";

type Status = "active" | "paused" | "completed";

interface StatusBadgeProps {
  status: Status;
}

export default function StreamStatusBadge({ status }: StatusBadgeProps) {
  const statusConfig = {
    active: { color: "text-green-400", label: "Active" },
    paused: { color: "text-yellow-400", label: "Paused" },
    completed: { color: "text-gray-400", label: "Completed" },
  };

  const config = statusConfig[status];

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${config.color} border-current`}>
      <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
      <GlitchText 
        as="span" 
        className={`text-sm font-semibold ${config.color}`}
        glitchIntensity="low"
      >
        {config.label}
      </GlitchText>
    </div>
  );
}
```

## Styling Tips

### With Tailwind CSS

```tsx
// Gradient text
<GlitchText 
  className="bg-gradient-to-r from-cyan-400 to-violet-600 bg-clip-text text-transparent"
>
  Gradient Title
</GlitchText>

// With custom font
<GlitchText 
  className="font-syne font-extrabold tracking-tight"
>
  Custom Font
</GlitchText>

// Responsive sizing
<GlitchText 
  className="text-3xl md:text-5xl lg:text-7xl"
>
  Responsive Title
</GlitchText>
```

### With Custom CSS

```tsx
// In your component
<style jsx>{`
  .custom-glitch {
    letter-spacing: -0.02em;
    text-shadow: 0 0 20px rgba(0, 229, 255, 0.3);
  }
`}</style>

<GlitchText className="custom-glitch">
  Custom Styled
</GlitchText>
```

## Best Practices

1. **Hierarchy**: Use higher intensity for more important headings
   - H1 (Hero): High intensity
   - H2 (Sections): Medium intensity
   - H3 (Cards): Low intensity

2. **Frequency**: Don't overuse - reserve for key UI elements
   - ✅ Page titles, section headers, active nav items
   - ❌ Every paragraph, body text, small labels

3. **Context**: Match intensity to user action importance
   - High: Primary CTAs, hero sections
   - Medium: Interactive elements, modal headers
   - Low: Subtle feedback, secondary elements

4. **Performance**: Limit always-on glitches to 1-2 per page
   - Prefer hover-triggered for most use cases
   - Use always-on sparingly for hero sections

5. **Accessibility**: Ensure sufficient contrast
   - Test with color contrast checkers
   - Maintain readability during animation
   - Consider adding `prefers-reduced-motion` support

## Testing

```tsx
// Test in your component
import { render, screen } from "@testing-library/react";
import GlitchText from "@/components/glitch-text";

describe("GlitchText Integration", () => {
  it("renders with correct text", () => {
    render(<GlitchText>Test Title</GlitchText>);
    expect(screen.getByText("Test Title")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(<GlitchText className="custom-class">Test</GlitchText>);
    const element = screen.getByText("Test");
    expect(element).toHaveClass("custom-class");
  });
});
```

## Troubleshooting

### Text not visible
- Check parent container has proper background
- Verify text color contrast
- Ensure z-index isn't causing issues

### Animation not triggering
- Confirm `glitchOnHover` prop is set correctly
- Check for CSS conflicts with parent styles
- Verify hover state is accessible (not disabled)

### Performance issues
- Reduce number of always-on glitches
- Use lower intensity settings
- Consider debouncing hover events for lists

## Related Documentation

- [README_GLITCH_TEXT.md](./README_GLITCH_TEXT.md) - Full component documentation
- [glitch-text-example.tsx](./glitch-text-example.tsx) - Interactive demo
- [glitch-text.tsx](./glitch-text.tsx) - Component source code
