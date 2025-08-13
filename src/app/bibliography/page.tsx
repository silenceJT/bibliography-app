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
  const { data, isLoading, error, refetch } = useBibliographyData();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Process data for display
  const processedData = {
    items: data || [],
    total: (data || []).length,
    totalPages: Math.ceil((data || []).length / 10),
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page
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
        skeletonType="custom"
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
          isLoading={isLoading}
          onResultClick={(bibliography) => {
            // Navigate to bibliography detail page
            window.location.href = `/bibliography/${bibliography._id}`;
          }}
        />
      </SmartLoading>

      {/* BRUTAL: Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
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
