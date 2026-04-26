# Loading State Hooks

Custom React hooks for managing loading states with the Nebula Skeleton component.

## Overview

These hooks solve common loading state problems:
- **Skeleton flashing**: Prevents brief flashes when data loads quickly
- **Multiple sections**: Manage independent loading states for different page sections
- **Async operations**: Automatic loading state management for API calls

## Hooks

### `useLoadingState`

Manages a single loading state with minimum display time to prevent flashing.

#### Usage

```tsx
import { useLoadingState } from "@/lib/use-loading-state";
import NebulaSkeleton from "@/components/nebula-skeleton";

function StreamList() {
  const [isLoading, setIsLoading] = useLoadingState(300); // 300ms minimum
  const [streams, setStreams] = useState([]);

  useEffect(() => {
    setIsLoading(true);
    fetchStreams().then((data) => {
      setStreams(data);
      setIsLoading(false);
    });
  }, []);

  return isLoading ? (
    <NebulaSkeleton variant="card" />
  ) : (
    <StreamCard data={streams} />
  );
}
```

#### Parameters

- `minTime` (number, optional): Minimum time to display loading state in milliseconds. Default: 300ms

#### Returns

- `[isLoading, setIsLoading]`: Tuple with loading state and setter function

---

### `useMultipleLoadingStates`

Manages multiple independent loading states for different page sections.

#### Usage

```tsx
import { useMultipleLoadingStates } from "@/lib/use-loading-state";
import NebulaSkeleton from "@/components/nebula-skeleton";

function Dashboard() {
  const loading = useMultipleLoadingStates(['streams', 'vault', 'stats'], 300);
  const [streams, setStreams] = useState([]);
  const [vault, setVault] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    // Load streams
    loading.setLoading('streams', true);
    fetchStreams().then((data) => {
      setStreams(data);
      loading.setLoading('streams', false);
    });

    // Load vault (independent timing)
    loading.setLoading('vault', true);
    fetchVault().then((data) => {
      setVault(data);
      loading.setLoading('vault', false);
    });

    // Load stats
    loading.setLoading('stats', true);
    fetchStats().then((data) => {
      setStats(data);
      loading.setLoading('stats', false);
    });
  }, []);

  return (
    <div className="dashboard">
      <section>
        {loading.isLoading('streams') ? (
          <NebulaSkeleton variant="card" />
        ) : (
          <StreamList data={streams} />
        )}
      </section>

      <section>
        {loading.isLoading('vault') ? (
          <NebulaSkeleton variant="bento-large" />
        ) : (
          <VaultInfo data={vault} />
        )}
      </section>

      <section>
        {loading.isLoading('stats') ? (
          <NebulaSkeleton variant="bento-small" />
        ) : (
          <Stats data={stats} />
        )}
      </section>
    </div>
  );
}
```

#### Parameters

- `keys` (string[]): Array of keys for different loading states
- `minTime` (number, optional): Minimum time to display loading state. Default: 300ms

#### Returns

Object with methods:
- `isLoading(key)`: Check if a specific section is loading
- `setLoading(key, loading)`: Set loading state for a specific section
- `isAnyLoading()`: Check if any section is loading
- `isAllLoading()`: Check if all sections are loading

---

### `useAsyncLoading`

Automatic loading state management for async operations with error handling.

#### Usage

```tsx
import { useAsyncLoading } from "@/lib/use-loading-state";
import NebulaSkeleton from "@/components/nebula-skeleton";

function StreamDetail({ streamId }: { streamId: string }) {
  const { execute, isLoading, error, data } = useAsyncLoading(
    async (id: string) => {
      const response = await fetch(`/api/streams/${id}`);
      if (!response.ok) throw new Error('Failed to fetch stream');
      return response.json();
    },
    300
  );

  useEffect(() => {
    execute(streamId);
  }, [streamId]);

  if (error) {
    return <ErrorMessage error={error} />;
  }

  return isLoading ? (
    <NebulaSkeleton variant="card" />
  ) : (
    <StreamCard data={data} />
  );
}
```

#### Parameters

- `asyncFn`: Async function to execute
- `minTime` (number, optional): Minimum time to display loading state. Default: 300ms

#### Returns

Object with:
- `execute(...args)`: Function to execute the async operation
- `isLoading`: Boolean indicating loading state
- `error`: Error object if operation failed, null otherwise
- `data`: Result data if operation succeeded, null otherwise
- `reset()`: Reset all states to initial values

---

## Examples

### Example 1: Simple Loading State

```tsx
import { useLoadingState } from "@/lib/use-loading-state";
import NebulaSkeleton from "@/components/nebula-skeleton";

function UserProfile({ userId }: { userId: string }) {
  const [isLoading, setIsLoading] = useLoadingState();
  const [user, setUser] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    fetchUser(userId)
      .then(setUser)
      .finally(() => setIsLoading(false));
  }, [userId]);

  return isLoading ? <NebulaSkeleton variant="card" /> : <Profile user={user} />;
}
```

### Example 2: Multiple Sections

```tsx
import { useMultipleLoadingStates } from "@/lib/use-loading-state";
import NebulaSkeleton from "@/components/nebula-skeleton";

function ProfilePage() {
  const loading = useMultipleLoadingStates(['profile', 'streams', 'activity']);

  useEffect(() => {
    // Load profile
    loading.setLoading('profile', true);
    fetchProfile().then(() => loading.setLoading('profile', false));

    // Load streams
    loading.setLoading('streams', true);
    fetchStreams().then(() => loading.setLoading('streams', false));

    // Load activity
    loading.setLoading('activity', true);
    fetchActivity().then(() => loading.setLoading('activity', false));
  }, []);

  return (
    <div className="profile-page">
      {loading.isLoading('profile') ? (
        <NebulaSkeleton variant="card" />
      ) : (
        <ProfileCard />
      )}

      {loading.isLoading('streams') ? (
        <NebulaSkeleton variant="bento-large" />
      ) : (
        <StreamsList />
      )}

      {loading.isLoading('activity') ? (
        <>
          <NebulaSkeleton variant="list-item" />
          <NebulaSkeleton variant="list-item" />
          <NebulaSkeleton variant="list-item" />
        </>
      ) : (
        <ActivityFeed />
      )}
    </div>
  );
}
```

### Example 3: Async with Error Handling

```tsx
import { useAsyncLoading } from "@/lib/use-loading-state";
import NebulaSkeleton from "@/components/nebula-skeleton";

function StreamList() {
  const { execute, isLoading, error, data, reset } = useAsyncLoading(fetchStreams);

  useEffect(() => {
    execute();
  }, []);

  const handleRetry = () => {
    reset();
    execute();
  };

  if (error) {
    return (
      <div className="error-state">
        <p>Failed to load streams: {error.message}</p>
        <button onClick={handleRetry}>Retry</button>
      </div>
    );
  }

  return isLoading ? (
    <>
      <NebulaSkeleton variant="card" />
      <NebulaSkeleton variant="card" />
      <NebulaSkeleton variant="card" />
    </>
  ) : (
    <div className="streams-grid">
      {data?.map((stream) => (
        <StreamCard key={stream.id} {...stream} />
      ))}
    </div>
  );
}
```

### Example 4: Progressive Loading

```tsx
import { useMultipleLoadingStates } from "@/lib/use-loading-state";
import NebulaSkeleton from "@/components/nebula-skeleton";

function Dashboard() {
  const loading = useMultipleLoadingStates(['header', 'main', 'sidebar']);

  useEffect(() => {
    // Load header first (fastest)
    loading.setLoading('header', true);
    fetchHeader().then(() => loading.setLoading('header', false));

    // Then main content
    loading.setLoading('main', true);
    fetchMainContent().then(() => loading.setLoading('main', false));

    // Finally sidebar (slowest)
    loading.setLoading('sidebar', true);
    fetchSidebar().then(() => loading.setLoading('sidebar', false));
  }, []);

  return (
    <div className="dashboard-layout">
      <header>
        {loading.isLoading('header') ? (
          <NebulaSkeleton variant="bento-small" />
        ) : (
          <DashboardHeader />
        )}
      </header>

      <main>
        {loading.isLoading('main') ? (
          <NebulaSkeleton variant="bento-large" />
        ) : (
          <MainContent />
        )}
      </main>

      <aside>
        {loading.isLoading('sidebar') ? (
          <>
            <NebulaSkeleton variant="list-item" />
            <NebulaSkeleton variant="list-item" />
          </>
        ) : (
          <Sidebar />
        )}
      </aside>
    </div>
  );
}
```

### Example 5: With React Suspense

```tsx
import { useAsyncLoading } from "@/lib/use-loading-state";
import NebulaSkeleton from "@/components/nebula-skeleton";
import { Suspense } from "react";

function StreamPage({ streamId }: { streamId: string }) {
  return (
    <Suspense fallback={<NebulaSkeleton variant="card" />}>
      <StreamContent streamId={streamId} />
    </Suspense>
  );
}

function StreamContent({ streamId }: { streamId: string }) {
  const { data, isLoading, error } = useAsyncLoading(
    () => fetchStream(streamId),
    300
  );

  if (error) throw error; // Caught by error boundary
  if (isLoading) return <NebulaSkeleton variant="card" />;

  return <StreamCard data={data} />;
}
```

## Best Practices

### 1. Choose Appropriate Minimum Time

```tsx
// Fast operations (< 500ms expected): 300ms minimum
const [isLoading, setIsLoading] = useLoadingState(300);

// Slow operations (> 1s expected): 500ms minimum
const [isLoading, setIsLoading] = useLoadingState(500);

// Very slow operations (> 3s expected): 1000ms minimum
const [isLoading, setIsLoading] = useLoadingState(1000);
```

### 2. Match Skeleton Count to Expected Items

```tsx
const { isLoading, data } = useAsyncLoading(fetchStreams);

return isLoading ? (
  // Show expected number of skeletons
  <>
    <NebulaSkeleton variant="card" />
    <NebulaSkeleton variant="card" />
    <NebulaSkeleton variant="card" />
  </>
) : (
  data.map(stream => <StreamCard key={stream.id} {...stream} />)
);
```

### 3. Use Multiple States for Independent Sections

```tsx
// Good: Independent loading states
const loading = useMultipleLoadingStates(['section1', 'section2']);

// Bad: Single loading state for everything
const [isLoading, setIsLoading] = useLoadingState();
```

### 4. Handle Errors Gracefully

```tsx
const { isLoading, error, data, reset } = useAsyncLoading(fetchData);

if (error) {
  return (
    <ErrorState 
      message={error.message}
      onRetry={reset}
    />
  );
}
```

### 5. Cleanup on Unmount

The hooks automatically cleanup timeouts, but ensure you don't set state after unmount:

```tsx
useEffect(() => {
  let mounted = true;

  setIsLoading(true);
  fetchData().then((data) => {
    if (mounted) {
      setData(data);
      setIsLoading(false);
    }
  });

  return () => {
    mounted = false;
  };
}, []);
```

## TypeScript Support

All hooks are fully typed:

```tsx
// Type-safe keys
const loading = useMultipleLoadingStates(['streams', 'vault'] as const);
loading.isLoading('streams'); // ✓ Valid
loading.isLoading('invalid'); // ✗ Type error

// Type-safe async function
const { execute, data } = useAsyncLoading<Stream[], [string]>(
  async (streamId: string): Promise<Stream[]> => {
    return fetchStreams(streamId);
  }
);
```

## Performance

- Hooks use refs to avoid unnecessary re-renders
- Timeouts are automatically cleaned up
- Minimum overhead: ~1-2ms per hook

## Browser Support

Works in all modern browsers that support:
- React Hooks
- setTimeout/clearTimeout
- Date.now()

## Related

- [Nebula Skeleton Component](../components/README_NEBULA_SKELETON.md)
- [Integration Guide](../components/NEBULA_SKELETON_INTEGRATION.md)
- [Integration Demo](../components/nebula-skeleton-integration-demo.tsx)
