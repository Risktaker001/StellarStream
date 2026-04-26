import { useState, useEffect, useRef } from "react";

/**
 * Custom hook for managing loading states with minimum display time
 * Prevents skeleton flashing by ensuring it displays for at least minTime ms
 * 
 * @param minTime - Minimum time to show loading state (default: 300ms)
 * @returns [isLoading, setIsLoading] - Loading state and setter
 * 
 * @example
 * ```tsx
 * const [isLoading, setIsLoading] = useLoadingState(300);
 * 
 * useEffect(() => {
 *   setIsLoading(true);
 *   fetchData().then(() => setIsLoading(false));
 * }, []);
 * 
 * return isLoading ? <NebulaSkeleton /> : <Content />;
 * ```
 */
export function useLoadingState(minTime: number = 300): [boolean, (loading: boolean) => void] {
  const [isLoading, setIsLoadingInternal] = useState(false);
  const [shouldShow, setShouldShow] = useState(false);
  const loadingStartTime = useRef<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const setIsLoading = (loading: boolean) => {
    if (loading) {
      // Start loading
      loadingStartTime.current = Date.now();
      setIsLoadingInternal(true);
      setShouldShow(true);
    } else {
      // Stop loading
      setIsLoadingInternal(false);
      
      if (loadingStartTime.current) {
        const elapsed = Date.now() - loadingStartTime.current;
        const remaining = Math.max(0, minTime - elapsed);
        
        if (remaining > 0) {
          // Wait for minimum time before hiding
          timeoutRef.current = setTimeout(() => {
            setShouldShow(false);
            loadingStartTime.current = null;
          }, remaining);
        } else {
          // Minimum time already elapsed
          setShouldShow(false);
          loadingStartTime.current = null;
        }
      } else {
        setShouldShow(false);
      }
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return [shouldShow, setIsLoading];
}

/**
 * Custom hook for managing multiple loading states
 * Useful for pages with multiple independent loading sections
 * 
 * @param keys - Array of keys for different loading states
 * @param minTime - Minimum time to show loading state (default: 300ms)
 * @returns Object with loading states and setters
 * 
 * @example
 * ```tsx
 * const loading = useMultipleLoadingStates(['streams', 'vault', 'dashboard']);
 * 
 * useEffect(() => {
 *   loading.setLoading('streams', true);
 *   fetchStreams().then(() => loading.setLoading('streams', false));
 * }, []);
 * 
 * return (
 *   <>
 *     {loading.isLoading('streams') ? <NebulaSkeleton /> : <Streams />}
 *     {loading.isLoading('vault') ? <NebulaSkeleton /> : <Vault />}
 *   </>
 * );
 * ```
 */
export function useMultipleLoadingStates<T extends string>(
  keys: T[],
  minTime: number = 300
): {
  isLoading: (key: T) => boolean;
  setLoading: (key: T, loading: boolean) => void;
  isAnyLoading: () => boolean;
  isAllLoading: () => boolean;
} {
  const [loadingStates, setLoadingStates] = useState<Record<T, boolean>>(
    keys.reduce((acc, key) => ({ ...acc, [key]: false }), {} as Record<T, boolean>)
  );
  
  const [shouldShowStates, setShouldShowStates] = useState<Record<T, boolean>>(
    keys.reduce((acc, key) => ({ ...acc, [key]: false }), {} as Record<T, boolean>)
  );
  
  const loadingStartTimes = useRef<Record<T, number | null>>(
    keys.reduce((acc, key) => ({ ...acc, [key]: null }), {} as Record<T, number | null>)
  );
  
  const timeoutRefs = useRef<Record<T, NodeJS.Timeout | null>>(
    keys.reduce((acc, key) => ({ ...acc, [key]: null }), {} as Record<T, NodeJS.Timeout | null>)
  );

  const setLoading = (key: T, loading: boolean) => {
    if (loading) {
      // Start loading
      loadingStartTimes.current[key] = Date.now();
      setLoadingStates(prev => ({ ...prev, [key]: true }));
      setShouldShowStates(prev => ({ ...prev, [key]: true }));
    } else {
      // Stop loading
      setLoadingStates(prev => ({ ...prev, [key]: false }));
      
      if (loadingStartTimes.current[key]) {
        const elapsed = Date.now() - loadingStartTimes.current[key]!;
        const remaining = Math.max(0, minTime - elapsed);
        
        if (remaining > 0) {
          // Wait for minimum time before hiding
          timeoutRefs.current[key] = setTimeout(() => {
            setShouldShowStates(prev => ({ ...prev, [key]: false }));
            loadingStartTimes.current[key] = null;
          }, remaining);
        } else {
          // Minimum time already elapsed
          setShouldShowStates(prev => ({ ...prev, [key]: false }));
          loadingStartTimes.current[key] = null;
        }
      } else {
        setShouldShowStates(prev => ({ ...prev, [key]: false }));
      }
    }
  };

  const isLoading = (key: T): boolean => {
    return shouldShowStates[key] || false;
  };

  const isAnyLoading = (): boolean => {
    return Object.values(shouldShowStates).some(state => state);
  };

  const isAllLoading = (): boolean => {
    return Object.values(shouldShowStates).every(state => state);
  };

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      for (const timeout of Object.values(timeoutRefs.current) as Array<NodeJS.Timeout | null>) {
        if (timeout !== null) {
          clearTimeout(timeout);
        }
      }
    };
  }, []);

  return {
    isLoading,
    setLoading,
    isAnyLoading,
    isAllLoading,
  };
}

/**
 * Custom hook for async operations with automatic loading state management
 * Handles loading state, errors, and minimum display time automatically
 * 
 * @param asyncFn - Async function to execute
 * @param minTime - Minimum time to show loading state (default: 300ms)
 * @returns Object with execute function, loading state, error, and data
 * 
 * @example
 * ```tsx
 * const { execute, isLoading, error, data } = useAsyncLoading(fetchStreams);
 * 
 * useEffect(() => {
 *   execute();
 * }, []);
 * 
 * if (error) return <ErrorMessage error={error} />;
 * return isLoading ? <NebulaSkeleton /> : <Streams data={data} />;
 * ```
 */
export function useAsyncLoading<T, Args extends any[] = []>(
  asyncFn: (...args: Args) => Promise<T>,
  minTime: number = 300
) {
  const [isLoading, setIsLoading] = useLoadingState(minTime);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<T | null>(null);

  const execute = async (...args: Args) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await asyncFn(...args);
      setData(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setIsLoading(false);
    setError(null);
    setData(null);
  };

  return {
    execute,
    isLoading,
    error,
    data,
    reset,
  };
}
