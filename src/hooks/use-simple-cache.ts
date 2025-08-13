import { useState, useEffect, useCallback } from "react";

// BRUTAL: Simple cache with request deduplication
class SimpleCache<T> {
  private data: T | null = null;
  private loading = false;
  private error: string | null = null;
  private lastFetch: number = 0;
  private readonly ttl: number; // Time to live in milliseconds

  constructor(ttl: number = 5 * 60 * 1000) {
    // 5 minutes default
    this.ttl = ttl;
  }

  getData(): T | null {
    return this.data;
  }

  isLoading(): boolean {
    return this.loading;
  }

  getError(): string | null {
    return this.error;
  }

  isStale(): boolean {
    return Date.now() - this.lastFetch > this.ttl;
  }

  async fetch(fetchFn: () => Promise<T>): Promise<T> {
    // BRUTAL: Prevent duplicate requests
    if (this.loading) {
      throw new Error("Request already in progress");
    }

    // BRUTAL: Use cached data if fresh
    if (this.data && !this.isStale()) {
      return this.data;
    }

    try {
      this.loading = true;
      this.error = null;

      const newData = await fetchFn();
      this.data = newData;
      this.lastFetch = Date.now();

      return newData;
    } catch (err) {
      this.error = err instanceof Error ? err.message : "Unknown error";
      throw err;
    } finally {
      this.loading = false;
    }
  }

  invalidate(): void {
    this.data = null;
    this.lastFetch = 0;
  }
}

// BRUTAL: Global cache instances with proper types
const dashboardCache = new SimpleCache<{
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
}>();

const bibliographyCache = new SimpleCache<
  Array<{
    _id: string;
    title: string;
    author: string;
    year: string;
    publication: string;
    language_published: string;
    country_of_research?: string;
    created_at?: Date;
    updated_at?: Date | null;
  }>
>();

// BRUTAL: Simple hook for dashboard data - NO POLLING
export function useDashboardData() {
  const [data, setData] = useState(dashboardCache.getData());
  const [isLoading, setIsLoading] = useState(dashboardCache.isLoading());
  const [error, setError] = useState(dashboardCache.getError());

  const refetch = useCallback(async () => {
    try {
      const newData = await dashboardCache.fetch(async () => {
        const response = await fetch("/api/dashboard/summary");
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      });

      setData(newData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch");
    }
  }, []); // Empty dependency array for stable reference

  // BRUTAL: Only fetch once on mount if needed - NO DEPENDENCIES
  useEffect(() => {
    if (!dashboardCache.getData() || dashboardCache.isStale()) {
      refetch();
    }
  }, []); // Empty dependency array for single execution

  return { data, isLoading, error, refetch };
}

// BRUTAL: Simple hook for bibliography data - NO POLLING
export function useBibliographyData() {
  const [data, setData] = useState(bibliographyCache.getData());
  const [isLoading, setIsLoading] = useState(bibliographyCache.isLoading());
  const [error, setError] = useState(bibliographyCache.getError());

  const refetch = useCallback(async () => {
    try {
      const newData = await bibliographyCache.fetch(async () => {
        const response = await fetch("/api/bibliography");
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const result = await response.json();
        return result.data || []; // Handle paginated response
      });

      setData(newData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch");
    }
  }, []); // Empty dependency array for stable reference

  // BRUTAL: Only fetch once on mount if needed - NO DEPENDENCIES
  useEffect(() => {
    if (!bibliographyCache.getData() || bibliographyCache.isStale()) {
      refetch();
    }
  }, []); // Empty dependency array for single execution

  return { data, isLoading, error, refetch };
}
