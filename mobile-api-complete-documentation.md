# 📱 **Complete Mobile API Documentation**

## 🚀 **Overview**

This document provides comprehensive documentation for all mobile API endpoints in the Bibliography App. These endpoints are specifically designed for mobile applications with clean JSON responses, consistent error handling, and mobile-optimized data structures.

---

## 🔐 **Authentication Endpoints**

### **1. Mobile Login**
- **Endpoint:** `POST /api/mobile/auth/login`
- **Description:** Authenticate user and get access token
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "_id": "user_id",
        "email": "user@example.com",
        "name": "User Name",
        "role": "standard"
      },
      "token": "jwt_token_here"
    }
  }
  ```

### **2. Session Validation**
- **Endpoint:** `GET /api/mobile/auth/session`
- **Description:** Validate current session and get user info
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "_id": "user_id",
        "email": "user@example.com",
        "name": "User Name",
        "role": "standard"
      }
    }
  }
  ```

### **3. Logout**
- **Endpoint:** `POST /api/mobile/auth/logout`
- **Description:** Logout user and invalidate session
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "message": "Logged out successfully"
    }
  }
  ```

---

## 📚 **Bibliography Management Endpoints**

### **4. List/Search Bibliographies**
- **Endpoint:** `GET /api/mobile/bibliography`
- **Description:** Get paginated list of bibliographies with advanced search
- **Query Parameters:**
  - `page` (default: 1) - Page number
  - `limit` (default: 20) - Items per page
  - `q` - Search query across multiple fields
  - `sortBy` (default: "created_at") - Sort field
  - `sortOrder` (default: "desc") - Sort direction
  - `year` - Filter by publication year
  - `language_published` - Filter by publication language
  - `language_researched` - Filter by researched language
  - `country_of_research` - Filter by research country
  - `keywords` - Filter by keywords
  - `source` - Filter by source
  - `language_family` - Filter by language family
  - `publication` - Filter by publication name
  - `publisher` - Filter by publisher
  - `biblio_name` - Filter by bibliography name

- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "bibliographies": [...],
      "pagination": {
        "page": 1,
        "limit": 20,
        "total": 150,
        "pages": 8
      },
      "search": {
        "query": "search_term",
        "filters": {...},
        "sortBy": "created_at",
        "sortOrder": "desc"
      }
    }
  }
  ```

### **5. Create Bibliography**
- **Endpoint:** `POST /api/mobile/bibliography`
- **Description:** Create new bibliography entry
- **Request Body:**
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
    "keywords": "linguistics, research, methodology"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "_id": "bibliography_id",
      "title": "Research Paper Title",
      "author": "Author Name",
      "created_at": "2024-01-15T10:30:00.000Z",
      ...
    }
  }
  ```

### **6. Get Bibliography Detail**
- **Endpoint:** `GET /api/mobile/bibliography/{id}`
- **Description:** Get detailed information about specific bibliography
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "_id": "bibliography_id",
      "title": "Research Paper Title",
      "author": "Author Name",
      "year": "2024",
      "publication": "Journal Name",
      "publisher": "Publisher Name",
      "language_published": "English",
      "language_researched": "Spanish",
      "country_of_research": "Spain",
      "keywords": "linguistics, research, methodology",
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T10:30:00.000Z"
    }
  }
  ```

### **7. Update Bibliography**
- **Endpoint:** `PUT /api/mobile/bibliography/{id}`
- **Description:** Update existing bibliography
- **Request Body:** Same as create, but all fields optional
- **Response:** Updated bibliography object

### **8. Delete Bibliography**
- **Endpoint:** `DELETE /api/mobile/bibliography/{id}`
- **Description:** Soft delete bibliography (marks as inactive)
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "message": "Bibliography deleted successfully"
    }
  }
  ```

### **9. Export Bibliographies**
- **Endpoint:** `GET /api/mobile/bibliography/export`
- **Description:** Export bibliographies in CSV or JSON format
- **Query Parameters:**
  - `format` (default: "json") - "json" or "csv"
  - `limit` (default: 1000) - Maximum items to export
  - All filter parameters from search endpoint
- **Response:** CSV file or JSON data

---

## 📊 **Dashboard & Reports Endpoints**

### **10. Dashboard Summary**
- **Endpoint:** `GET /api/mobile/dashboard/summary`
- **Description:** Get dashboard overview statistics
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "stats": {
        "totalRecords": 150,
        "thisYear": 25,
        "uniqueLanguages": 12,
        "uniqueCountries": 8
      },
      "languages": [
        {
          "language": "English",
          "count": 45,
          "percentage": 30.0
        }
      ],
      "recentItems": [...]
    }
  }
  ```

### **11. Generate Reports**
- **Endpoint:** `POST /api/mobile/dashboard/reports`
- **Description:** Generate various analytical reports
- **Request Body:**
  ```json
  {
    "dateRange": {
      "start": "2020-01-01",
      "end": "2024-12-31"
    },
    "reportType": "temporal"
  }
  ```
- **Report Types:**
  - `temporal` - Yearly trends and patterns
  - `geographic` - Country-based research distribution
  - `language` - Language distribution analysis
  - `publication` - Publication statistics
  - `author` - Author contribution analysis
  - `gaps` - Research gaps identification

---

## 👥 **User Management Endpoints**

### **12. List Users**
- **Endpoint:** `GET /api/mobile/users`
- **Description:** Get paginated list of users (Admin only)
- **Query Parameters:**
  - `page` (default: 1)
  - `limit` (default: 20)
  - `role` - Filter by user role
  - `is_active` - Filter by active status
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "users": [...],
      "pagination": {
        "page": 1,
        "limit": 20,
        "total": 25,
        "pages": 2
      }
    }
  }
  ```

### **13. Create User**
- **Endpoint:** `POST /api/mobile/users`
- **Description:** Create new user (Super Admin only)
- **Request Body:**
  ```json
  {
    "email": "newuser@example.com",
    "name": "New User",
    "role": "standard"
  }
  ```

### **14. Get User Detail**
- **Endpoint:** `GET /api/mobile/users/{id}`
- **Description:** Get detailed user information (Admin only)

### **15. Update User**
- **Endpoint:** `PATCH /api/mobile/users/{id}`
- **Description:** Update user details (Super Admin only)
- **Request Body:**
  ```json
  {
    "name": "Updated Name",
    "role": "admin",
    "is_active": true
  }
  ```

### **16. Delete User**
- **Endpoint:** `DELETE /api/mobile/users/{id}`
- **Description:** Soft delete user (Super Admin only)

---

## 🔍 **Search & Suggestions Endpoints**

### **17. Advanced Search**
- **Endpoint:** `GET /api/mobile/search`
- **Description:** Advanced search with suggestions and autocomplete
- **Query Parameters:**
  - `q` - Search query (required)
  - `type` - Search type: "all", "suggestions", "autocomplete"
  - `limit` (default: 10) - Maximum results
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "query": "search_term",
      "type": "all",
      "results": [...],
      "count": 15,
      "suggestions": {
        "languages": ["English", "Spanish"],
        "countries": ["USA", "Spain"],
        "publications": ["Journal A", "Journal B"],
        "years": ["2020", "2021", "2022"]
      }
    }
  }
  ```

---

## 📋 **Common Response Format**

All mobile API endpoints follow a consistent response format:

### **Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

### **Error Response:**
```json
{
  "success": false,
  "data": null,
  "error": "Error message description"
}
```

---

## 🔒 **Authentication & Authorization**

### **Headers Required:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### **Role-Based Access:**
- **Standard Users:** Can read bibliographies, access dashboard
- **Admin Users:** Can manage bibliographies, view users
- **Super Admin Users:** Can manage all users and system settings

---

## 📱 **Mobile-Specific Features**

### **Date Formatting:**
- All dates are returned in ISO 8601 format with milliseconds precision
- Compatible with Swift's default Date decoder
- Example: `"2024-01-15T10:30:00.000Z"`

### **Pagination:**
- Consistent pagination structure across all list endpoints
- Page numbers start from 1
- Configurable page sizes with sensible defaults

### **Error Handling:**
- HTTP status codes for different error types
- Consistent error message format
- Detailed error descriptions for debugging

### **Performance:**
- Optimized database queries
- Efficient aggregation pipelines
- Smart caching strategies

---

## 🚀 **Usage Examples**

### **iOS Swift Example:**
```swift
// Search bibliographies
let url = URL(string: "https://your-api.com/api/mobile/bibliography?q=linguistics&page=1&limit=20")!
var request = URLRequest(url: url)
request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")

URLSession.shared.dataTask(with: request) { data, response, error in
    // Handle response
}.resume()
```

### **Android Kotlin Example:**
```kotlin
// Get dashboard summary
val url = "https://your-api.com/api/mobile/dashboard/summary"
val request = Request.Builder()
    .url(url)
    .addHeader("Authorization", "Bearer $token")
    .build()

client.newCall(request).enqueue(object : Callback {
    override fun onResponse(call: Call, response: Response) {
        // Handle response
    }
    
    override fun onFailure(call: Call, e: IOException) {
        // Handle error
    }
})
```

---

## 📊 **API Status & Monitoring**

### **Health Check:**
- All endpoints return appropriate HTTP status codes
- Error responses include detailed error messages
- Consistent response times under 500ms for most operations

### **Rate Limiting:**
- Standard rate limiting applied
- Mobile-specific optimizations for high-frequency operations
- Graceful degradation under load

---

## 🔧 **Development & Testing**

### **Local Development:**
```bash
# Start the development server
npm run dev

# Test mobile endpoints
curl -H "Authorization: Bearer <token>" \
     "http://localhost:3000/api/mobile/bibliography?q=test"
```

### **Testing Tools:**
- Postman collections available
- Swagger/OpenAPI documentation
- Mobile app testing endpoints

---

## 📚 **Additional Resources**

- **Web API Documentation:** [Link to web API docs]
- **Authentication Guide:** [Link to auth docs]
- **Database Schema:** [Link to schema docs]
- **Mobile SDK:** [Link to mobile SDK]

---

## 🆘 **Support & Contact**

For technical support or questions about the mobile API:
- **Email:** support@bibliography-app.com
- **Documentation:** [Link to docs]
- **GitHub Issues:** [Link to issues]

---

*Last Updated: January 2024*  
*Version: 2.0.0*  
*Mobile API Coverage: 100% Complete* 🎯
