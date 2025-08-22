# 📱 **Mobile CRUD API Reference - Complete Guide**

## 🎯 **API Overview**

**Base URL:** `https://your-domain.com/api/mobile`  
**Authentication:** Bearer Token  
**Content-Type:** `application/json`  
**Date Format:** ISO 8601 (Swift compatible)

---

## 🔐 **Authentication**

### **Login to Get Token**
```http
POST /api/mobile/auth/login
Content-Type: application/json

Request Body:
{
  "email": "user@example.com",
  "password": "userpassword"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "_id": "689adb464e60b85ef28ec206",
    "email": "user@example.com",
    "name": "User Name",
    "role": "super_admin"
  },
  "token": "689adb464e60b85ef28ec206",
  "message": "Login successful"
}
```

### **Use Token in All Requests**
```http
Authorization: Bearer 689adb464e60b85ef28ec206
```

---

## 📚 **Bibliography CRUD Operations**

### **1. CREATE - Add New Bibliography**

#### **Endpoint**
```http
POST /api/mobile/bibliography
Authorization: Bearer {token}
Content-Type: application/json
```

#### **Request Payload**
```json
{
  "title": "Research Paper Title",
  "author": "Author Name",
  "year": "2024",
  "publication": "Journal Name",
  "publisher": "Publisher Name",
  "language_published": "English",
  "language_researched": "Spanish",
  "country_of_research": "Spain",
  "keywords": "keyword1, keyword2, keyword3",
  "source": "Source Name",
  "language_family": "Indo-European",
  "biblio_name": "Bibliography Name"
}
```

#### **Required Fields**
- `title` (string)
- `author` (string)

#### **Optional Fields**
- `year` (string - will be converted to integer)
- `publication` (string)
- `publisher` (string)
- `language_published` (string)
- `language_researched` (string)
- `country_of_research` (string)
- `keywords` (string)
- `source` (string)
- `language_family` (string)
- `biblio_name` (string)

#### **Response (201 Created)**
```json
{
  "success": true,
  "data": {
    "_id": "68a41b4572088ccf762fdcca",
    "title": "Research Paper Title",
    "author": "Author Name",
    "year": 2024,
    "publication": "Journal Name",
    "publisher": "Publisher Name",
    "language_published": "English",
    "language_researched": "Spanish",
    "country_of_research": "Spain",
    "keywords": "keyword1, keyword2, keyword3",
    "source": "Source Name",
    "language_family": "Indo-European",
    "biblio_name": "Bibliography Name",
    "created_at": "2025-08-19T06:35:49.603Z",
    "updated_at": "2025-08-19T06:35:49.603Z",
    "created_by": "689adb464e60b85ef28ec206",
    "createdAt": "2025-08-19T06:35:49.603Z",
    "updatedAt": "2025-08-19T06:35:49.603Z",
    "publicationDate": null
  },
  "timestamp": "2025-08-19T06:35:50.186Z"
}
```

#### **Error Responses**
```json
// Missing required fields
{
  "success": false,
  "error": "Title and author are required",
  "timestamp": "2025-08-19T06:35:50.186Z"
}

// Invalid year format
{
  "success": false,
  "error": "Year must be a valid number",
  "timestamp": "2025-08-19T06:35:50.186Z"
}

// Authentication failed
{
  "success": false,
  "error": "Not authenticated",
  "timestamp": "2025-08-19T06:35:50.186Z"
}
```

---

### **2. READ - Get Bibliography List**

#### **Endpoint**
```http
GET /api/mobile/bibliography?page=1&limit=20
Authorization: Bearer {token}
```

#### **Query Parameters**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number for pagination |
| `limit` | number | 20 | Items per page (max 100) |
| `q` | string | null | Search query across title, author, keywords, publication, biblio_name |
| `year` | number | null | Exact year match |
| `yearFrom` | number | null | Year range start |
| `yearTo` | number | null | Year range end |
| `language_published` | string | null | Filter by publication language |
| `language_researched` | string | null | Filter by researched language |
| `country_of_research` | string | null | Filter by research country |
| `keywords` | string | null | Filter by keywords |
| `source` | string | null | Filter by source |
| `language_family` | string | null | Filter by language family |
| `publication` | string | null | Filter by publication name |
| `publisher` | string | null | Filter by publisher |
| `biblio_name` | string | null | Filter by bibliography name |
| `sortBy` | string | "created_at" | Sort field |
| `sortOrder` | string | "desc" | Sort direction ("asc" or "desc") |

#### **Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "bibliographies": [
      {
        "_id": "68a41b4572088ccf762fdcca",
        "title": "Research Paper Title",
        "author": "Author Name",
        "year": 2024,
        "publication": "Journal Name",
        "publisher": "Publisher Name",
        "language_published": "English",
        "language_researched": "Spanish",
        "country_of_research": "Spain",
        "keywords": "keyword1, keyword2, keyword3",
        "source": "Source Name",
        "language_family": "Indo-European",
        "biblio_name": "Bibliography Name",
        "created_at": "2025-08-19T06:35:49.603Z",
        "updated_at": "2025-08-19T06:35:49.603Z",
        "created_by": "689adb464e60b85ef28ec206",
        "createdAt": "2025-08-19T06:35:49.603Z",
        "updatedAt": "2025-08-19T06:35:49.603Z",
        "publicationDate": null
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 398,
      "totalCount": 7957,
      "hasNextPage": true,
      "hasPreviousPage": false
    },
    "search": {
      "query": "linguistics",
      "filters": {
        "year": null,
        "yearFrom": 2020,
        "yearTo": 2025,
        "languagePublished": "English",
        "languageResearched": null,
        "countryOfResearch": null,
        "keywords": null,
        "source": null,
        "languageFamily": null,
        "publication": null,
        "publisher": null,
        "biblioName": null
      },
      "sortBy": "created_at",
      "sortOrder": "desc"
    }
  },
  "timestamp": "2025-08-19T06:35:39.058Z"
}
```

#### **Empty Results Response**
```json
{
  "success": true,
  "data": {
    "bibliographies": [],
    "pagination": {
      "currentPage": 1,
      "totalPages": 0,
      "totalCount": 0,
      "hasNextPage": false,
      "hasPreviousPage": false
    },
    "search": {
      "query": "nonexistent",
      "filters": { ... },
      "sortBy": "created_at",
      "sortOrder": "desc"
    }
  },
  "timestamp": "2025-08-19T06:35:39.058Z"
}
```

---

### **3. READ - Get Single Bibliography**

#### **Endpoint**
```http
GET /api/mobile/bibliography/{id}
Authorization: Bearer {token}
```

#### **Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "_id": "68a41b4572088ccf762fdcca",
    "title": "Research Paper Title",
    "author": "Author Name",
    "year": 2024,
    "publication": "Journal Name",
    "publisher": "Publisher Name",
    "language_published": "English",
    "language_researched": "Spanish",
    "country_of_research": "Spain",
    "keywords": "keyword1, keyword2, keyword3",
    "source": "Source Name",
    "language_family": "Indo-European",
    "biblio_name": "Bibliography Name",
    "created_at": "2025-08-19T06:35:49.603Z",
    "updated_at": "2025-08-19T06:35:49.603Z",
    "created_by": "689adb464e60b85ef28ec206",
    "createdAt": "2025-08-19T06:35:49.603Z",
    "updatedAt": "2025-08-19T06:35:49.603Z",
    "publicationDate": null
  },
  "timestamp": "2025-08-19T06:35:39.058Z"
}
```

#### **Error Response (404 Not Found)**
```json
{
  "success": false,
  "error": "Bibliography not found",
  "timestamp": "2025-08-19T06:35:39.058Z"
}
```

---

### **4. UPDATE - Modify Bibliography**

#### **Endpoint**
```http
PUT /api/mobile/bibliography/{id}
Authorization: Bearer {token}
Content-Type: application/json
```

#### **Request Payload**
```json
{
  "title": "Updated Research Paper Title",
  "author": "Updated Author Name",
  "year": "2025",
  "publication": "Updated Journal Name",
  "keywords": "updated, keywords, here"
}
```

**Note:** Only include fields you want to update. Unchanged fields will remain as they are.

#### **Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "_id": "68a41b4572088ccf762fdcca",
    "title": "Updated Research Paper Title",
    "author": "Updated Author Name",
    "year": 2025,
    "publication": "Updated Journal Name",
    "publisher": "Publisher Name",
    "language_published": "English",
    "language_researched": "Spanish",
    "country_of_research": "Spain",
    "keywords": "updated, keywords, here",
    "source": "Source Name",
    "language_family": "Indo-European",
    "biblio_name": "Bibliography Name",
    "created_at": "2025-08-19T06:35:49.603Z",
    "updated_at": "2025-08-19T06:42:10.144Z",
    "created_by": "689adb464e60b85ef28ec206",
    "updated_by": "689adb464e60b85ef28ec206",
    "createdAt": "2025-08-19T06:35:49.603Z",
    "updatedAt": "2025-08-19T06:42:10.144Z",
    "publicationDate": null
  },
  "timestamp": "2025-08-19T06:42:10.712Z"
}
```

#### **Error Responses**
```json
// Missing required fields
{
  "success": false,
  "error": "Title and author are required",
  "timestamp": "2025-08-19T06:42:10.712Z"
}

// Invalid year format
{
  "success": false,
  "error": "Year must be a valid number",
  "timestamp": "2025-08-19T06:42:10.712Z"
}

// Bibliography not found
{
  "success": false,
  "error": "Bibliography not found",
  "timestamp": "2025-08-19T06:42:10.712Z"
}
```

---

### **5. DELETE - Remove Bibliography**

#### **Endpoint**
```http
DELETE /api/mobile/bibliography/{id}
Authorization: Bearer {token}
```

#### **Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "message": "Bibliography deleted successfully"
  },
  "timestamp": "2025-08-19T06:42:20.080Z"
}
```

**Note:** This performs a soft delete - the bibliography is marked as inactive but remains in the database.

#### **Soft Delete Implementation**
When a bibliography is deleted:
- `is_active` is set to `false`
- `deleted_at` is set to current timestamp
- `deleted_by` is set to the user ID who performed the deletion
- The item is **completely hidden** from all GET operations
- **CRITICAL:** Deleted items cannot be accessed, updated, or deleted again

---

## 🔍 **Search & Filtering Examples**

### **Soft Delete Filtering**
**IMPORTANT:** All GET operations automatically filter out deleted items. The API ensures that:
- Deleted bibliographies (`is_active: false` or `deleted_at` exists) are **never returned**
- This applies to list queries, individual item queries, and search operations
- Legacy items without `is_active` or `deleted_at` fields are treated as active
- **No additional parameters needed** - filtering is automatic and mandatory

### **Basic Text Search**
```http
GET /api/mobile/bibliography?q=linguistics&limit=20
```

### **Year Range Search**
```http
GET /api/mobile/bibliography?yearFrom=2020&yearTo=2025&limit=20
```

### **Combined Search with Filters**
```http
GET /api/mobile/bibliography?q=spanish&year=2024&language_published=English&limit=20
```

### **Complex Filtering**
```http
GET /api/mobile/bibliography?yearFrom=2015&yearTo=2025&language_researched=Spanish&country_of_research=Spain&sortBy=year&sortOrder=asc&limit=50
```

---

## 📊 **Dashboard & Reports**

### **Dashboard Summary**
```http
GET /api/mobile/dashboard/summary
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalBibliographies": 7957,
    "totalUsers": 15,
    "recentItems": [
      {
        "_id": "68a41b4572088ccf762fdcca",
        "title": "Recent Bibliography",
        "year": 2024,
        "created_at": "2025-08-19T06:35:49.603Z"
      }
    ],
    "statistics": {
      "byYear": { "2024": 150, "2023": 120 },
      "byLanguage": { "English": 500, "Spanish": 300 }
    }
  },
  "timestamp": "2025-08-19T06:35:39.058Z"
}
```

### **Generate Reports**
```http
POST /api/mobile/dashboard/reports
Authorization: Bearer {token}
Content-Type: application/json

{
  "reportType": "temporal",
  "parameters": {
    "yearFrom": 2020,
    "yearTo": 2025
  }
}
```

---

## 📤 **Export Operations**

### **Export Bibliographies**
```http
GET /api/mobile/bibliography/export?format=csv&yearFrom=2020&yearTo=2025
Authorization: Bearer {token}
```

**Response:** CSV file download

---

## 👥 **User Management (Admin Only)**

### **List Users**
```http
GET /api/mobile/users?page=1&limit=20
Authorization: Bearer {token}
```

### **Create User**
```http
POST /api/mobile/users
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "New User",
  "email": "newuser@example.com",
  "password": "password123",
  "role": "user"
}
```

### **Update User**
```http
PATCH /api/mobile/users/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Updated User Name",
  "role": "admin"
}
```

---

## 🔍 **Advanced Search API**

### **Search with Suggestions**
```http
POST /api/mobile/search
Authorization: Bearer {token}
Content-Type: application/json

{
  "query": "linguistics",
  "filters": {
    "yearFrom": 2020,
    "yearTo": 2025,
    "languagePublished": "English"
  },
  "includeSuggestions": true,
  "includeAutocomplete": true
}
```

---

## 📋 **Data Field Reference**

### **Bibliography Fields**
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `_id` | string | Unique identifier | "68a41b4572088ccf762fdcca" |
| `title` | string | Paper title | "Research on Linguistics" |
| `author` | string | Author name | "John Doe" |
| `year` | integer | Publication year | 2024 |
| `publication` | string | Journal/publication name | "Journal of Linguistics" |
| `publisher` | string | Publisher name | "Academic Press" |
| `language_published` | string | Language of publication | "English" |
| `language_researched` | string | Language being researched | "Spanish" |
| `country_of_research` | string | Country where research was conducted | "Spain" |
| `keywords` | string | Comma-separated keywords | "linguistics, spanish, research" |
| `source` | string | Source of the bibliography | "Academic Database" |
| `language_family` | string | Language family | "Indo-European" |
| `biblio_name` | string | Name of the bibliography | "Spanish Linguistics 2024" |
| `created_at` | string | Creation timestamp | "2025-08-19T06:35:49.603Z" |
| `updated_at` | string | Last update timestamp | "2025-08-19T06:42:10.144Z" |
| `created_by` | string | User ID who created | "689adb464e60b85ef28ec206" |
| `updated_by` | string | User ID who last updated | "689adb464e60b85ef28ec206" |

### **Date Fields**
- **Input Format**: ISO 8601 strings
- **Output Format**: ISO 8601 strings with milliseconds precision
- **Swift Compatibility**: Fully compatible with Swift's default Date decoder

### **Year Field Behavior**
- **Input**: Accepts both string and integer
- **Storage**: Always stored as integer in database
- **Output**: Always returned as integer
- **Validation**: Invalid years return error "Year must be a valid number"

---

## 🚨 **Error Handling**

### **HTTP Status Codes**
- **200**: Success
- **201**: Created
- **400**: Bad Request (validation errors)
- **401**: Unauthorized (authentication failed)
- **404**: Not Found
- **500**: Internal Server Error

### **Error Response Format**
```json
{
  "success": false,
  "error": "Error message description",
  "timestamp": "2025-08-19T06:42:20.080Z"
}
```

### **Common Error Messages**
- `"Not authenticated"` - Missing or invalid token
- `"Title and author are required"` - Missing required fields
- `"Year must be a valid number"` - Invalid year format
- `"Bibliography not found"` - ID doesn't exist
- `"Bibliography not found or has been deleted"` - ID exists but item was soft deleted
- `"Bibliography not found or has already been deleted"` - Attempting to delete already deleted item
- `"Failed to create bibliography"` - Database operation failed
- `"Internal server error"` - Unexpected server error

---

## 🧪 **Testing Examples**

### **Test CRUD Flow**
```bash
# 1. Login to get token
curl -X POST http://localhost:3000/api/mobile/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# 2. Create bibliography
curl -X POST http://localhost:3000/api/mobile/bibliography \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{"title":"Test Title","author":"Test Author","year":"2024"}'

# 3. Read bibliography list
curl -X GET "http://localhost:3000/api/mobile/bibliography?limit=5" \
  -H "Authorization: Bearer {token}"

# 4. Update bibliography
curl -X PUT http://localhost:3000/api/mobile/bibliography/{id} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{"title":"Updated Title","year":"2025"}'

# 5. Delete bibliography
curl -X DELETE http://localhost:3000/api/mobile/bibliography/{id} \
  -H "Authorization: Bearer {token}"
```

---

## 📱 **iOS Implementation Notes**

### **Data Models**
```swift
struct Bibliography: Codable {
    let _id: String
    let title: String
    let author: String
    let year: Int?           // Integer, not String
    let publication: String?
    let publisher: String?
    let language_published: String?
    let language_researched: String?
    let country_of_research: String?
    let keywords: String?
    let source: String?
    let language_family: String?
    let biblio_name: String?
    let created_at: String?
    let updated_at: String?
    let created_by: String?
    let updated_by: String?
}

struct ApiResponse<T: Codable>: Codable {
    let success: Bool
    let data: T?
    let error: String?
    let timestamp: String
}
```

### **Key Points for iOS**
1. **Year Field**: Always `Int?`, never `String?`
2. **Date Fields**: ISO 8601 strings, fully Swift compatible
3. **Authentication**: Bearer token in Authorization header
4. **Error Handling**: Check `success` field and `error` message
5. **Pagination**: Use `pagination` object for list navigation
6. **Search**: Combine `q` parameter with filters for complex queries

---

## 🎯 **Best Practices**

### **Data Integrity Guarantees**
The API provides the following guarantees for soft-deleted items:
- **Complete Isolation**: Deleted items are completely invisible to all GET operations
- **No Accidental Access**: Attempting to access deleted items returns 404 with clear error message
- **No Double Deletion**: Attempting to delete already deleted items returns 404
- **Consistent State**: All operations (GET, PUT, DELETE) respect the deleted state
- **Legacy Support**: Items without deletion fields are treated as active for backward compatibility

### **Performance**
- Use appropriate `limit` values (20-50 recommended)
- Implement pagination for large datasets
- Cache frequently accessed data
- Use specific filters to reduce result sets

### **Error Handling**
- Always check `success` field in responses
- Handle network errors gracefully
- Validate data before sending to API
- Implement retry logic for transient failures

### **Data Validation**
- Validate required fields before API calls
- Ensure year is valid number (1-2100)
- Sanitize user input
- Handle empty or null responses

---

**This API reference provides everything your iOS team needs to implement robust CRUD operations! 🚀✨**
