"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { SearchForm } from "@/components/search/search-form";
import { SearchResults } from "@/components/search/search-results";
import { Pagination } from "@/components/ui/pagination";
import { Bibliography } from "@/types/bibliography";
import { Download } from "lucide-react";

type BibliographyFilters = Record<string, string>;

export default function SearchPage() {
  const router = useRouter();
  
  // SIMPLIFIED STATE - Single source of truth
  const [searchData, setSearchData] = useState({
    query: "",
    filters: {} as BibliographyFilters,
    page: 1,
    results: [] as Bibliography[],
    total: 0,
    totalPages: 1,
    isLoading: false,
    hasSearched: false,
  });

  // SINGLE SEARCH FUNCTION - Clean and efficient
  const performSearch = useCallback(async (
    query: string,
    filters: BibliographyFilters,
    page: number = 1
  ) => {
    // Don't search if empty and no filters
    const hasActiveFilters = Object.values(filters).some(v => v.trim());
    if (!query.trim() && !hasActiveFilters) {
      setSearchData(prev => ({
        ...prev,
        query: "",
        filters: {},
        page: 1,
        results: [],
        total: 0,
        totalPages: 1,
        hasSearched: false,
      }));
      return;
    }

    setSearchData(prev => ({ ...prev, isLoading: true }));

    try {
      const params = new URLSearchParams({
        q: query,
        page: page.toString(),
        ...filters,
      });

      const response = await fetch(`/api/bibliography/search?${params}`);
      if (!response.ok) throw new Error("Search failed");

      const data = await response.json();
      
      setSearchData(prev => ({
        ...prev,
        query,
        filters,
        page,
        results: data.data,
        total: data.total,
        totalPages: data.totalPages,
        hasSearched: true,
        isLoading: false,
      }));
    } catch (error) {
      console.error("Search error:", error);
      setSearchData(prev => ({
        ...prev,
        results: [],
        total: 0,
        totalPages: 1,
        isLoading: false,
      }));
    }
  }, []);

  // SIMPLE HANDLERS
  const handleSearch = useCallback((query: string, filters: BibliographyFilters) => {
    performSearch(query, filters, 1);
  }, [performSearch]);

  const handlePageChange = useCallback((page: number) => {
    performSearch(searchData.query, searchData.filters, page);
  }, [performSearch, searchData.query, searchData.filters]);

  const handleResultClick = useCallback((bibliography: Bibliography) => {
    router.push(`/bibliography/${bibliography._id}`);
  }, [router]);

  const handleExport = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        q: searchData.query,
        page: searchData.page.toString(),
        ...searchData.filters,
      });
      
      const response = await fetch(`/api/bibliography/export?${params}`);
      if (!response.ok) throw new Error("Export failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "bibliography_export.csv";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Export error:", error);
      alert("Export failed. Please try again.");
    }
  }, [searchData]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Search Bibliography
            </h1>
            <p className="text-sm text-gray-500">
              Find and filter bibliography entries
            </p>
          </div>

          {searchData.total > 0 && (
            <button
              onClick={handleExport}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Results
            </button>
          )}
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto">
          <div className="px-4 sm:px-0">
            {/* Search Form */}
            <div className="mb-8">
              <SearchForm onSearch={handleSearch} />
            </div>

            {/* Search Results */}
            <div className="bg-white shadow rounded-lg">
              <SearchResults
                results={searchData.results}
                total={searchData.total}
                isLoading={searchData.isLoading}
                onResultClick={handleResultClick}
                hasSearched={searchData.hasSearched}
              />

              {/* Pagination */}
              {searchData.totalPages > 1 && (
                <Pagination
                  currentPage={searchData.page}
                  totalPages={searchData.totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
