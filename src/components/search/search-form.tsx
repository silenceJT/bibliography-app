"use client";

import { useState, useEffect } from "react";
import { Search, Filter, X, ChevronDown, ChevronUp } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

interface SearchFormProps {
  onSearch: (query: string, filters: Record<string, string>) => void;
}

// FILTER CONFIGURATION - Simple and clean
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

export function SearchForm({ onSearch }: SearchFormProps) {
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Record<string, string>>({});

  const debouncedQuery = useDebounce(query, 300);
  const debouncedFilters = useDebounce(filters, 300);

  // Track if search or filters are being debounced
  const isSearching = query !== debouncedQuery;
  const isFiltering = JSON.stringify(filters) !== JSON.stringify(debouncedFilters);

  // SIMPLE SEARCH TRIGGER - Debounced for both query and filters
  useEffect(() => {
    onSearch(debouncedQuery, debouncedFilters);
  }, [debouncedQuery, debouncedFilters, onSearch]);

  // SIMPLE HANDLERS
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const hasActiveFilters = Object.values(filters).some(value => value.trim());

  return (
    <div className="bg-white shadow rounded-lg p-6">
      {/* Main Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by author, title, publication, or keywords..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg"
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
    </div>
  );
}
