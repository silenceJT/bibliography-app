"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { SearchForm } from "@/components/search/search-form";
import { SearchResults } from "@/components/search/search-results";
import { Pagination } from "@/components/ui/pagination";
import { Bibliography, BibliographyFilters } from "@/types/bibliography";
import { Download } from "lucide-react";

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [results, setResults] = useState<Bibliography[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const performSearch = async (
    query: string,
    filters: BibliographyFilters,
    page: number = 1
  ) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        q: query,
        page: page.toString(),
        ...filters,
      });

      const response = await fetch(
        `/api/bibliography/search?${params.toString()}`
      );
      if (!response.ok) throw new Error("Search failed");

      const data = await response.json();
      setResults(data.data);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      setCurrentPage(data.page);

      // Update URL with search params
      const newUrl = `/bibliography/search?${params.toString()}`;
      router.push(newUrl);
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    const query = searchParams.get("q") || "";
    const filters: BibliographyFilters = {
      year: searchParams.get("year") || "",
      publication: searchParams.get("publication") || "",
      publisher: searchParams.get("publisher") || "",
      language_published: searchParams.get("language_published") || "",
      language_researched: searchParams.get("language_researched") || "",
      country_of_research: searchParams.get("country_of_research") || "",
      keywords: searchParams.get("keywords") || "",
      biblio_name: searchParams.get("biblio_name") || "",
      source: searchParams.get("source") || "",
      language_family: searchParams.get("language_family") || "",
    };
    performSearch(query, filters, page);
  };

  const handleResultClick = (bibliography: Bibliography) => {
    router.push(`/bibliography/${bibliography._id}`);
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams(searchParams);
      const response = await fetch(
        `/api/bibliography/export?${params.toString()}`
      );
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
  };

  // Initialize search from URL params on mount
  useEffect(() => {
    const query = searchParams.get("q") || "";
    const page = parseInt(searchParams.get("page") || "1");

    const filters: BibliographyFilters = {
      year: searchParams.get("year") || "",
      publication: searchParams.get("publication") || "",
      publisher: searchParams.get("publisher") || "",
      language_published: searchParams.get("language_published") || "",
      language_researched: searchParams.get("language_researched") || "",
      country_of_research: searchParams.get("country_of_research") || "",
      keywords: searchParams.get("keywords") || "",
      biblio_name: searchParams.get("biblio_name") || "",
      source: searchParams.get("source") || "",
      language_family: searchParams.get("language_family") || "",
    };

    if (query || Object.values(filters).some((v) => v)) {
      performSearch(query, filters, page);
    }
  }, [searchParams]);

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

          {total > 0 && (
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
              <SearchForm onSearch={performSearch} />
            </div>

            {/* Search Results */}
            <div className="bg-white shadow rounded-lg">
              <SearchResults
                results={results}
                total={total}
                isLoading={isLoading}
                onResultClick={handleResultClick}
              />

              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
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
