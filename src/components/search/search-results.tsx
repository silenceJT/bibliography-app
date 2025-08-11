"use client";

import { useState } from "react";
import { Search, Filter, BookOpen, Calendar, Globe, Tag } from "lucide-react";
import { Bibliography } from "@/types/bibliography";

interface SearchResultsProps {
  results: Bibliography[];
  total: number;
  isLoading: boolean;
  onResultClick: (bibliography: Bibliography) => void;
}

export function SearchResults({
  results,
  total,
  isLoading,
  onResultClick,
}: SearchResultsProps) {
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <Search className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          No results found
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Try adjusting your search terms or filters.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Results Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Search Results</h2>
          <p className="text-sm text-gray-500">
            {total} result{total !== 1 ? "s" : ""} found
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-md ${
              viewMode === "list"
                ? "bg-indigo-100 text-indigo-700"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 10h16M4 14h16M4 18h16"
              />
            </svg>
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-md ${
              viewMode === "grid"
                ? "bg-indigo-100 text-indigo-700"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Results Grid/List */}
      <div
        className={
          viewMode === "grid"
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            : "space-y-4"
        }
      >
        {results.map((item) => (
          <div
            key={item._id}
            onClick={() => onResultClick(item)}
            className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 cursor-pointer transition-all duration-200 hover:shadow-md hover:border-indigo-300 ${
              viewMode === "list" ? "flex items-start space-x-4" : ""
            }`}
          >
            {viewMode === "list" ? (
              <>
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
              </>
            ) : (
              <>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-indigo-600" />
                  </div>
                  {item.year && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      {item.year}
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-medium text-gray-900 mb-2 line-clamp-2">
                  {item.title}
                </h3>

                <p className="text-sm text-gray-600 mb-3">by {item.author}</p>

                <div className="space-y-2 text-sm text-gray-500">
                  {item.publication && (
                    <div className="flex items-center">
                      <BookOpen className="w-4 h-4 mr-2" />
                      <span className="truncate">{item.publication}</span>
                    </div>
                  )}

                  {item.language_published && (
                    <div className="flex items-center">
                      <Globe className="w-4 h-4 mr-2" />
                      <span>{item.language_published}</span>
                    </div>
                  )}

                  {item.keywords && (
                    <div className="flex items-center">
                      <Tag className="w-4 h-4 mr-2" />
                      <span className="truncate">{item.keywords}</span>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
