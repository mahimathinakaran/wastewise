# WasteWise - API Documentation

## 📚 Complete API Reference

Base URL: `http://localhost:8000` (Development)

## 🔐 Authentication

All protected endpoints require a Bearer token in the Authorization header:

```http
Authorization: Bearer <jwt_token>
```

Tokens are returned from the login/register endpoints and expire after 24 hours (configurable).

---

## 🔑 Authentication Endpoints

### Register User/Admin

Create a new user or admin account.

**Endpoint:** `POST /auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user"
}
```

**Field Validation:**
- `name`: Required, 2-100 characters
- `email`: Required, valid email format
- `password`: Required, minimum 6 characters
- `role`: Required, must be "user" or "admin"

**Response (201 Created):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Email already registered or validation failed
- `500 Internal Server Error`: Registration failed

---

### Login

Authenticate user and receive JWT token.

**Endpoint:** `POST /auth/login`

**Rate Limit:** 10 requests per minute

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123",
  "role": "user"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid email or password
- `403 Forbidden`: Account is not registered with this role

---

## 👤 User Profile Endpoints

### Get User Profile

Get current user's profile information.

**Endpoint:** `GET /user/profile`

**Authentication:** Required

**Response (200 OK):**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "user",
  "created_at": "2025-01-15T10:30:00Z"
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid or missing token
- `404 Not Found`: User not found

---

### Update User Profile

Update user's name and/or email.

**Endpoint:** `PUT /user/profile`

**Authentication:** Required

**Rate Limit:** 10 requests per minute

**Request Body:**
```json
{
  "name": "John Smith",
  "email": "johnsmith@example.com"
}
```

**Field Validation:**
- `name`: Optional, 2-100 characters
- `email`: Optional, valid email format, must be unique

**Response (200 OK):**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Smith",
    "email": "johnsmith@example.com",
    "role": "user"
  }
}
```

**Error Responses:**
- `400 Bad Request`: No fields to update or email already in use
- `401 Unauthorized`: Invalid token

---

### Update Password

Change user's password.

**Endpoint:** `PUT /user/password`

**Authentication:** Required

**Rate Limit:** 5 requests per minute

**Request Body:**
```json
{
  "current_password": "oldpassword123",
  "new_password": "newpassword456"
}
```

**Field Validation:**
- `current_password`: Required
- `new_password`: Required, minimum 6 characters

**Response (200 OK):**
```json
{
  "message": "Password updated successfully"
}
```

**Error Responses:**
- `400 Bad Request`: Current password is incorrect
- `401 Unauthorized`: Invalid token

---

## 📋 Reports Endpoints

### Create Report

Create a new waste management report with image upload.

**Endpoint:** `POST /reports/create`

**Authentication:** Required

**Rate Limit:** 20 requests per minute

**Content-Type:** `multipart/form-data`

**Request Body (Form Data):**
- `location` (string, required): Location description, 3-200 characters
- `description` (string, required): Report description, 10-1000 characters
- `image` (file, required): Image file (max 10MB, image formats only)

**Example with cURL:**
```bash
curl -X POST http://localhost:8000/reports/create \
  -H "Authorization: Bearer <token>" \
  -F "location=123 Main St, City" \
  -F "description=Large pile of waste on sidewalk" \
  -F "image=@/path/to/image.jpg"
```

**Response (201 Created):**
```json
{
  "_id": "507f191e810c19729de860ea",
  "user_id": "507f1f77bcf86cd799439011",
  "user_name": "John Doe",
  "user_email": "john@example.com",
  "image_url": "/uploads/1706180400.123_507f1f77bcf86cd799439011.jpg",
  "location": "123 Main St, City",
  "description": "Large pile of waste on sidewalk",
  "status": "pending",
  "admin_comment": "",
  "timestamp": "2025-01-15T10:30:00Z"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid file type, file too large, or validation failed
- `401 Unauthorized`: Invalid token

---

### Get User Reports

Get all reports submitted by a specific user.

**Endpoint:** `GET /reports/user/{user_id}`

**Authentication:** Required

**Path Parameters:**
- `user_id` (string): User ID

**Authorization:**
- Users can only access their own reports
- Admins can access any user's reports

**Response (200 OK):**
```json
[
  {
    "_id": "507f191e810c19729de860ea",
    "user_id": "507f1f77bcf86cd799439011",
    "user_name": "John Doe",
    "user_email": "john@example.com",
    "image_url": "/uploads/image123.jpg",
    "location": "123 Main St, City",
    "description": "Large pile of waste",
    "status": "in_progress",
    "admin_comment": "Cleanup team dispatched",
    "timestamp": "2025-01-15T10:30:00Z"
  }
]
```

**Error Responses:**
- `401 Unauthorized`: Invalid token
- `403 Forbidden`: Not authorized to access these reports

---

### Get All Reports (Admin Only)

Get all reports from all users.

**Endpoint:** `GET /reports/all`

**Authentication:** Required (Admin role)

**Response (200 OK):**
```json
[
  {
    "_id": "507f191e810c19729de860ea",
    "user_id": "507f1f77bcf86cd799439011",
    "user_name": "John Doe",
    "user_email": "john@example.com",
    "image_url": "/uploads/image123.jpg",
    "location": "123 Main St, City",
    "description": "Large pile of waste",
    "status": "pending",
    "admin_comment": "",
    "timestamp": "2025-01-15T10:30:00Z"
  },
  {
    "_id": "507f191e810c19729de860eb",
    "user_id": "507f1f77bcf86cd799439012",
    "user_name": "Jane Smith",
    "user_email": "jane@example.com",
    "image_url": "/uploads/image456.jpg",
    "location": "456 Oak Ave, City",
    "description": "Overflowing bin",
    "status": "completed",
    "admin_comment": "Cleaned on 2025-01-16",
    "timestamp": "2025-01-14T15:20:00Z"
  }
]
```

**Error Responses:**
- `401 Unauthorized`: Invalid token
- `403 Forbidden`: Admin access required

---

### Update Report (Admin Only)

Update report status and/or add admin comments.

**Endpoint:** `PUT /reports/update/{report_id}`

**Authentication:** Required (Admin role)

**Rate Limit:** 30 requests per minute

**Path Parameters:**
- `report_id` (string): Report ID (MongoDB ObjectId)

**Request Body:**
```json
{
  "status": "in_progress",
  "admin_comment": "Cleanup team has been dispatched"
}
```

**Field Validation:**
- `status`: Optional, must be "pending", "in_progress", or "completed"
- `admin_comment`: Optional, any string

**Response (200 OK):**
```json
{
  "_id": "507f191e810c19729de860ea",
  "user_id": "507f1f77bcf86cd799439011",
  "user_name": "John Doe",
  "user_email": "john@example.com",
  "image_url": "/uploads/image123.jpg",
  "location": "123 Main St, City",
  "description": "Large pile of waste",
  "status": "in_progress",
  "admin_comment": "Cleanup team has been dispatched",
  "timestamp": "2025-01-15T10:30:00Z"
}
```

**Error Responses:**
- `400 Bad Request`: No fields to update or invalid report ID
- `401 Unauthorized`: Invalid token
- `403 Forbidden`: Admin access required
- `404 Not Found`: Report not found

---

### Get Report Statistics

Get statistics about reports (counts by status).

**Endpoint:** `GET /reports/stats`

**Authentication:** Required

**Response (200 OK) - Admin:**
```json
{
  "pending": 15,
  "in_progress": 8,
  "completed": 42,
  "total": 65
}
```

**Response (200 OK) - User:**
```json
{
  "pending": 2,
  "in_progress": 1,
  "completed": 5,
  "total": 8,
  "my_pending": 2,
  "my_in_progress": 1,
  "my_completed": 5,
  "my_total": 8
}
```

**Note:** Users receive both system-wide stats and their personal stats.

**Error Responses:**
- `401 Unauthorized`: Invalid token

---

## 🏥 System Endpoints

### Health Check

Check API and database connectivity status.

**Endpoint:** `GET /health`

**Authentication:** Not required

**Rate Limit:** 10 requests per minute

**Response (200 OK):**
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2025-01-15T10:30:00.123Z"
}
```

**Error Responses:**
- `503 Service Unavailable`: Database connection failed

---

### Root Endpoint

API information.

**Endpoint:** `GET /`

**Authentication:** Not required

**Response (200 OK):**
```json
{
  "message": "WasteWise API is running",
  "version": "1.0.0",
  "docs": "/docs"
}
```

---

## 📊 Report Status Workflow

Reports follow this status progression:

1. **pending** → Initial state when report is created
2. **in_progress** → Admin has acknowledged and is working on it
3. **completed** → Issue has been resolved

```
pending → in_progress → completed
```

Only admins can update report status.

---

## 🔒 Rate Limiting

Rate limits are enforced per IP address:

| Endpoint | Rate Limit |
|----------|------------|
| `POST /auth/register` | 5 requests/minute |
| `POST /auth/login` | 10 requests/minute |
| `GET /health` | 10 requests/minute |
| `PUT /user/profile` | 10 requests/minute |
| `PUT /user/password` | 5 requests/minute |
| `POST /reports/create` | 20 requests/minute |
| `PUT /reports/update/{id}` | 30 requests/minute |

**Rate Limit Exceeded Response (429):**
```json
{
  "detail": "Rate limit exceeded"
}
```

---

## 📁 File Upload Specifications

### Image Upload Requirements

- **Maximum file size:** 10 MB
- **Allowed formats:** image/jpeg, image/png, image/gif, image/webp
- **Storage location:** `backend/uploads/`
- **Naming convention:** `{timestamp}_{user_id}{extension}`

### Accessing Uploaded Images

Images are served as static files:

```
http://localhost:8000/uploads/1706180400.123_507f1f77bcf86cd799439011.jpg
```

---

## 🛡️ Security Headers

All responses include the following security headers:

```http
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'
```

---

## ⚠️ Error Response Format

All errors follow this format:

```json
{
  "detail": "Error message describing what went wrong"
}
```

### HTTP Status Codes

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error
- `503 Service Unavailable`: Service temporarily unavailable

---

## 💡 Usage Examples

### JavaScript/Axios

**Login:**
```javascript
import axios from 'axios';

const login = async () => {
  try {
    const response = await axios.post('http://localhost:8000/auth/login', {
      email: 'user@example.com',
      password: 'password123',
      role: 'user'
    });
    
    const { token, user } = response.data;
    localStorage.setItem('auth_token', token);
    console.log('Logged in as:', user.name);
  } catch (error) {
    console.error('Login failed:', error.response.data.detail);
  }
};
```

**Create Report:**
```javascript
const createReport = async (imageFile, location, description) => {
  const formData = new FormData();
  formData.append('image', imageFile);
  formData.append('location', location);
  formData.append('description', description);
  
  try {
    const token = localStorage.getItem('auth_token');
    const response = await axios.post(
      'http://localhost:8000/reports/create',
      formData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    console.log('Report created:', response.data);
  } catch (error) {
    console.error('Failed to create report:', error.response.data.detail);
  }
};
```

### Python/Requests

**Login:**
```python
import requests

def login(email, password, role):
    response = requests.post(
        'http://localhost:8000/auth/login',
        json={
            'email': email,
            'password': password,
            'role': role
        }
    )
    
    if response.status_code == 200:
        data = response.json()
        return data['token']
    else:
        print(f"Login failed: {response.json()['detail']}")
        return None
```

**Get All Reports:**
```python
def get_all_reports(token):
    headers = {'Authorization': f'Bearer {token}'}
    response = requests.get(
        'http://localhost:8000/reports/all',
        headers=headers
    )
    
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Failed: {response.json()['detail']}")
        return []
```

---

## 🧪 Testing with cURL

**Register:**
```bash
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "user"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "role": "user"
  }'
```

**Create Report:**
```bash
curl -X POST http://localhost:8000/reports/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "location=123 Main St" \
  -F "description=Waste pile on sidewalk" \
  -F "image=@/path/to/image.jpg"
```

**Get Statistics:**
```bash
curl -X GET http://localhost:8000/reports/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📖 Interactive API Documentation

FastAPI provides interactive API documentation at:

- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

These interfaces allow you to:
- View all endpoints
- See request/response schemas
- Test endpoints directly in the browser
- Authenticate with JWT tokens

---

## 🔄 WebSocket Support (Future Enhancement)

Real-time updates are planned for future versions using WebSocket connections for:
- Live report status updates
- Real-time notifications
- Admin dashboard live updates

---

## 📝 Changelog

### Version 1.0.0 (Current)
- Initial API release
- User authentication with JWT
- Report management (CRUD operations)
- User profile management
- Admin dashboard endpoints
- Statistics and analytics
- Rate limiting
- Security headers
- File upload support

---

## 💬 Support

For API support or bug reports:
- Check the interactive docs at `/docs`
- Review error logs for detailed error messages
- Ensure all required fields are provided
- Verify authentication tokens are valid

---

Happy coding! 🚀
