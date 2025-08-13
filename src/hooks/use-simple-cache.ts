import { useState, useEffect, useCallback, useRef } from "react";
import { Bibliography } from "@/types/bibliography";

// Dashboard data structure based on actual API response
interface DashboardData {
  stats: {
    totalRecords: number;
    thisYear: number;
    languages: number;
    countries: number;
  };
  languages: Array<{
    language: string;
    count: number;
    percentage: number;
  }>;
  recentItems: Array<{
    _id: string;
    title: string;
    author: string;
    year: string;
    publication: string;
    language_published: string;
    created_at?: Date;
  }>;
}

// Simplified cache class - only what we actually need
class SimpleCache<T> {
  private data: T | null = null;
  private error: string | null = null;
  private lastFetch: number = 0;
  private readonly ttl: number;

  constructor(ttlMinutes: number = 5) {
    this.ttl = ttlMinutes * 60 * 1000;
  }

  getData(): T | null {
    return this.data;
  }

  getError(): string | null {
    return this.error;
  }

  isStale(): boolean {
    return Date.now() - this.lastFetch > this.ttl;
  }

  invalidate(): void {
    this.data = null;
    this.error = null;
    this.lastFetch = 0;
  }

  updateData(newData: T): void {
    this.data = newData;
    this.error = null;
    this.lastFetch = Date.now();
  }

  setError(errorMessage: string): void {
    this.error = errorMessage;
    this.lastFetch = Date.now();
  }
}

// Cache instances
const dashboardCache = new SimpleCache<DashboardData>(5);
const bibliographyCache = new SimpleCache<Bibliography[]>(5);

// Common error handling
const createErrorMessage = (error: unknown): string => {
  return error instanceof Error ? error.message : "Failed to fetch";
};

// Common fetch wrapper
const fetchWithErrorHandling = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
};

// Dashboard data loading
const loadDashboardData = async (): Promise<DashboardData> => {
  return fetchWithErrorHandling("/api/dashboard/summary");
};

// Bibliography data loading
const loadBibliographyData = async (): Promise<{ data: Bibliography[] }> => {
  return fetchWithErrorHandling("/api/bibliography");
};

// Generic hook factory to reduce duplication
function createDataHook<T>(
  cache: SimpleCache<T>,
  loadFn: () => Promise<T>,
  initialData?: T
) {
  return () => {
    const [data, setData] = useState<T | null>(
      cache.getData() || initialData || null
    );
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(cache.getError());
    const hasInitialized = useRef(false);

    const refetch = useCallback(async () => {
      try {
        setIsLoading(true);
        setError(null);

        cache.invalidate();
        const newData = await loadFn();

        cache.updateData(newData);
        setData(newData);
      } catch (err) {
        const errorMessage = createErrorMessage(err);
        setError(errorMessage);
        cache.setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }, []);

    // Initial load - only once on mount
    useEffect(() => {
      if (hasInitialized.current) return;
      hasInitialized.current = true;

      if (!cache.getData() || cache.isStale()) {
        refetch();
      }
    }, [refetch]);

    return { data, isLoading, error, refetch };
  };
}

// Dashboard hook with progressive loading and optimistic updates
export function useDashboardData() {
  const [data, setData] = useState<DashboardData | null>(
    dashboardCache.getData()
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(dashboardCache.getError());
  const [loadingStage, setLoadingStage] = useState<
    "idle" | "critical" | "detailed"
  >("idle");
  const [optimisticData, setOptimisticData] = useState<DashboardData | null>(
    data
  );
  const hasInitialized = useRef(false);
  const dataRef = useRef(data);

  // Keep ref in sync with state
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  const displayData = optimisticData || data;

  const refetch = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      setLoadingStage("critical");

      // Optimistic update
      if (dataRef.current) {
        setOptimisticData(dataRef.current);
      }

      dashboardCache.invalidate();
      const newData = await loadDashboardData();

      setData(newData);
      setOptimisticData(null);
      dashboardCache.updateData(newData);
      setLoadingStage("idle");
    } catch (err) {
      const errorMessage = createErrorMessage(err);
      setError(errorMessage);
      setLoadingStage("idle");
      setOptimisticData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    if (!dashboardCache.getData() || dashboardCache.isStale()) {
      refetch();
    }
  }, [refetch]);

  return { data: displayData, isLoading, error, refetch, loadingStage };
}

// Bibliography hook using the factory pattern
export const useBibliographyData = createDataHook(
  bibliographyCache,
  async () => {
    const result = await loadBibliographyData();
    return result.data || [];
  }
);
