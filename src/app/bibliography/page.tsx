"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { SearchResults } from "@/components/search/search-results";
import { Pagination } from "@/components/ui/pagination";
import { Bibliography } from "@/types/bibliography";
import { Plus, Search, Download } from "lucide-react";
import Link from "next/link";

export default function BibliographyPage() {
  const router = useRouter();

  const [bibliographies, setBibliographies] = useState<Bibliography[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const fetchBibliographies = async (
    page: number = 1,
    sort: string = sortBy,
    order: "asc" | "desc" = sortOrder
  ) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        sortBy: sort,
        sortOrder: order,
      });

      const response = await fetch(`/api/bibliography?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch bibliographies");

      const data = await response.json();
      setBibliographies(data.data);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      setCurrentPage(data.page);
    } catch (error) {
      console.error("Error fetching bibliographies:", error);
      setBibliographies([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    fetchBibliographies(page, sortBy, sortOrder);
  };

  const handleSort = (field: string) => {
    const newOrder = field === sortBy && sortOrder === "desc" ? "asc" : "desc";
    setSortBy(field);
    setSortOrder(newOrder);
    fetchBibliographies(1, field, newOrder);
  };

  const handleResultClick = (bibliography: Bibliography) => {
    router.push(`/bibliography/${bibliography._id}`);
  };

  const handleExport = async () => {
    try {
      const response = await fetch("/api/bibliography/export");
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

  useEffect(() => {
    fetchBibliographies();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Bibliography Entries
            </h1>
            <p className="text-sm text-gray-500">
              Manage and view all bibliography entries
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleExport}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Download className="h-4 w-4 mr-2" />
              Export All
            </button>

            <Link
              href="/bibliography/search"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Search className="h-4 w-4 mr-2" />
              Search
            </Link>

            <Link
              href="/bibliography/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Entry
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto">
          <div className="px-4 sm:px-0">
            {/* Sort Controls */}
            <div className="bg-white shadow rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Sort by</h3>
                <div className="flex items-center space-x-2">
                  {[
                    { key: "title", label: "Title" },
                    { key: "author", label: "Author" },
                    { key: "year", label: "Year" },
                    { key: "publication", label: "Publication" },
                    { key: "created_at", label: "Date Added" },
                  ].map((field) => (
                    <button
                      key={field.key}
                      onClick={() => handleSort(field.key)}
                      className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        sortBy === field.key
                          ? "bg-indigo-100 text-indigo-700"
                          : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {field.label}
                      {sortBy === field.key && (
                        <span className="ml-1">
                          {sortOrder === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="bg-white shadow rounded-lg">
              <SearchResults
                results={bibliographies}
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
