# WasteWise Frontend-Backend Integration Guide

## 🎯 Overview

This guide explains how the Next.js frontend (in `src/`) connects with the FastAPI backend (in `backend/`).

## 🚀 Quick Start

### 1. Start the Backend (Terminal 1)

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

Backend will run at: **http://localhost:8000**
API Docs available at: **http://localhost:8000/docs**

### 2. Start the Frontend (Terminal 2)

```bash
npm install
npm run dev
```

Frontend will run at: **http://localhost:3000**

## 📁 Project Structure

```
wastewise/
├── backend/              # FastAPI Backend
│   ├── main.py          # API endpoints
│   ├── requirements.txt
│   └── uploads/         # Image storage
│
├── src/                 # Next.js Frontend
│   ├── app/            # Pages & routes
│   ├── components/     # React components
│   ├── lib/           # API client & utilities
│   │   ├── api-client.ts    # 🔗 Backend API client
│   │   ├── auth.ts          # Authentication functions
│   │   └── reports.ts       # Report functions
│   └── contexts/      # React contexts
│
├── .env.local         # Environment variables
└── package.json
```

## 🔗 Integration Points

### API Client (`src/lib/api-client.ts`)

Central API client that communicates with FastAPI backend:

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
```

**Features:**
- Automatic JWT token handling
- Error handling and parsing
- Type-safe request methods
- FormData support for file uploads

### Authentication Flow

1. **Register/Login** (`src/app/login/page.tsx`, `src/app/register/page.tsx`)
   - User submits credentials
   - `src/lib/auth.ts` calls `apiClient.login()` or `apiClient.register()`
   - Backend validates and returns JWT token + user data
   - Token stored in localStorage via `AuthContext`
   - User redirected to dashboard

2. **Protected Routes** (`src/components/DashboardLayout.tsx`)
   - Checks for stored auth token
   - Redirects to `/login` if not authenticated
   - Validates user role matches route requirements

### Report Management Flow

1. **Create Report** (`src/components/ReportModal.tsx`)
   - User uploads image and fills form
   - `createReport()` sends FormData to backend
   - Backend stores image in `uploads/` folder
   - Report saved to MongoDB with image URL

2. **View Reports** (`src/app/user/dashboard/page.tsx`)
   - Fetches user reports via `getUserReports()`
   - Backend filters by user ID
   - Displays with status badges and admin comments

3. **Admin Management** (`src/app/admin/dashboard/page.tsx`)
   - Fetches all reports via `getAllReports()`
   - Admin can update status and add comments
   - Changes reflect in real-time for users

## 🔐 Authentication

### JWT Token Storage

```typescript
// Store token after login
localStorage.setItem('auth_token', token);
localStorage.setItem('auth_user', JSON.stringify(user));

// Retrieve for API calls
const auth = getStoredAuth();
if (auth) {
  // Include in API requests
  headers: {
    Authorization: `Bearer ${auth.token}`
  }
}
```

### Protected API Endpoints

All report endpoints require authentication:
- `GET /reports/user/:userId` - User's reports
- `GET /reports/all` - All reports (admin only)
- `POST /reports/create` - Create new report
- `PUT /reports/update/:reportId` - Update report (admin only)
- `GET /reports/stats` - Report statistics

## 📡 API Endpoints

### Authentication

| Endpoint | Method | Description | Body |
|----------|--------|-------------|------|
| `/auth/register` | POST | Register new user | `{ name, email, password, role }` |
| `/auth/login` | POST | Login user | `{ email, password, role }` |

### Reports

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/reports/create` | POST | Create report | ✅ User |
| `/reports/user/:userId` | GET | Get user reports | ✅ User |
| `/reports/all` | GET | Get all reports | ✅ Admin |
| `/reports/update/:reportId` | PUT | Update report status | ✅ Admin |
| `/reports/stats` | GET | Get statistics | ✅ User/Admin |

## 🛠️ Environment Configuration

Create `.env.local` file:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

For production, update to your deployed backend URL:

```bash
NEXT_PUBLIC_API_URL=https://api.yourapp.com
```

## 🧪 Testing the Integration

### 1. Test Homepage Buttons
- Click "Get Started" → Should navigate to `/register`
- Click "Sign In" → Should navigate to `/login`

### 2. Test Authentication
```bash
# Register as User
Email: user@example.com
Password: password123
Role: User

# Register as Admin
Email: admin@example.com
Password: password123
Role: Admin
```

### 3. Test Report Creation (User Dashboard)
1. Login as user
2. Click "Report Issue"
3. Upload image
4. Enter location and description
5. Submit and verify report appears

### 4. Test Admin Management
1. Login as admin
2. View all reports in table
3. Update report status
4. Add admin comment
5. Verify changes persist

## 🔍 Debugging

### Check Backend Status
```bash
curl http://localhost:8000/health
# Should return: {"status": "healthy", "database": "connected"}
```

### View API Logs
Backend logs appear in the terminal where `python main.py` is running.

### Check Frontend API Calls
Open browser DevTools → Network tab → Filter by "localhost:8000"

### Common Issues

1. **CORS Errors**
   - Ensure backend CORS is configured for `http://localhost:3000`
   - Check `backend/main.py` for CORS settings

2. **Auth Errors**
   - Clear localStorage: `localStorage.clear()`
   - Re-login to get fresh token

3. **File Upload Errors**
   - Check file size (max 10MB)
   - Verify `uploads/` directory exists in backend
   - Check file permissions

4. **Connection Refused**
   - Ensure backend is running: `curl http://localhost:8000/health`
   - Check `NEXT_PUBLIC_API_URL` in `.env.local`

## 📝 Key Files

### Frontend Integration Files
- `src/lib/api-client.ts` - API client
- `src/lib/auth.ts` - Auth functions
- `src/lib/reports.ts` - Report functions
- `src/contexts/AuthContext.tsx` - Auth state management

### Backend Files
- `backend/main.py` - All API endpoints
- `backend/.env` - Database credentials

## 🎉 Success Checklist

- [ ] Backend running at http://localhost:8000
- [ ] Frontend running at http://localhost:3000
- [ ] MongoDB connected (check backend logs)
- [ ] Can register new users
- [ ] Can login with credentials
- [ ] Can create reports with image upload
- [ ] User can view their reports
- [ ] Admin can view all reports
- [ ] Admin can update report status
- [ ] Status changes persist after refresh

## 🚀 Production Deployment

### Backend Deployment
1. Deploy FastAPI to cloud service (Railway, Render, AWS)
2. Update MongoDB connection string for production
3. Set environment variables on hosting platform
4. Note the deployed backend URL

### Frontend Deployment
1. Update `.env.local` with production backend URL:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.com
   ```
2. Deploy to Vercel: `vercel deploy`
3. Set environment variables in Vercel dashboard

## 📞 Support

If you encounter issues:
1. Check backend logs for errors
2. Check browser console for frontend errors
3. Verify environment variables are set correctly
4. Ensure MongoDB is running and accessible
