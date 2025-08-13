"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { SmartLoading } from "@/components/ui/smart-loading";
import { useBibliographyData } from "@/hooks/use-simple-cache";
import { Bibliography } from "@/types/bibliography";
import { useDebounce } from "@/hooks/use-debounce";
import { Filter, X, ChevronDown, ChevronUp, BookOpen, Search, Calendar, Plus } from "lucide-react";
import Link from "next/link";

export default function BibliographyPage() {
  // Search and filter state
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Record<string, string>>({});
  
  // Pagination and sorting state
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Debounced search and filters
  const debouncedQuery = useDebounce(query, 300);
  const debouncedFilters = useDebounce(filters, 300);

  // Track if search or filters are being debounced
  const isSearching = query !== debouncedQuery;
  const isFiltering = JSON.stringify(filters) !== JSON.stringify(debouncedFilters);

  // Fetch data with search, filters, pagination, and sorting
  const { 
    data, 
    total, 
    totalPages, 
    isLoading, 
    error, 
    refetch, 
    goToPage 
  } = useBibliographyData(currentPage, itemsPerPage, sortBy, sortOrder, debouncedQuery, debouncedFilters);

  // Process data for display
  const processedData = {
    items: data || [],
    total: total || 0,
    totalPages: totalPages || 1,
  };

  // Filter handlers
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setFilters({});
    setQuery("");
    setCurrentPage(1);
  };

  const hasActiveFilters = query.trim() || Object.values(filters).some(value => value.trim());

  // Sorting handler
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  // Pagination handler
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    goToPage(newPage);
  };

  // Items per page handler
  const handleItemsPerPageChange = (newLimit: number) => {
    setItemsPerPage(newLimit);
    setCurrentPage(1);
  };

  // Helper function to generate page numbers for pagination
  const generatePageNumbers = (currentPage: number, totalPages: number) => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, 5);
      } else if (currentPage >= totalPages - 2) {
        pages.push(totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2);
      }
    }
    return pages;
  };

  // Filter configuration
  const FILTER_FIELDS = [
    { key: "year", label: "Year", placeholder: "e.g., 2024 or 2020-2024" },
    { key: "publication", label: "Publication", placeholder: "Journal or book title" },
    { key: "publisher", label: "Publisher", placeholder: "Publisher name" },
    { key: "language_published", label: "Language Published", placeholder: "e.g., English, Spanish" },
    { key: "language_researched", label: "Language Researched", placeholder: "e.g., Mandarin, Arabic" },
    { key: "country_of_research", label: "Country of Research", placeholder: "e.g., China, USA" },
    { key: "keywords", label: "Keywords", placeholder: "Research keywords" },
    { key: "biblio_name", label: "Bibliography Name", placeholder: "Bibliography identifier" },
    { key: "source", label: "Source", placeholder: "Data source" },
  ];

  return (
    <DashboardLayout>
      <SmartLoading
        isLoading={isLoading}
        error={error}
        data={data}
        onRefetch={refetch}
        emptyMessage="No bibliography entries found. Start building your research database!"
        emptyIcon={<BookOpen className="h-8 w-8 text-gray-400" />}
        className="space-y-6"
      >
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
              onClick={() => {
                console.log("Exporting data...");
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
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
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                {isSearching && (
                  <div className="flex items-center space-x-2 mr-2 text-sm text-gray-500">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span>Searching...</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                  {showFilters ? (
                    <ChevronUp className="h-4 w-4 ml-2" />
                  ) : (
                    <ChevronDown className="h-4 w-4 ml-2" />
                  )}
                </button>
              </div>
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

        {/* Advanced Filters */}
        {showFilters && (
          <div className="border-t border-gray-200 pt-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-medium text-gray-900">
                  Advanced Filters
                </h3>
                {isFiltering && (
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span>Updating...</span>
                  </div>
                )}
              </div>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear All
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {FILTER_FIELDS.map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label
                    htmlFor={key}
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    {label}
                  </label>
                  <input
                    type="text"
                    id={key}
                    value={filters[key] || ""}
                    onChange={(e) => handleFilterChange(key, e.target.value)}
                    placeholder={placeholder}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : processedData.items.length === 0 ? (
          <div className="text-center py-12">
            <Search className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {hasActiveFilters ? "No results found" : "Start your search"}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {hasActiveFilters 
                ? "Try adjusting your search terms or filters." 
                : "Enter keywords above to find bibliography entries"
              }
            </p>
          </div>
        ) : (
          <div>
            {/* Results Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-medium text-gray-900">Search Results</h2>
                <p className="text-sm text-gray-500">
                  {processedData.total} result{processedData.total !== 1 ? "s" : ""} found
                </p>
              </div>
            </div>

            {/* Results List */}
            <div className="space-y-4">
              {processedData.items.map((item: Bibliography) => (
                <div
                  key={item._id}
                  onClick={() => {
                    window.location.href = `/bibliography/${item._id}`;
                  }}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 cursor-pointer transition-all duration-200 hover:shadow-md hover:border-indigo-300 flex items-start space-x-4"
                >
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-indigo-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium text-gray-900 truncate">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">by {item.author}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      {item.year && (
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {item.year}
                        </div>
                      )}
                      {item.publication && (
                        <div className="flex items-center">
                          <BookOpen className="w-4 h-4 mr-1" />
                          {item.publication}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pagination Controls */}
        {processedData.totalPages > 1 && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            {/* Items per page selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Show:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                className="px-2 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-sm text-gray-600">entries</span>
            </div>

            {/* Page navigation */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              
              <div className="flex items-center gap-1">
                {generatePageNumbers(currentPage, processedData.totalPages).map((pageNum) => (
                  pageNum && (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-1 text-sm rounded-md ${
                        pageNum === currentPage
                          ? "bg-indigo-600 text-white"
                          : "border border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                ))}
              </div>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === processedData.totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>

            {/* Page info */}
            <div className="text-sm text-gray-600">
              Page {currentPage} of {processedData.totalPages}
            </div>
          </div>
        )}
      </SmartLoading>

      {/* BRUTAL: Floating Action Button - moved higher to avoid covering pagination */}
      <div className="fixed bottom-20 right-6 z-50">
        <Link
          href="/bibliography/new"
          className="flex items-center justify-center w-16 h-16 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 hover:shadow-xl transition-all duration-200 transform hover:scale-110"
          title="Add New Entry"
        >
          <Plus className="h-8 w-8" />
        </Link>
      </div>
    </DashboardLayout>
  );
}
