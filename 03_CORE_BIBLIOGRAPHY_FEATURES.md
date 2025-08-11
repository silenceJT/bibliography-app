# Migration Plan - Part 3: Core Bibliography Features

## **OVERVIEW**
This document covers implementing the core bibliography features including CRUD operations, search functionality, and data management.

---

## **BIBLIOGRAPHY SERVICE LAYER**

### **Step 1: Bibliography Service Implementation**

#### **src/lib/bibliography.ts**
```typescript
import clientPromise from './mongodb'
import { ObjectId } from 'mongodb'
import { Bibliography, BibliographyCreate, BibliographyUpdate } from '@/types/bibliography'

export class BibliographyService {
  private static async getCollection() {
    const client = await clientPromise
    const db = client.db('test')
    return db.collection('biblio_200419') // Keep existing collection name
  }

  static async createBibliography(data: BibliographyCreate): Promise<Bibliography> {
    const collection = await this.getCollection()
    
    const newBibliography: BibliographyCreate = {
      ...data,
      created_at: new Date(),
      updated_at: new Date(),
    }

    const result = await collection.insertOne(newBibliography)
    return { ...newBibliography, _id: result.insertedId.toString() }
  }

  static async getBibliographyById(id: string): Promise<Bibliography | null> {
    const collection = await this.getCollection()
    const bibliography = await collection.findOne({ _id: new ObjectId(id) })
    return bibliography ? { ...bibliography, _id: bibliography._id.toString() } : null
  }

  static async updateBibliography(id: string, updates: BibliographyUpdate): Promise<Bibliography | null> {
    const collection = await this.getCollection()
    
    const updateData = {
      ...updates,
      updated_at: new Date(),
    }

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: 'after' }
    )

    return result.value ? { ...result.value, _id: result.value._id.toString() } : null
  }

  static async deleteBibliography(id: string): Promise<boolean> {
    const collection = await this.getCollection()
    const result = await collection.deleteOne({ _id: new ObjectId(id) })
    return result.deletedCount > 0
  }

  static async getAllBibliographies(
    page: number = 1,
    limit: number = 20,
    sortBy: string = 'created_at',
    sortOrder: 'asc' | 'desc' = 'desc'
  ): Promise<{ data: Bibliography[]; total: number; page: number; totalPages: number }> {
    const collection = await this.getCollection()
    
    const skip = (page - 1) * limit
    const sortDirection = sortOrder === 'asc' ? 1 : -1
    
    const [data, total] = await Promise.all([
      collection
        .find({})
        .sort({ [sortBy]: sortDirection })
        .skip(skip)
        .limit(limit)
        .toArray(),
      collection.countDocuments({})
    ])

    const totalPages = Math.ceil(total / limit)
    
    return {
      data: data.map(item => ({ ...item, _id: item._id.toString() })),
      total,
      page,
      totalPages
    }
  }

  static async searchBibliographies(
    query: string,
    filters: Record<string, any> = {},
    page: number = 1,
    limit: number = 20
  ): Promise<{ data: Bibliography[]; total: number; page: number; totalPages: number }> {
    const collection = await this.getCollection()
    
    // Build search query
    const searchQuery: any = {}
    
    if (query) {
      searchQuery.$or = [
        { title: { $regex: query, $options: 'i' } },
        { author: { $regex: query, $options: 'i' } },
        { publication: { $regex: query, $options: 'i' } },
        { keywords: { $regex: query, $options: 'i' } }
      ]
    }

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== '') {
        if (key === 'year') {
          searchQuery[key] = { $regex: value, $options: 'i' }
        } else if (key === 'keywords') {
          searchQuery[key] = { $regex: value, $options: 'i' }
        } else {
          searchQuery[key] = { $regex: value, $options: 'i' }
        }
      }
    })

    const skip = (page - 1) * limit
    
    const [data, total] = await Promise.all([
      collection
        .find(searchQuery)
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      collection.countDocuments(searchQuery)
    ])

    const totalPages = Math.ceil(total / limit)
    
    return {
      data: data.map(item => ({ ...item, _id: item._id.toString() })),
      total,
      page,
      totalPages
    }
  }

  static async getNextBibliography(currentId: string): Promise<Bibliography | null> {
    const collection = await this.getCollection()
    const bibliography = await collection.findOne(
      { _id: { $gt: new ObjectId(currentId) } },
      { sort: { _id: 1 }, limit: 1 }
    )
    return bibliography ? { ...bibliography, _id: bibliography._id.toString() } : null
  }

  static async getPreviousBibliography(currentId: string): Promise<Bibliography | null> {
    const collection = await this.getCollection()
    const bibliography = await collection.findOne(
      { _id: { $lt: new ObjectId(currentId) } },
      { sort: { _id: -1 }, limit: 1 }
    )
    return bibliography ? { ...bibliography, _id: bibliography._id.toString() } : null
  }

  static async exportToCSV(filters: Record<string, any> = {}): Promise<string> {
    const collection = await this.getCollection()
    
    // Build search query similar to search
    const searchQuery: any = {}
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== '') {
        searchQuery[key] = { $regex: value, $options: 'i' }
      }
    })

    const data = await collection.find(searchQuery).toArray()
    
    // Convert to CSV
    const headers = [
      'Author', 'Year', 'Title', 'Publication', 'Publisher', 'Biblio Name',
      'Language Published', 'Language Researched', 'Country of Research',
      'Keywords', 'ISBN', 'ISSN', 'URL', 'Date of Entry', 'Source', 'Language Family'
    ]
    
    const csvRows = [
      headers.join(','),
      ...data.map(item => [
        `"${item.author || ''}"`,
        `"${item.year || ''}"`,
        `"${item.title || ''}"`,
        `"${item.publication || ''}"`,
        `"${item.publisher || ''}"`,
        `"${item.biblio_name || ''}"`,
        `"${item.language_published || ''}"`,
        `"${item.language_researched || ''}"`,
        `"${item.country_of_research || ''}"`,
        `"${item.keywords || ''}"`,
        `"${item.isbn || ''}"`,
        `"${item.issn || ''}"`,
        `"${item.url || ''}"`,
        `"${item.date_of_entry || ''}"`,
        `"${item.source || ''}"`,
        `"${item.language_family || ''}"`
      ].join(','))
    ]
    
    return csvRows.join('\n')
  }
}
```

---

## **BIBLIOGRAPHY API ENDPOINTS**

### **Step 2: Bibliography API Routes**

#### **src/app/api/bibliography/route.ts**
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { BibliographyService } from '@/lib/bibliography'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc'

    const result = await BibliographyService.getAllBibliographies(page, limit, sortBy, sortOrder)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching bibliographies:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Basic validation
    if (!body.title || !body.author) {
      return NextResponse.json(
        { error: 'Title and author are required' },
        { status: 400 }
      )
    }

    const bibliography = await BibliographyService.createBibliography(body)
    
    return NextResponse.json(bibliography, { status: 201 })
  } catch (error) {
    console.error('Error creating bibliography:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

#### **src/app/api/bibliography/[id]/route.ts**
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { BibliographyService } from '@/lib/bibliography'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const bibliography = await BibliographyService.getBibliographyById(params.id)
    
    if (!bibliography) {
      return NextResponse.json(
        { error: 'Bibliography not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(bibliography)
  } catch (error) {
    console.error('Error fetching bibliography:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const bibliography = await BibliographyService.updateBibliography(params.id, body)
    
    if (!bibliography) {
      return NextResponse.json(
        { error: 'Bibliography not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(bibliography)
  } catch (error) {
    console.error('Error updating bibliography:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const success = await BibliographyService.deleteBibliography(params.id)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Bibliography not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: 'Bibliography deleted successfully' })
  } catch (error) {
    console.error('Error deleting bibliography:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### **Step 3: Search API Endpoint**

#### **src/app/api/search/route.ts**
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { BibliographyService } from '@/lib/bibliography'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    
    // Extract filters from search params
    const filters: Record<string, any> = {}
    const filterKeys = [
      'year', 'publication', 'publisher', 'language_published',
      'language_researched', 'country_of_research', 'keywords',
      'biblio_name', 'date_of_entry', 'source', 'language_family'
    ]
    
    filterKeys.forEach(key => {
      const value = searchParams.get(key)
      if (value) {
        filters[key] = value
      }
    })

    const result = await BibliographyService.searchBibliographies(query, filters, page, limit)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error searching bibliographies:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

---

## **BIBLIOGRAPHY COMPONENTS**

### **Step 4: Bibliography Form Component**

#### **src/components/forms/bibliography-form.tsx**
```typescript
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Bibliography } from '@/types/bibliography'
import { Loader2, Save, X } from 'lucide-react'

interface BibliographyFormProps {
  bibliography?: Bibliography
  mode: 'create' | 'edit'
}

export function BibliographyForm({ bibliography, mode }: BibliographyFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    author: bibliography?.author || '',
    year: bibliography?.year || '',
    title: bibliography?.title || '',
    publication: bibliography?.publication || '',
    publisher: bibliography?.publisher || '',
    biblio_name: bibliography?.biblio_name || '',
    language_published: bibliography?.language_published || '',
    language_researched: bibliography?.language_researched || '',
    country_of_research: bibliography?.country_of_research || '',
    keywords: bibliography?.keywords || '',
    isbn: bibliography?.isbn || '',
    issn: bibliography?.issn || '',
    url: bibliography?.url || '',
    date_of_entry: bibliography?.date_of_entry || '',
    source: bibliography?.source || '',
    language_family: bibliography?.language_family || ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const url = mode === 'create' 
        ? '/api/bibliography' 
        : `/api/bibliography/${bibliography?._id}`
      
      const method = mode === 'create' ? 'POST' : 'PUT'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const result = await response.json()
        router.push(`/bibliography/${result._id}`)
      } else {
        const data = await response.json()
        setError(data.error || 'Operation failed')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {mode === 'create' ? 'Add New Bibliography' : 'Edit Bibliography'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Author */}
            <div>
              <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-2">
                Author *
              </label>
              <input
                type="text"
                id="author"
                name="author"
                required
                value={formData.author}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Year */}
            <div>
              <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-2">
                Year
              </label>
              <input
                type="text"
                id="year"
                name="year"
                value={formData.year}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Title */}
            <div className="md:col-span-2">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
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
                name="publication"
                value={formData.publication}
                onChange={handleChange}
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
                name="publisher"
                value={formData.publisher}
                onChange={handleChange}
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
                name="language_published"
                value={formData.language_published}
                onChange={handleChange}
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
                name="language_researched"
                value={formData.language_researched}
                onChange={handleChange}
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
                name="country_of_research"
                value={formData.country_of_research}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Keywords */}
            <div className="md:col-span-2">
              <label htmlFor="keywords" className="block text-sm font-medium text-gray-700 mb-2">
                Keywords
              </label>
              <textarea
                id="keywords"
                name="keywords"
                rows={3}
                value={formData.keywords}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* ISBN */}
            <div>
              <label htmlFor="isbn" className="block text-sm font-medium text-gray-700 mb-2">
                ISBN
              </label>
              <input
                type="text"
                id="isbn"
                name="isbn"
                value={formData.isbn}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* ISSN */}
            <div>
              <label htmlFor="issn" className="block text-sm font-medium text-gray-700 mb-2">
                ISSN
              </label>
              <input
                type="text"
                id="issn"
                name="issn"
                value={formData.issn}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* URL */}
            <div className="md:col-span-2">
              <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
                URL
              </label>
              <input
                type="url"
                id="url"
                name="url"
                value={formData.url}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <X className="h-4 w-4 mr-2 inline" />
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 inline animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2 inline" />
              )}
              {mode === 'create' ? 'Create' : 'Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
```

---

## **BIBLIOGRAPHY PAGES**

### **Step 5: Bibliography List Page**

#### **src/app/bibliography/page.tsx**
```typescript
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Search, Filter, Download } from 'lucide-react'
import { Bibliography } from '@/types/bibliography'
import { BibliographyTable } from '@/components/tables/bibliography-table'
import { SearchForm } from '@/components/search/search-form'

export default function BibliographyPage() {
  const [bibliographies, setBibliographies] = useState<Bibliography[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<Record<string, any>>({})

  useEffect(() => {
    fetchBibliographies()
  }, [currentPage, searchQuery, filters])

  const fetchBibliographies = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20'
      })

      if (searchQuery) {
        params.append('q', searchQuery)
      }

      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params.append(key, value)
        }
      })

      const response = await fetch(`/api/search?${params}`)
      if (response.ok) {
        const data = await response.json()
        setBibliographies(data.data)
        setTotalPages(data.totalPages)
        setTotalCount(data.total)
      }
    } catch (error) {
      console.error('Error fetching bibliographies:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (query: string, newFilters: Record<string, any>) => {
    setSearchQuery(query)
    setFilters(newFilters)
    setCurrentPage(1)
  }

  const handleExport = async () => {
    try {
      const params = new URLSearchParams()
      if (searchQuery) {
        params.append('q', searchQuery)
      }
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params.append(key, value)
        }
      })

      const response = await fetch(`/api/export?${params}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'bibliography.csv'
        a.click()
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Error exporting data:', error)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Bibliography</h1>
          <div className="flex space-x-3">
            <button
              onClick={handleExport}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
            <Link
              href="/bibliography/new"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New
            </Link>
          </div>
        </div>

        <SearchForm onSearch={handleSearch} />
      </div>

      <div className="bg-white shadow rounded-lg">
        <BibliographyTable
          bibliographies={bibliographies}
          isLoading={isLoading}
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={totalCount}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  )
}
```

---

## **NEXT STEPS**

After completing core bibliography features:

1. **Test CRUD operations** work correctly
2. **Verify search functionality** with filters
3. **Check pagination** and sorting
4. **Test export functionality**

**Ready to proceed to Part 4: Advanced Search & UI Components**

---

## **TROUBLESHOOTING**

### **Common Issues**

#### **MongoDB Connection Errors**
- Verify MongoDB service is running
- Check connection string in environment variables
- Ensure proper authentication

#### **API Route Errors**
- Check NextAuth session validation
- Verify request/response handling
- Check TypeScript types

#### **Form Submission Issues**
- Validate required fields
- Check API endpoint URLs
- Verify error handling
