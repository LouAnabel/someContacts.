# 📇 someContacts - Personal Contact Management API

A comprehensive REST API for managing personal contacts with advanced features like categorization, search, favorites, and secure authentication.

## 🚀 Features Overview

### 🔐 **Authentication & Security**
- User registration and login
- JWT-based authentication with access and refresh tokens
- Database-based token blacklisting for secure logout
- Password strength validation (uppercase, lowercase, numbers, 8+ characters)
- Email format validation
- User-specific data isolation

### 👥 **Contact Management**
- Create, read, update, and delete contacts
- Comprehensive contact information storage
- Advanced search across multiple fields
- Pagination support for large contact lists
- Favorites system for important contacts
- Bulk operations (bulk delete)

### 🏷️ **Category System**
- Create custom categories for organizing contacts
- Assign contacts to categories
- Category-based filtering
- Protected categories (user-specific)

### 🔍 **Advanced Search & Filtering**
- Search across name, email, city, country, and meeting places
- Filter by favorites
- Filter by categories (including uncategorized)
- Combine multiple filters
- Pagination with customizable page sizes

### 📊 **Data Features**
- Rich contact profiles with personal and professional information
- Date tracking (birth dates, last contact dates)
- Address information storage
- Notes and custom fields
- Contact history tracking

## 🏗️ Technical Architecture

### **Backend Stack**
- **Framework**: Flask (Python)
- **Database**: SQLite with SQLAlchemy ORM
- **Authentication**: Flask-JWT-Extended
- **Password Security**: Flask-Bcrypt
- **CORS**: Flask-CORS for frontend integration
- **Database Migrations**: Flask-Migrate

### **Database Schema**
- **Users**: Authentication and user management
- **Contacts**: Complete contact information
- **Categories**: User-defined contact categories
- **Token Blacklist**: Secure logout functionality

### **Security Features**
- JWT token authentication
- Database-based token blacklisting
- Password hashing with bcrypt
- User data isolation
- Input validation and sanitization

## 📁 Project Structure

```
backend/
├── app/
│   ├── __init__.py              # Flask application factory
│   ├── models/
│   │   ├── user.py              # User model
│   │   ├── contact.py           # Contact model
│   │   ├── category.py          # Category model
│   │   └── token_block_list.py  # Token blacklist model
│   ├── routes/
│   │   ├── auth.py              # Authentication routes
│   │   ├── contacts.py          # Contact management routes
│   │   └── categories.py        # Category management routes
│   └── services/
│       └── token_service.py     # Token management service
├── instance/
│   ├── someContacts.db          # Production database
│   └── someContacts_dev.db      # Development database
├── config.py                    # Application configuration
├── requirements.txt             # Python dependencies
├── run.py                       # Development server
├── wsgi.py                      # Production WSGI entry point
└── .python-version             # Python version specification
```

## 🔧 Installation & Setup

### **Prerequisites**
- Python 3.12+
- pip (Python package manager)

### **Quick Start**

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   Create `.env` file:
   ```env
   SECRET_KEY=your-super-secret-flask-key-here
   JWT_SECRET_KEY=your-jwt-secret-key-here
   FLASK_ENV=development
   FLASK_DEBUG=True
   ```

5. **Run the application**
   ```bash
   python run.py
   ```

6. **Access the API**
   - Base URL: `http://localhost:5000`
   - Health Check: `http://localhost:5000/health`

## 📚 API Documentation

### **Base URL**
```
http://localhost:5000
```

### **Authentication Headers**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

---

## 🔐 Authentication Endpoints

### **Register User**
```http
POST /auth/register
```

**Request Body:**
```json
{
    "email": "user@example.com",
    "password": "SecurePass123",
    "first_name": "John",
    "last_name": "Doe"
}
```

**Response (201):**
```json
{
    "message": "User created successfully",
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "user": {
        "id": 1,
        "email": "user@example.com",
        "first_name": "John",
        "last_name": "Doe",
        "created_at": "2025-06-25T12:00:00"
    }
}
```

### **Login User**
```http
POST /auth/login
```

**Request Body:**
```json
{
    "email": "user@example.com",
    "password": "SecurePass123"
}
```

**Response (200):**
```json
{
    "success": true,
    "message": "Login successful",
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "user": {
        "id": 1,
        "email": "user@example.com",
        "first_name": "John",
        "last_name": "Doe"
    }
}
```

### **Get Current User**
```http
GET /auth/me
Authorization: Bearer <access_token>
```

### **Refresh Token**
```http
POST /auth/refresh
Authorization: Bearer <refresh_token>
```

### **Logout**
```http
POST /auth/logout
Authorization: Bearer <access_token>
```

### **Logout All Devices**
```http
POST /auth/logout-all
Authorization: Bearer <access_token>
```

---

## 👥 Contact Endpoints

### **Create Contact**
```http
POST /contacts
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
    "first_name": "Alice",
    "last_name": "Johnson",
    "email": "alice@example.com",
    "phone": "+1234567890",
    "category_id": 1,
    "birth_date": "15-05-1985",
    "last_contact_date": "20-06-2025",
    "last_contact_place": "Coffee Shop Downtown",
    "street_and_nr": "123 Main Street",
    "postal_code": "12345",
    "city": "New York",
    "country": "USA",
    "notes": "Great person to work with!",
    "is_favorite": true
}
```

**Required Fields:** `first_name`
**Optional Fields:** All others

### **Get All Contacts**
```http
GET /contacts?page=1&per_page=10&search=alice&favorites=true&category_id=1
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `page` (int): Page number (default: 1)
- `per_page` (int): Items per page (default: 10, max: 100)
- `search` (string): Search term across multiple fields
- `favorites` (boolean): Filter favorites only
- `category_id` (int|string): Filter by category or 'uncategorized'

**Response (200):**
```json
{
    "success": true,
    "contacts": [
        {
            "id": 1,
            "creator_id": 1,
            "first_name": "Alice",
            "last_name": "Johnson",
            "email": "alice@example.com",
            "phone": "+1234567890",
            "is_favorite": true,
            "category_id": 1,
            "category": {
                "id": 1,
                "name": "Work Colleagues"
            },
            "birth_date": "15-05-1985",
            "last_contact_date": "20-06-2025",
            "last_contact_place": "Coffee Shop Downtown",
            "street_and_nr": "123 Main Street",
            "postal_code": "12345",
            "city": "New York",
            "country": "USA",
            "notes": "Great person to work with!",
            "created_at": "25-06-2025 12:50:12",
            "updated_at": "25-06-2025 12:50:12"
        }
    ],
    "pagination": {
        "page": 1,
        "per_page": 10,
        "total": 1,
        "pages": 1,
        "has_next": false,
        "has_prev": false
    }
}
```

### **Get Contact by ID**
```http
GET /contacts/{contact_id}
Authorization: Bearer <access_token>
```

### **Update Contact**
```http
PUT /contacts/{contact_id}
Authorization: Bearer <access_token>
```

**Request Body:** Same as create contact (all fields optional)

### **Delete Contact**
```http
DELETE /contacts/{contact_id}
Authorization: Bearer <access_token>
```

### **Bulk Delete Contacts**
```http
DELETE /contacts/bulk-delete
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
    "contact_ids": [1, 2, 3]
}
```

### **Get Favorites Only**
```http
GET /contacts/favorites
Authorization: Bearer <access_token>
```

### **Toggle Favorite Status**
```http
POST /contacts/{contact_id}/favorite
Authorization: Bearer <access_token>
```

### **Get Category Options for Dropdown**
```http
GET /contacts/categories
Authorization: Bearer <access_token>
```

---

## 🏷️ Category Endpoints

### **Create Category**
```http
POST /categories
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
    "name": "Work Colleagues"
}
```

### **Get All Categories**
```http
GET /categories
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
    "success": true,
    "categories": [
        {
            "id": 1,
            "name": "Work Colleagues",
            "creator_id": 1,
            "created_at": "2025-06-25T12:00:00",
            "contact_count": 5
        }
    ],
    "total": 1
}
```

### **Get Category by ID**
```http
GET /categories/{category_id}
Authorization: Bearer <access_token>
```

### **Update Category**
```http
PUT /categories/{category_id}
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
    "name": "Business Contacts"
}
```

### **Delete Category**
```http
DELETE /categories/{category_id}
Authorization: Bearer <access_token>
```

**Note:** Cannot delete categories that contain contacts

### **Get Contacts in Category**
```http
GET /categories/{category_id}/contacts
Authorization: Bearer <access_token>
```

---

## 🔍 Search Features

### **Search Functionality**
The search feature works across multiple fields:
- First name
- Last name
- Email address
- Last contact place
- City
- Country

### **Search Examples**
```http
# Search for "john" in any field
GET /contacts?search=john

# Search for contacts in "Berlin"
GET /contacts?search=Berlin

# Search favorites only
GET /contacts?search=alice&favorites=true

# Search in specific category
GET /contacts?search=smith&category_id=1

# Combine all filters
GET /contacts?search=john&favorites=true&category_id=2&page=1&per_page=5
```

### **No Results Response**
```json
{
    "success": false,
    "message": "No matching contacts found for search term 'xyz'",
    "details": {
        "total_results": 0,
        "applied_filters": ["search term 'xyz'"],
        "suggestions": [
            "Try a different search term",
            "Check spelling",
            "Remove some filters to broaden your search"
        ]
    }
}
```

---

## 📊 Data Models

### **User Model**
```json
{
    "id": 1,
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "created_at": "2025-06-25T12:00:00"
}
```

### **Contact Model**
```json
{
    "id": 1,
    "creator_id": 1,
    "first_name": "Alice",
    "last_name": "Johnson",
    "email": "alice@example.com",
    "phone": "+1234567890",
    "is_favorite": true,
    "category_id": 1,
    "birth_date": "15-05-1985",
    "last_contact_date": "20-06-2025",
    "last_contact_place": "Coffee Shop Downtown",
    "street_and_nr": "123 Main Street",
    "postal_code": "12345",
    "city": "New York",
    "country": "USA",
    "notes": "Great person to work with!",
    "created_at": "25-06-2025 12:50:12",
    "updated_at": "25-06-2025 12:50:12",
    "category": {
        "id": 1,
        "name": "Work Colleagues"
    }
}
```

### **Category Model**
```json
{
    "id": 1,
    "name": "Work Colleagues",
    "creator_id": 1,
    "created_at": "2025-06-25T12:00:00",
    "contact_count": 5
}
```

---

## ⚙️ Configuration

### **Environment Variables**
```env
# Required
SECRET_KEY=your-super-secret-flask-key
JWT_SECRET_KEY=your-jwt-secret-key

# Optional
FLASK_ENV=development|production
FLASK_DEBUG=True|False
DATABASE_PATH=/custom/path/to/database.db
```

### **JWT Token Configuration**
- **Access Token Expiry**: 30 seconds (development), 15 minutes (production)
- **Refresh Token Expiry**: 1 hour (development), 1 day (production)
- **Token Algorithm**: HS256

### **Database Configuration**
- **Development**: SQLite (`instance/someContacts_dev.db`)
- **Production**: SQLite (`instance/someContacts.db`)
- **Engine Options**: Optimized for SQLite with connection pooling

---

## 🚀 Deployment

### **Development Server**
```bash
python run.py
```

### **Production Server (with Gunicorn)**
```bash
pip install gunicorn
gunicorn wsgi:app
```

### **Docker Deployment**
```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 5000
CMD ["gunicorn", "wsgi:app", "--bind", "0.0.0.0:5000"]
```

### **Environment-Specific Settings**
- **Development**: Debug mode, longer token expiry, detailed logging
- **Production**: Secure settings, shorter token expiry, error logging only

---

## 🛡️ Security Features

### **Authentication Security**
- JWT tokens with configurable expiry
- Database-based token blacklisting
- Secure logout from single/all devices
- Password strength validation

### **Data Protection**
- User data isolation (users can only access their own data)
- Input validation and sanitization
- SQL injection prevention via SQLAlchemy
- CORS configuration for frontend integration

### **Password Requirements**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

---

## 🔧 Maintenance & Monitoring

### **Health Check Endpoint**
```http
GET /health
```

**Response:**
```json
{
    "status": "healthy",
    "database": "connected",
    "redis_available": false,
    "environment": "development",
    "timestamp": "2025-06-25T12:00:00Z"
}
```

### **Logging**
- Structured logging with different levels
- User action tracking
- Error logging with stack traces
- Performance monitoring capabilities

### **Database Maintenance**
- Automatic token cleanup for expired entries
- Database optimization for SQLite
- Migration support via Flask-Migrate

---

## 🐛 Error Handling

### **Common HTTP Status Codes**
- **200**: Success
- **201**: Created
- **400**: Bad Request (validation errors)
- **401**: Unauthorized (invalid/missing token)
- **403**: Forbidden
- **404**: Not Found
- **409**: Conflict (duplicate data)
- **500**: Internal Server Error

### **Error Response Format**
```json
{
    "success": false,
    "message": "Human-readable error message",
    "error": "Technical error details",
    "details": {
        "field": "Additional context"
    }
}
```

---

## 📝 Development Notes

### **Code Organization**
- **Models**: Database schema definitions
- **Routes**: API endpoint implementations  
- **Services**: Business logic and utilities
- **Config**: Environment-specific settings

### **Best Practices Implemented**
- RESTful API design
- Proper HTTP status codes
- Comprehensive input validation
- Security-first approach
- Clean code architecture
- Extensive error handling

### **Testing Recommendations**
- Use Postman for API testing
- Test all CRUD operations
- Verify authentication flows
- Test edge cases and error conditions
- Validate search and filtering

---

## 🤝 Contributing

### **Development Setup**
1. Fork the repository
2. Create feature branch
3. Follow existing code style
4. Add comprehensive tests
5. Update documentation
6. Submit pull request

### **Code Style**
- Follow PEP 8 for Python code
- Use meaningful variable names
- Add docstrings for functions
- Keep functions focused and small

---

## 📞 Support

For questions, issues, or feature requests:
- Check the existing documentation
- Review error messages and logs
- Test with provided examples
- Verify environment configuration

---

**someContacts API** - A robust, secure, and feature-rich contact management solution built with Flask and modern best practices.