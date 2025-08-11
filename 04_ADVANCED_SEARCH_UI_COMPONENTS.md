# Migration Plan - Part 4: Advanced Search & UI Components

## **OVERVIEW**
This document covers implementing advanced search functionality, modern UI components, and the complete user interface for the bibliography application.

---

## **ADVANCED SEARCH COMPONENTS**

### **Step 1: Search Form Component**

#### **src/components/search/search-form.tsx**
```typescript
'use client'

import { useState, useCallback } from 'react'
import { Search, Filter, X, ChevronDown, ChevronUp } from 'lucide-react'
import { useDebounce } from '@/hooks/use-debounce'

interface SearchFormProps {
  onSearch: (query: string, filters: Record<string, any>) => void
}

export function SearchForm({ onSearch }: SearchFormProps) {
  const [query, setQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    year: '',
    publication: '',
    publisher: '',
    language_published: '',
    language_researched: '',
    country_of_research: '',
    keywords: '',
    biblio_name: '',
    date_of_entry: '',
    source: '',
    language_family: ''
  })

  const debouncedQuery = useDebounce(query, 300)

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onSearch(debouncedQuery, newFilters)
  }

  const handleQueryChange = (value: string) => {
    setQuery(value)
    onSearch(value, filters)
  }

  const clearFilters = () => {
    const clearedFilters = Object.keys(filters).reduce((acc, key) => {
      acc[key] = ''
      return acc
    }, {} as Record<string, any>)
    
    setFilters(clearedFilters)
    onSearch(query, clearedFilters)
  }

  const hasActiveFilters = Object.values(filters).some(value => value !== '')

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
            <h3 className="text-lg font-medium text-gray-900">Advanced Filters</h3>
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
              <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-2">
                Year
              </label>
              <input
                type="text"
                id="year"
                value={filters.year}
                onChange={(e) => handleFilterChange('year', e.target.value)}
                placeholder="e.g., 2020"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Publication */}
            <div>
              <label htmlFor="publication" className="block text-sm font-medium text-gray-700 mb-2">
                Publication
              </label>
              <input
                type="text"
                id="publication"
                value={filters.publication}
                onChange={(e) => handleFilterChange('publication', e.target.value)}
                placeholder="Journal or book title"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Publisher */}
            <div>
              <label htmlFor="publisher" className="block text-sm font-medium text-gray-700 mb-2">
                Publisher
              </label>
              <input
                type="text"
                id="publisher"
                value={filters.publisher}
                onChange={(e) => handleFilterChange('publisher', e.target.value)}
                placeholder="Publisher name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Language Published */}
            <div>
              <label htmlFor="language_published" className="block text-sm font-medium text-gray-700 mb-2">
                Language Published
              </label>
              <input
                type="text"
                id="language_published"
                value={filters.language_published}
                onChange={(e) => handleFilterChange('language_published', e.target.value)}
                placeholder="e.g., English, Spanish"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Language Researched */}
            <div>
              <label htmlFor="language_researched" className="block text-sm font-medium text-gray-700 mb-2">
                Language Researched
              </label>
              <input
                type="text"
                id="language_researched"
                value={filters.language_researched}
                onChange={(e) => handleFilterChange('language_researched', e.target.value)}
                placeholder="e.g., Mandarin, Arabic"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Country of Research */}
            <div>
              <label htmlFor="country_of_research" className="block text-sm font-medium text-gray-700 mb-2">
                Country of Research
              </label>
              <input
                type="text"
                id="country_of_research"
                value={filters.country_of_research}
                onChange={(e) => handleFilterChange('country_of_research', e.target.value)}
                placeholder="e.g., China, USA"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Keywords */}
            <div>
              <label htmlFor="keywords" className="block text-sm font-medium text-gray-700 mb-2">
                Keywords
              </label>
              <input
                type="text"
                id="keywords"
                value={filters.keywords}
                onChange={(e) => handleFilterChange('keywords', e.target.value)}
                placeholder="Research keywords"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Biblio Name */}
            <div>
              <label htmlFor="biblio_name" className="block text-sm font-medium text-gray-700 mb-2">
                Bibliography Name
              </label>
              <input
                type="text"
                id="biblio_name"
                value={filters.biblio_name}
                onChange={(e) => handleFilterChange('biblio_name', e.target.value)}
                placeholder="Bibliography identifier"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Source */}
            <div>
              <label htmlFor="source" className="block text-sm font-medium text-gray-700 mb-2">
                Source
              </label>
              <input
                type="text"
                id="source"
                value={filters.source}
                onChange={(e) => handleFilterChange('source', e.target.value)}
                placeholder="Data source"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
```

### **Step 2: Search Results Component**

#### **src/components/search/search-results.tsx**
```typescript
'use client'

import { useState } from 'react'
import { Search, Filter, BookOpen, Calendar, Globe, Tag } from 'lucide-react'
import { Bibliography } from '@/types/bibliography'

interface SearchResultsProps {
  results: Bibliography[]
  total: number
  isLoading: boolean
  onResultClick: (bibliography: Bibliography) => void
}

export function SearchResults({ results, total, isLoading, onResultClick }: SearchResultsProps) {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <Search className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No results found</h3>
        <p className="mt-1 text-sm text-gray-500">
          Try adjusting your search terms or filters.
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* Results Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-medium text-gray-900">
            Search Results ({total})
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md ${
                viewMode === 'list'
                  ? 'bg-indigo-100 text-indigo-600'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <BookOpen className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md ${
                viewMode === 'grid'
                  ? 'bg-indigo-100 text-indigo-600'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <div className="grid grid-cols-2 gap-0.5">
                <div className="w-1 h-1 bg-current"></div>
                <div className="w-1 h-1 bg-current"></div>
                <div className="w-1 h-1 bg-current"></div>
                <div className="w-1 h-1 bg-current"></div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Results Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((bibliography) => (
            <BibliographyCard
              key={bibliography._id}
              bibliography={bibliography}
              onClick={() => onResultClick(bibliography)}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {results.map((bibliography) => (
            <BibliographyListItem
              key={bibliography._id}
              bibliography={bibliography}
              onClick={() => onResultClick(bibliography)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function BibliographyCard({ bibliography, onClick }: { bibliography: Bibliography; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-lg p-6 cursor-pointer hover:shadow-md transition-shadow duration-200"
    >
      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
        {bibliography.title}
      </h3>
      <p className="text-sm text-gray-600 mb-3 line-clamp-1">
        {bibliography.author}
      </p>
      
      <div className="space-y-2 text-sm text-gray-500">
        {bibliography.year && (
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            {bibliography.year}
          </div>
        )}
        {bibliography.publication && (
          <div className="flex items-center">
            <BookOpen className="h-4 w-4 mr-2" />
            <span className="line-clamp-1">{bibliography.publication}</span>
          </div>
        )}
        {bibliography.language_published && (
          <div className="flex items-center">
            <Globe className="h-4 w-4 mr-2" />
            {bibliography.language_published}
          </div>
        )}
        {bibliography.keywords && (
          <div className="flex items-start">
            <Tag className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
            <span className="line-clamp-2">{bibliography.keywords}</span>
          </div>
        )}
      </div>
    </div>
  )
}

function BibliographyListItem({ bibliography, onClick }: { bibliography: Bibliography; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow duration-200"
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">
            {bibliography.title}
          </h3>
          <p className="text-sm text-gray-600 mb-2">
            {bibliography.author}
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500">
            {bibliography.year && (
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                {bibliography.year}
              </div>
            )}
            {bibliography.publication && (
              <div className="flex items-center">
                <BookOpen className="h-4 w-4 mr-2" />
                <span className="line-clamp-1">{bibliography.publication}</span>
              </div>
            )}
            {bibliography.language_published && (
              <div className="flex items-center">
                <Globe className="h-4 w-4 mr-2" />
                {bibliography.language_published}
              </div>
            )}
            {bibliography.country_of_research && (
              <div className="flex items-center">
                <Globe className="h-4 w-4 mr-2" />
                {bibliography.country_of_research}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
```

---

## **MODERN DATA TABLE COMPONENT**

### **Step 3: Bibliography Table Component**

#### **src/components/tables/bibliography-table.tsx**
```typescript
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  ChevronUp, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight,
  Edit,
  Trash2,
  Eye
} from 'lucide-react'
import { Bibliography } from '@/types/bibliography'

interface BibliographyTableProps {
  bibliographies: Bibliography[]
  isLoading: boolean
  currentPage: number
  totalPages: number
  totalCount: number
  onPageChange: (page: number) => void
}

export function BibliographyTable({
  bibliographies,
  isLoading,
  currentPage,
  totalPages,
  totalCount,
  onPageChange
}: BibliographyTableProps) {
  const [sortBy, setSortBy] = useState<string>('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [selectedRows, setSelectedRows] = useState<string[]>([])

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('asc')
    }
  }

  const handleSelectAll = () => {
    if (selectedRows.length === bibliographies.length) {
      setSelectedRows([])
    } else {
      setSelectedRows(bibliographies.map(b => b._id!))
    }
  }

  const handleSelectRow = (id: string) => {
    setSelectedRows(prev => 
      prev.includes(id) 
        ? prev.filter(rowId => rowId !== id)
        : [...prev, id]
    )
  }

  const getSortIcon = (column: string) => {
    if (sortBy !== column) {
      return <ChevronUp className="h-4 w-4 text-gray-400" />
    }
    return sortOrder === 'asc' 
      ? <ChevronUp className="h-4 w-4 text-indigo-600" />
      : <ChevronDown className="h-4 w-4 text-indigo-600" />
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="overflow-hidden">
      {/* Table Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            Bibliography Records ({totalCount})
          </h3>
          {selectedRows.length > 0 && (
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-500">
                {selectedRows.length} selected
              </span>
              <button className="text-sm text-red-600 hover:text-red-800">
                Delete Selected
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedRows.length === bibliographies.length}
                  onChange={handleSelectAll}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('author')}
              >
                <div className="flex items-center space-x-1">
                  <span>Author</span>
                  {getSortIcon('author')}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('year')}
              >
                <div className="flex items-center space-x-1">
                  <span>Year</span>
                  {getSortIcon('year')}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('title')}
              >
                <div className="flex items-center space-x-1">
                  <span>Title</span>
                  {getSortIcon('title')}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Language
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Country
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Keywords
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bibliographies.map((bibliography) => (
              <tr 
                key={bibliography._id}
                className="hover:bg-gray-50"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(bibliography._id!)}
                    onChange={() => handleSelectRow(bibliography._id!)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {bibliography.author}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {bibliography.year}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                  <div className="line-clamp-2">{bibliography.title}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {bibliography.language_published}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {bibliography.country_of_research}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                  <div className="line-clamp-2">{bibliography.keywords}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/bibliography/${bibliography._id}`}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    <Link
                      href={`/bibliography/${bibliography._id}/edit`}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <button className="text-red-600 hover:text-red-900">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  )
}

function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange 
}: { 
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void 
}) {
  const getPageNumbers = () => {
    const pages = []
    const maxVisible = 5
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        pages.push(1)
        pages.push('...')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      }
    }
    
    return pages
  }

  return (
    <div className="bg-white px-6 py-3 border-t border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 border border-gray-300 rounded-md text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          
          {getPageNumbers().map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === 'number' && onPageChange(page)}
              disabled={page === '...'}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                page === currentPage
                  ? 'bg-indigo-600 text-white'
                  : page === '...'
                  ? 'text-gray-400 cursor-default'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}
          
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 border border-gray-300 rounded-md text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        
        <div className="text-sm text-gray-700">
          Page {currentPage} of {totalPages}
        </div>
      </div>
    </div>
  )
}
```

---

## **UTILITY HOOKS**

### **Step 4: Debounce Hook**

#### **src/hooks/use-debounce.ts**
```typescript
import { useState, useEffect } from 'react'

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}
```

---

## **NEXT STEPS**

After completing advanced search and UI components:

1. **Test search functionality** with different queries and filters
2. **Verify table sorting** and pagination work correctly
3. **Check responsive design** on different screen sizes
4. **Test view mode switching** between grid and list

**Ready to proceed to Part 5: Dashboard & Data Visualization**

---

## **TROUBLESHOOTING**

### **Common Issues**

#### **Search Performance Issues**
- Implement proper debouncing for search input
- Add loading states for better UX
- Consider implementing search suggestions

#### **Table Rendering Issues**
- Check for proper key props in mapped elements
- Verify sorting logic is working correctly
- Ensure pagination calculations are accurate

#### **Responsive Design Issues**
- Test on different screen sizes
- Verify grid/list view switching works
- Check mobile navigation and interactions
