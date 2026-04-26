# Nebula Skeleton Integration Guide

Quick reference for integrating the Nebula Pulse skeleton into your components.

## Quick Start

### 1. Import the Component

```tsx
import NebulaSkeleton from "@/components/nebula-skeleton";
```

### 2. Replace Loading States

Before:
```tsx
{isLoading && <div className="spinner">Loading...</div>}
{!isLoading && <StreamSummaryCard {...data} />}
```

After:
```tsx
{isLoading && <NebulaSkeleton variant="card" />}
{!isLoading && <StreamSummaryCard {...data} />}
```

## Common Patterns

### Pattern 1: Single Card Loading

```tsx
export default function StreamDetail({ streamId }: { streamId: string }) {
  const [stream, setStream] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStream(streamId).then((data) => {
      setStream(data);
      setLoading(false);
    });
  }, [streamId]);

  if (loading) {
    return <NebulaSkeleton variant="card" />;
  }

  return <StreamSummaryCard {...stream} />;
}
```

### Pattern 2: List Loading

```tsx
export default function StreamList() {
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStreams().then((data) => {
      setStreams(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="stream-list">
      {loading ? (
        <>
          <NebulaSkeleton variant="list-item" />
          <NebulaSkeleton variant="list-item" />
          <NebulaSkeleton variant="list-item" />
        </>
      ) : (
        streams.map((stream) => (
          <StreamListItem key={stream.id} {...stream} />
        ))
      )}
    </div>
  );
}
```

### Pattern 3: Dashboard Grid

```tsx
export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData().then((data) => {
      setData(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="dashboard-grid">
        <NebulaSkeleton variant="bento-small" />
        <NebulaSkeleton variant="bento-small" />
        <NebulaSkeleton variant="bento-large" />
        <NebulaSkeleton variant="bento-small" />
      </div>
    );
  }

  return (
    <div className="dashboard-grid">
      {/* Your actual dashboard content */}
    </div>
  );
}
```

### Pattern 4: Suspense Boundary

```tsx
import { Suspense } from "react";

export default function StreamPage() {
  return (
    <Suspense fallback={<NebulaSkeleton variant="card" />}>
      <StreamContent />
    </Suspense>
  );
}
```

### Pattern 5: Conditional Sections

```tsx
export default function ProfilePage() {
  const { user, streams, loading } = useProfile();

  return (
    <div className="profile-page">
      <UserHeader user={user} />
      
      <section className="streams-section">
        <h2>Active Streams</h2>
        {loading ? (
          <div className="stream-grid">
            <NebulaSkeleton variant="card" />
            <NebulaSkeleton variant="card" />
          </div>
        ) : (
          <div className="stream-grid">
            {streams.map((stream) => (
              <StreamSummaryCard key={stream.id} {...stream} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
```

## Variant Selection Guide

| Use Case | Variant | Dimensions |
|----------|---------|------------|
| Stream cards, profile cards | `card` | 380px × auto |
| Dashboard tiles (small) | `bento-small` | 360px × 200px |
| Dashboard tiles (large) | `bento-large` | 100% × 320px |
| List items, table rows | `list-item` | 100% × 80px |

## Styling Tips

### Match Your Layout

Ensure the skeleton matches your actual content layout:

```tsx
// If your cards are in a grid
<div className="grid grid-cols-3 gap-6">
  {loading ? (
    <>
      <NebulaSkeleton variant="card" />
      <NebulaSkeleton variant="card" />
      <NebulaSkeleton variant="card" />
    </>
  ) : (
    cards.map((card) => <Card key={card.id} {...card} />)
  )}
</div>
```

### Custom Width

```tsx
<NebulaSkeleton 
  variant="card" 
  className="w-full max-w-md"
/>
```

### Responsive Grids

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {loading ? (
    Array.from({ length: 6 }).map((_, i) => (
      <NebulaSkeleton key={i} variant="card" />
    ))
  ) : (
    items.map((item) => <ItemCard key={item.id} {...item} />)
  )}
</div>
```

## Performance Best Practices

### 1. Minimum Display Time

Avoid flashing skeletons by ensuring they display for at least 300ms:

```tsx
const [loading, setLoading] = useState(true);
const [minTimeElapsed, setMinTimeElapsed] = useState(false);

useEffect(() => {
  const timer = setTimeout(() => setMinTimeElapsed(true), 300);
  return () => clearTimeout(timer);
}, []);

useEffect(() => {
  fetchData().then((data) => {
    setData(data);
    setLoading(false);
  });
}, []);

const showSkeleton = loading || !minTimeElapsed;
```

### 2. Skeleton Count

Match the expected number of items:

```tsx
const SKELETON_COUNT = 6; // Expected number of items

{loading ? (
  Array.from({ length: SKELETON_COUNT }).map((_, i) => (
    <NebulaSkeleton key={i} variant="list-item" />
  ))
) : (
  items.map((item) => <Item key={item.id} {...item} />)
)}
```

### 3. Progressive Loading

Show skeletons for sections that are still loading:

```tsx
<div className="page">
  {/* Header loaded */}
  <Header data={headerData} />
  
  {/* Content still loading */}
  {contentLoading ? (
    <NebulaSkeleton variant="bento-large" />
  ) : (
    <Content data={contentData} />
  )}
  
  {/* Sidebar still loading */}
  {sidebarLoading ? (
    <NebulaSkeleton variant="card" />
  ) : (
    <Sidebar data={sidebarData} />
  )}
</div>
```

## Accessibility Checklist

- ✅ Skeleton has `role="status"` (built-in)
- ✅ Skeleton has `aria-label="Loading content"` (built-in)
- ✅ Hidden "Loading..." text for screen readers (built-in)
- ⚠️ Ensure loading state is announced when it changes
- ⚠️ Consider focus management when content loads

### Announce Loading State Changes

```tsx
import { useEffect } from "react";

export default function StreamList() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Announce to screen readers
    const announcement = document.createElement("div");
    announcement.setAttribute("role", "status");
    announcement.setAttribute("aria-live", "polite");
    announcement.className = "sr-only";
    announcement.textContent = loading ? "Loading streams" : "Streams loaded";
    document.body.appendChild(announcement);
    
    return () => document.body.removeChild(announcement);
  }, [loading]);

  // ... rest of component
}
```

## Testing

### Visual Regression Testing

```tsx
// Test skeleton appearance
describe("NebulaSkeleton", () => {
  it("renders card variant", () => {
    render(<NebulaSkeleton variant="card" />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("renders with custom className", () => {
    const { container } = render(
      <NebulaSkeleton variant="card" className="custom-class" />
    );
    expect(container.firstChild).toHaveClass("custom-class");
  });
});
```

### Integration Testing

```tsx
// Test loading state transitions
describe("StreamList", () => {
  it("shows skeleton while loading", async () => {
    render(<StreamList />);
    expect(screen.getByRole("status")).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });
  });
});
```

## Troubleshooting

### Skeleton doesn't match content size

Ensure you're using the correct variant or add custom styles:

```tsx
<NebulaSkeleton 
  variant="card" 
  className="h-[500px]" // Match your content height
/>
```

### Animation performance issues

The animations use CSS transforms and are hardware-accelerated. If you experience issues:

1. Check browser support for `backdrop-filter`
2. Reduce the number of simultaneous skeletons
3. Consider disabling animations for low-end devices:

```tsx
<NebulaSkeleton 
  variant="card"
  className={reducedMotion ? "no-animation" : ""}
/>
```

### Skeleton flashes briefly

Implement minimum display time (see Performance Best Practices above).

## Migration Checklist

- [ ] Replace all spinner/loading indicators with NebulaSkeleton
- [ ] Choose appropriate variant for each use case
- [ ] Test loading states in all components
- [ ] Verify accessibility with screen readers
- [ ] Check responsive behavior on mobile
- [ ] Test with slow network conditions
- [ ] Verify animations perform well
- [ ] Update Storybook/documentation

## Related Documentation

- [README_NEBULA_SKELETON.md](./README_NEBULA_SKELETON.md) - Full component documentation
- [nebula-skeleton-example.tsx](./nebula-skeleton-example.tsx) - Interactive demo
- [streamsummarycard.tsx](./streamsummarycard.tsx) - Example card component
