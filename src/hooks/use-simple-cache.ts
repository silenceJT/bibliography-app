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

// Bibliography data loading with search, filters, pagination, and sorting
const loadBibliographyData = async (
  page: number = 1,
  limit: number = 20,
  sortBy: string = "created_at",
  sortOrder: "asc" | "desc" = "desc",
  query: string = "",
  filters: Record<string, string> = {}
): Promise<{
  data: Bibliography[];
  total: number;
  page: number;
  totalPages: number;
}> => {
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

// Bibliography hook with search, filters, pagination, and sorting
export const useBibliographyData = (
  page: number = 1,
  limit: number = 20,
  sortBy: string = "created_at",
  sortOrder: "asc" | "desc" = "desc",
  query: string = "",
  filters: Record<string, string> = {}
) => {
  const [data, setData] = useState<Bibliography[] | null>(
    bibliographyCache.getData()
  );
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    bibliographyCache.getError()
  );
  const hasInitialized = useRef(false);

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

      bibliographyCache.updateData(result.data);
    } catch (err) {
      const errorMessage = createErrorMessage(err);
      setError(errorMessage);
      bibliographyCache.setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, sortBy, sortOrder, query, filters]);

  // Initial load and when parameters change
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    if (!bibliographyCache.getData() || bibliographyCache.isStale()) {
      refetch();
    }
  }, [refetch]);

  // Refetch when parameters change
  useEffect(() => {
    if (hasInitialized.current) {
      refetch();
    }
  }, [refetch]);

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
