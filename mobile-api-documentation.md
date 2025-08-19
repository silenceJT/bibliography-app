# Mobile Bibliography Search API Documentation

## 🎯 **Enhanced Mobile Bibliography Endpoint**

**Endpoint:** `GET /api/mobile/bibliography`

**Description:** Comprehensive search and filtering for bibliography entries with mobile-optimized responses.

## 📋 **Query Parameters**

### **Pagination & Sorting**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number for pagination |
| `limit` | number | 20 | Number of items per page |
| `sortBy` | string | "createdAt" | Field to sort by |
| `sortOrder` | string | "desc" | Sort order: "asc" or "desc" |

### **Text Search**
| Parameter | Type | Description |
|-----------|------|-------------|
| `q` | string | Full-text search across multiple fields |

### **Advanced Filters**
| Parameter | Type | Description |
|-----------|------|-------------|
| `year` | string | Filter by publication year |
| `language_published` | string | Filter by language of publication |
| `language_researched` | string | Filter by researched language |
| `country_of_research` | string | Filter by country of research |
| `keywords` | string | Filter by keywords |
| `source` | string | Filter by source |
| `language_family` | string | Filter by language family |
| `publication` | string | Filter by publication name |
| `publisher` | string | Filter by publisher |
| `biblio_name` | string | Filter by bibliography name |

## 🔍 **Search Capabilities**

### **1. Full-Text Search (`q` parameter)**
Searches across multiple fields:
- Title
- Authors
- Keywords
- Abstract
- Bibliography name

**Example:**
```bash
GET /api/mobile/bibliography?q=linguistics
```

### **2. Specific Field Filtering**
Combine multiple filters for precise results:

**Example:**
```bash
GET /api/mobile/bibliography?year=2023&language_published=English&country_of_research=USA
```

### **3. Combined Search & Filters**
Use both text search and field filters together:

**Example:**
```bash
GET /api/mobile/bibliography?q=corpus&year=2023&language_family=Indo-European
```

## 📱 **Response Format**

### **Success Response Structure**
```json
{
  "success": true,
  "data": {
    "bibliographies": [
      {
        "_id": "bibliography_id",
        "title": "Research Paper Title",
        "authors": ["Author 1", "Author 2"],
        "year": "2023",
        "language_published": "English",
        "country_of_research": "USA",
        "keywords": ["linguistics", "corpus"],
        "createdAt": "2023-01-15T10:30:00.000Z",
        "updatedAt": "2023-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalCount": 100,
      "hasNextPage": true,
      "hasPreviousPage": false
    },
    "search": {
      "query": "corpus",
      "filters": {
        "year": "2023",
        "languagePublished": null,
        "languageResearched": null,
        "countryOfResearch": null,
        "keywords": null,
        "source": null,
        "languageFamily": null,
        "publication": null,
        "publisher": null,
        "biblioName": null
      },
      "sortBy": "createdAt",
      "sortOrder": "desc"
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### **Error Response Structure**
```json
{
  "success": false,
  "error": "Error message",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## 🚀 **Usage Examples**

### **1. Basic Search**
```bash
# Search for papers about "machine learning"
GET /api/mobile/bibliography?q=machine learning
```

### **2. Filtered Search**
```bash
# Find English papers from 2023 about linguistics
GET /api/mobile/bibliography?q=linguistics&year=2023&language_published=English
```

### **3. Pagination**
```bash
# Get first 10 results
GET /api/mobile/bibliography?page=1&limit=10
```

### **4. Advanced Filtering**
```bash
# Find papers about endangered languages in Asia
GET /api/mobile/bibliography?q=endangered languages&country_of_research=Asia&language_family=Indo-European
```

### **5. Sorting**
```bash
# Sort by title alphabetically
GET /api/mobile/bibliography?sortBy=title&sortOrder=asc
```

## 📱 **iOS Integration Examples**

### **Swift Search Implementation**
```swift
struct BibliographySearchParams {
    let query: String?
    let year: String?
    let languagePublished: String?
    let countryOfResearch: String?
    let page: Int
    let limit: Int
    let sortBy: String
    let sortOrder: String
}

class BibliographyService {
    func searchBibliographies(params: BibliographySearchParams) async throws -> BibliographyResponse {
        var components = URLComponents(string: "\(baseURL)/api/mobile/bibliography")!
        
        var queryItems: [URLQueryItem] = []
        
        if let query = params.query {
            queryItems.append(URLQueryItem(name: "q", value: query))
        }
        
        if let year = params.year {
            queryItems.append(URLQueryItem(name: "year", value: year))
        }
        
        if let languagePublished = params.languagePublished {
            queryItems.append(URLQueryItem(name: "language_published", value: languagePublished))
        }
        
        if let countryOfResearch = params.countryOfResearch {
            queryItems.append(URLQueryItem(name: "country_of_research", value: countryOfResearch))
        }
        
        queryItems.append(URLQueryItem(name: "page", value: "\(params.page)"))
        queryItems.append(URLQueryItem(name: "limit", value: "\(params.limit)"))
        queryItems.append(URLQueryItem(name: "sortBy", value: params.sortBy))
        queryItems.append(URLQueryItem(name: "sortOrder", value: params.sortOrder))
        
        components.queryItems = queryItems
        
        let request = URLRequest(url: components.url!)
        let (data, _) = try await URLSession.shared.data(for: request)
        
        return try JSONDecoder().decode(BibliographyResponse.self, from: data)
    }
}
```

### **Swift Response Models**
```swift
struct BibliographyResponse: Codable {
    let success: Bool
    let data: BibliographyData
    let timestamp: String
}

struct BibliographyData: Codable {
    let bibliographies: [Bibliography]
    let pagination: Pagination
    let search: SearchMetadata
}

struct SearchMetadata: Codable {
    let query: String?
    let filters: SearchFilters
    let sortBy: String
    let sortOrder: String
}

struct SearchFilters: Codable {
    let year: String?
    let languagePublished: String?
    let languageResearched: String?
    let countryOfResearch: String?
    let keywords: String?
    let source: String?
    let languageFamily: String?
    let publication: String?
    let publisher: String?
    let biblioName: String?
}
```

## 🔧 **Performance Features**

### **1. Efficient Querying**
- MongoDB indexes on commonly searched fields
- Regex search with case-insensitive options
- Pagination to limit result size

### **2. Response Optimization**
- Consistent date formatting for Swift compatibility
- Structured response with metadata
- Error handling with meaningful messages

### **3. Search Metadata**
- Returns applied filters for UI display
- Search query history support
- Sort preferences tracking

## 🎯 **Best Practices**

### **1. Search Strategy**
- Start with broad queries, then add filters
- Use pagination for large result sets
- Combine text search with field filters

### **2. Performance Tips**
- Limit results per page (recommended: 20-50)
- Use specific filters to reduce result set
- Cache frequently used search results

### **3. Error Handling**
- Always check `success` field
- Handle pagination edge cases
- Provide fallback for failed searches

## 📊 **Response Codes**

| Status | Description |
|--------|-------------|
| 200 | Success with results |
| 400 | Invalid parameters |
| 401 | Not authenticated |
| 500 | Internal server error |

## 🔄 **Future Enhancements**

- **Faceted Search**: Return available filter options
- **Search Suggestions**: Auto-complete for queries
- **Search Analytics**: Track popular searches
- **Advanced Operators**: Boolean search, wildcards
- **Search History**: User search preferences

---

**This enhanced endpoint provides a powerful, mobile-optimized search experience while maintaining simplicity and consistency! 🚀**
