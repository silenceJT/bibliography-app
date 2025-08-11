"use client";

import { useState, useCallback } from "react";
import { Search, Filter, X, ChevronDown, ChevronUp } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

interface SearchFormProps {
  onSearch: (query: string, filters: Record<string, string>) => void;
}

export function SearchForm({ onSearch }: SearchFormProps) {
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    year: "",
    publication: "",
    publisher: "",
    language_published: "",
    language_researched: "",
    country_of_research: "",
    keywords: "",
    biblio_name: "",
    date_of_entry: "",
    source: "",
    language_family: "",
  });

  const debouncedQuery = useDebounce(query, 300);

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onSearch(debouncedQuery, newFilters);
  };

  const handleQueryChange = (value: string) => {
    setQuery(value);
    onSearch(value, filters);
  };

  const clearFilters = () => {
    const clearedFilters = Object.keys(filters).reduce(
      (acc, key) => {
        acc[key] = "";
        return acc;
      },
      {} as Record<string, string>
    );

    setFilters(clearedFilters);
    onSearch(query, clearedFilters);
  };

  const hasActiveFilters = Object.values(filters).some((value) => value !== "");

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
            onChange={(e) => handleQueryChange(e.target.value)}
            className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
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
            <h3 className="text-lg font-medium text-gray-900">
              Advanced Filters
            </h3>
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
            {/* Year */}
            <div>
              <label
                htmlFor="year"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Year
              </label>
              <input
                type="text"
                id="year"
                value={filters.year}
                onChange={(e) => handleFilterChange("year", e.target.value)}
                placeholder="e.g., 2020"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Publication */}
            <div>
              <label
                htmlFor="publication"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Publication
              </label>
              <input
                type="text"
                id="publication"
                value={filters.publication}
                onChange={(e) =>
                  handleFilterChange("publication", e.target.value)
                }
                placeholder="Journal or book title"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Publisher */}
            <div>
              <label
                htmlFor="publisher"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Publisher
              </label>
              <input
                type="text"
                id="publisher"
                value={filters.publisher}
                onChange={(e) =>
                  handleFilterChange("publisher", e.target.value)
                }
                placeholder="Publisher name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Language Published */}
            <div>
              <label
                htmlFor="language_published"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Language Published
              </label>
              <input
                type="text"
                id="language_published"
                value={filters.language_published}
                onChange={(e) =>
                  handleFilterChange("language_published", e.target.value)
                }
                placeholder="e.g., English, Spanish"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Language Researched */}
            <div>
              <label
                htmlFor="language_researched"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Language Researched
              </label>
              <input
                type="text"
                id="language_researched"
                value={filters.language_researched}
                onChange={(e) =>
                  handleFilterChange("language_researched", e.target.value)
                }
                placeholder="e.g., Mandarin, Arabic"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Country of Research */}
            <div>
              <label
                htmlFor="country_of_research"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Country of Research
              </label>
              <input
                type="text"
                id="country_of_research"
                value={filters.country_of_research}
                onChange={(e) =>
                  handleFilterChange("country_of_research", e.target.value)
                }
                placeholder="e.g., China, USA"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Keywords */}
            <div>
              <label
                htmlFor="keywords"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Keywords
              </label>
              <input
                type="text"
                id="keywords"
                value={filters.keywords}
                onChange={(e) => handleFilterChange("keywords", e.target.value)}
                placeholder="Research keywords"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Biblio Name */}
            <div>
              <label
                htmlFor="biblio_name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Bibliography Name
              </label>
              <input
                type="text"
                id="biblio_name"
                value={filters.biblio_name}
                onChange={(e) =>
                  handleFilterChange("biblio_name", e.target.value)
                }
                placeholder="Bibliography identifier"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Source */}
            <div>
              <label
                htmlFor="source"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Source
              </label>
              <input
                type="text"
                id="source"
                value={filters.source}
                onChange={(e) => handleFilterChange("source", e.target.value)}
                placeholder="Data source"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
