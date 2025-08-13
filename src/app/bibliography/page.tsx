"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { SearchResults } from "@/components/search/search-results";
import { Pagination } from "@/components/ui/pagination";
import { Plus, Search, Download } from "lucide-react";
import Link from "next/link";
import { useBibliographyData } from "@/hooks/use-simple-cache";

export default function BibliographyPage() {
  const router = useRouter();
  const { data: bibliographies, isLoading, error, refetch } = useBibliographyData();
  
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [searchQuery, setSearchQuery] = useState("");

  // BRUTAL: Calculate everything from cached data
  const processedData = useMemo(() => {
    if (!bibliographies || !Array.isArray(bibliographies)) {
      return { data: [], total: 0, totalPages: 1 };
    }

    let filteredData = [...bibliographies];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filteredData = filteredData.filter(item => 
        item.title.toLowerCase().includes(query) ||
        item.author.toLowerCase().includes(query) ||
        item.publication.toLowerCase().includes(query) ||
        item.language_published.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    filteredData.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case "title":
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case "author":
          aValue = a.author.toLowerCase();
          bValue = b.author.toLowerCase();
          break;
        case "year":
          aValue = parseInt(a.year) || 0;
          bValue = parseInt(b.year) || 0;
          break;
        case "created_at":
        default:
          // Sort by ObjectId for creation time
          aValue = a._id;
          bValue = b._id;
          break;
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    const total = filteredData.length;
    const itemsPerPage = 20;
    const totalPages = Math.ceil(total / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    return {
      data: paginatedData,
      total,
      totalPages,
    };
  }, [bibliographies, searchQuery, sortBy, sortOrder, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSort = (field: string) => {
    const newOrder = field === sortBy && sortOrder === "desc" ? "asc" : "desc";
    setSortBy(field);
    setSortOrder(newOrder);
    setCurrentPage(1); // Reset to first page
  };

  const handleResultClick = (bibliography: { _id: string }) => {
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

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page
  };

  if (error) {
    return (
      <DashboardLayout>
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Data</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={refetch}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Bibliography Entries</h1>
            <p className="text-gray-600 mt-1">
              {processedData.total} entries • Page {currentPage} of {processedData.totalPages}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Download className="h-4 w-4 inline mr-2" />
              Export
            </button>
            <Link
              href="/bibliography/new"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="h-4 w-4 inline mr-2" />
              Add Entry
            </Link>
          </div>
        </div>

        {/* Search and Sort */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search entries..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            {["title", "author", "year", "created_at"].map((field) => (
              <button
                key={field}
                onClick={() => handleSort(field)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  sortBy === field
                    ? "bg-indigo-100 text-indigo-700"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {field === "created_at" ? "Date" : field.charAt(0).toUpperCase() + field.slice(1)}
                {sortBy === field && (
                  <span className="ml-1">{sortOrder === "asc" ? "↑" : "↓"}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="min-h-[400px] flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading bibliography entries...</p>
            </div>
          </div>
        ) : (
          <>
            <SearchResults
              results={processedData.data}
              onResultClick={handleResultClick}
              isLoading={false}
            />
            
            {processedData.totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={processedData.totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
