"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { SearchResults } from "@/components/search/search-results";
import { useBibliographyData } from "@/hooks/use-simple-cache";
import { SmartLoading } from "@/components/ui/smart-loading";
import { BibliographyTableSkeleton } from "@/components/ui/bibliography-skeleton";
import { Download, Plus, Search, BookOpen } from "lucide-react";
import Link from "next/link";

export default function BibliographyPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const { 
    data, 
    total, 
    currentPage: hookPage, 
    totalPages, 
    isLoading, 
    error, 
    refetch, 
    goToPage 
  } = useBibliographyData(currentPage, itemsPerPage, sortBy, sortOrder);

  // Process data for display
  const processedData = {
    items: data || [],
    total: total,
    totalPages: totalPages,
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    setCurrentPage(1); // Reset to first page when sorting
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    goToPage(newPage);
  };

  const handleExport = () => {
    // Export functionality
    console.log("Exporting data...");
  };

  return (
    <DashboardLayout>
      <SmartLoading
        isLoading={isLoading}
        error={error}
        data={data}
        onRefetch={refetch}
        customSkeleton={<BibliographyTableSkeleton />}
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
        <SearchResults
          results={processedData.items}
          total={processedData.total}
          isLoading={isLoading}
          onResultClick={(bibliography) => {
            // Navigate to bibliography detail page
            window.location.href = `/bibliography/${bibliography._id}`;
          }}
        />

        {/* Pagination Controls */}
        {processedData.totalPages > 1 && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            {/* Items per page selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Show:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
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
                {Array.from({ length: Math.min(5, processedData.totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(processedData.totalPages - 4, currentPage - 2)) + i;
                  if (pageNum > processedData.totalPages) return null;
                  
                  return (
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
                  );
                })}
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
