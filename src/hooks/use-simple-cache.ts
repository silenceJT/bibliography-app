import { useState, useEffect, useCallback, useRef } from "react";
import { Bibliography } from "../types/bibliography";

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
  recentItems: Bibliography[]; // BRUTAL: Use full Bibliography objects for consistent card display
}

// Bibliography response structure
interface BibliographyResponse {
  data: Bibliography[];
  total: number;
  page: number;
  totalPages: number;
}

// Parameter-based cache key generator
const generateCacheKey = (
  page: number,
  limit: number,
  sortBy: string,
  sortOrder: string,
  query: string,
  filters: Record<string, string>
): string => {
  const filterString = Object.entries(filters)
    .filter(([_, value]) => value && value.trim())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}:${value}`)
    .join("|");

  return `bibliography:${page}:${limit}:${sortBy}:${sortOrder}:${query}:${filterString}`;
};

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

// Parameter-based cache for bibliography data
class ParameterizedCache<T> {
  private cache = new Map<string, SimpleCache<T>>();
  private readonly ttl: number;

  constructor(ttlMinutes: number = 5) {
    this.ttl = ttlMinutes * 60 * 1000;
  }

  getCache(key: string): SimpleCache<T> {
    if (!this.cache.has(key)) {
      this.cache.set(key, new SimpleCache<T>(this.ttl / (60 * 1000)));
    }
    return this.cache.get(key)!;
  }

  invalidateAll(): void {
    this.cache.clear();
  }

  invalidateByPattern(pattern: string): void {
    const keysToDelete: string[] = [];
    this.cache.forEach((_, key) => {
      if (key.includes(pattern)) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach((key) => this.cache.delete(key));
  }
}

// Cache instances
const dashboardCache = new SimpleCache<DashboardData>(5);
const bibliographyCache = new ParameterizedCache<BibliographyResponse>(5);

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

// Bibliography data loading with search, filters, pagination, and sorting
const loadBibliographyData = async (
  page: number = 1,
  limit: number = 20,
  sortBy: string = "created_at",
  sortOrder: "asc" | "desc" = "desc",
  query: string = "",
  filters: Record<string, string> = {}
): Promise<BibliographyResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    sortBy,
    sortOrder,
  });

  // Add search query
  if (query.trim()) {
    params.append("q", query.trim());
  }

  // Add filters
  Object.entries(filters).forEach(([key, value]) => {
    if (value && value.trim()) {
      params.append(key, value.trim());
    }
  });

  return fetchWithErrorHandling(`/api/bibliography?${params}`);
};

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

// Bibliography hook with search, filters, pagination, and sorting
export const useBibliographyData = (
  page: number = 1,
  limit: number = 20,
  sortBy: string = "created_at",
  sortOrder: "asc" | "desc" = "desc",
  query: string = "",
  filters: Record<string, string> = {}
) => {
  // Generate cache key based on parameters
  const cacheKey = generateCacheKey(
    page,
    limit,
    sortBy,
    sortOrder,
    query,
    filters
  );
  const cache = bibliographyCache.getCache(cacheKey);

  const [data, setData] = useState<Bibliography[] | null>(
    cache.getData()?.data || null
  );
  const [total, setTotal] = useState(cache.getData()?.total || 0);
  const [totalPages, setTotalPages] = useState(
    cache.getData()?.totalPages || 1
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(cache.getError());
  const hasInitialized = useRef(false);
  const lastCacheKey = useRef(cacheKey);

  const refetch = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await loadBibliographyData(
        page,
        limit,
        sortBy,
        sortOrder,
        query,
        filters
      );

      setData(result.data);
      setTotal(result.total);
      setTotalPages(result.totalPages);

      // Update the correct cache instance
      const currentCache = bibliographyCache.getCache(cacheKey);
      currentCache.updateData(result);
    } catch (err) {
      const errorMessage = createErrorMessage(err);
      setError(errorMessage);
      const currentCache = bibliographyCache.getCache(cacheKey);
      currentCache.setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, sortBy, sortOrder, query, filters, cacheKey]);

  // Single useEffect to handle both initial load and parameter changes
  useEffect(() => {
    const currentCache = bibliographyCache.getCache(cacheKey);

    // Check if we need to fetch data
    const needsFetch = !currentCache.getData() || currentCache.isStale();

    if (needsFetch) {
      refetch();
    } else {
      // Update state with cached data
      const cachedData = currentCache.getData();
      if (cachedData) {
        setData(cachedData.data);
        setTotal(cachedData.total);
        setTotalPages(cachedData.totalPages);
      }
      setError(currentCache.getError());
    }

    lastCacheKey.current = cacheKey;
  }, [cacheKey, refetch]);

  const goToPage = useCallback((newPage: number) => {
    // This will trigger a refetch with the new page
    // The parent component should update its page state
  }, []);

  return {
    data,
    total,
    totalPages,
    isLoading,
    error,
    refetch,
    goToPage,
  };
};
