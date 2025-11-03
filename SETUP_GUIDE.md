# WasteWise - Complete Setup Guide

## 🎯 Architecture Overview

Your project has been successfully converted to:

```
React (Frontend) → FastAPI (Backend) → MongoDB (Database)
```

## 📁 New Project Structure

```
wastewise/
├── frontend/          # React + Vite application
│   ├── src/
│   │   ├── pages/         # All page components
│   │   ├── contexts/      # Auth & Theme contexts
│   │   ├── lib/           # API client with Axios
│   │   └── main.jsx       # Entry point
│   └── package.json
│
├── backend/           # FastAPI application
│   ├── main.py            # All API endpoints
│   ├── requirements.txt   # Python dependencies
│   └── .env.example       # Environment template
│
└── SETUP_GUIDE.md     # This file
```

## 🚀 Step-by-Step Setup

### Step 1: Install MongoDB

**Option A: Local MongoDB**
```bash
# macOS
brew install mongodb-community
brew services start mongodb-community

# Ubuntu/Debian
sudo apt install mongodb
sudo systemctl start mongodb

# Windows
# Download installer from mongodb.com
```

**Option B: MongoDB Atlas (Cloud - Recommended)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create FREE account
3. Create a cluster (FREE tier)
4. Click "Connect" → "Connect your application"
5. Copy connection string
6. Replace `<password>` with your database password

### Step 2: Setup Backend

```bash
# Navigate to backend folder
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env

# Edit .env file:
nano .env  # or use any text editor
```

**In .env, set:**
```env
# For local MongoDB:
MONGODB_URL=mongodb://localhost:27017

# OR for MongoDB Atlas:
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/

SECRET_KEY=my-super-secret-jwt-key-change-this
DATABASE_NAME=wastewise_db
```

**Start the backend:**
```bash
python main.py
```

✅ Backend running at: **http://localhost:8000**
✅ API Docs available at: **http://localhost:8000/docs**

### Step 3: Setup Frontend

**Open a NEW terminal window:**

```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env (should already be correct):
echo "VITE_API_URL=http://localhost:8000" > .env

# Start development server
npm run dev
```

✅ Frontend running at: **http://localhost:5173**

## ✅ Verification Steps

### 1. Test Backend API

Visit: **http://localhost:8000/docs**

Try the interactive API:
1. Expand `POST /auth/register`
2. Click "Try it out"
3. Enter test data:
```json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123",
  "role": "user"
}
```
4. Click "Execute"
5. You should see a 200 response with a JWT token

### 2. Test Frontend

1. Open: **http://localhost:5173**
2. Click "Get Started" or "Sign Up"
3. Register a new account
4. Login successfully
5. See the dashboard

### 3. Verify MongoDB Connection

```bash
# Connect to MongoDB shell
mongosh

# Switch to database
use wastewise_db

# Check if users were created
db.users.find()

# You should see registered users
```

## 🎯 Testing the Full Stack

### Complete User Flow Test:

1. **Register a User**
   - Go to http://localhost:5173/register
   - Fill in the form
   - Submit

2. **Verify Database**
   ```bash
   mongosh
   use wastewise_db
   db.users.find().pretty()
   ```

3. **Login**
   - Go to http://localhost:5173/login
   - Enter credentials
   - Should redirect to dashboard

4. **Create a Report** (to be implemented - placeholder exists)
   - From user dashboard
   - Fill report details
   - Submit

5. **Admin Access**
   - Register an admin account (role: admin)
   - Login as admin
   - View all reports at `/admin/dashboard`

## 🔍 Connection Flow Diagram

```
User Action (Browser)
      ↓
React App (localhost:5173)
      ↓
Axios HTTP Request
      ↓
FastAPI Backend (localhost:8000)
      ↓
Motor (Async MongoDB Driver)
      ↓
MongoDB Database (localhost:27017 or Atlas)
      ↓
Response back through the chain
```

## 🔧 Common Issues & Solutions

### Issue: "Cannot connect to MongoDB"

**Solution:**
```bash
# Check if MongoDB is running
mongosh

# If not, start it:
# macOS:
brew services start mongodb-community

# Linux:
sudo systemctl start mongodb

# Windows:
# Start MongoDB service from Services panel
```

### Issue: "CORS error" in browser

**Solution:** Already configured in `backend/main.py`
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Issue: "Module not found" errors

**Backend:**
```bash
cd backend
pip install -r requirements.txt
```

**Frontend:**
```bash
cd frontend
rm -rf node_modules
npm install
```

### Issue: Port already in use

**Backend (change port 8000 to 8001):**
```python
# In backend/main.py, change:
uvicorn.run(app, host="0.0.0.0", port=8001)

# Don't forget to update frontend .env:
VITE_API_URL=http://localhost:8001
```

**Frontend (change port 5173 to 3000):**
```bash
# Run with custom port:
npm run dev -- --port 3000
```

## 📊 What's Implemented

### ✅ Backend (FastAPI)
- User & Admin registration
- JWT authentication
- Report creation (with image upload)
- Get user reports
- Get all reports (admin)
- Update report status (admin)
- Report statistics
- MongoDB integration with Motor
- Password hashing with bcrypt
- CORS configuration

### ✅ Frontend (React)
- Landing page
- Login page with role selection
- Register page with role selection
- User dashboard (view reports)
- User profile page
- Admin dashboard (view all reports)
- Admin reports management
- Admin analytics
- Protected routes
- JWT token management
- Dark mode support
- Toast notifications
- Responsive design

### 🔜 To Be Enhanced
- Image upload functionality in frontend
- Real-time updates with WebSockets
- Map view with Leaflet
- Email notifications
- Advanced analytics charts
- User role management
- Report filtering and search

## 🎨 Customization

### Add a New API Endpoint

**Backend (main.py):**
```python
@app.get("/api/my-endpoint")
async def my_endpoint(current_user: dict = Depends(get_current_user)):
    return {"message": "Hello from custom endpoint"}
```

### Add a New Frontend Page

**1. Create page (src/pages/MyPage.jsx):**
```jsx
export default function MyPage() {
  return <div>My New Page</div>
}
```

**2. Add route (src/App.jsx):**
```jsx
import MyPage from './pages/MyPage'

// In Routes:
<Route path="/my-page" element={<MyPage />} />
```

**3. Add API call (src/lib/api.js):**
```javascript
export const myAPI = {
  getData: async () => {
    const response = await api.get('/api/my-endpoint');
    return response.data;
  }
}
```

## 🚀 Next Steps

1. ✅ Verify both backend and frontend are running
2. ✅ Test registration and login flows
3. ✅ Verify MongoDB connection
4. 📝 Customize pages as needed
5. 🎨 Add additional features
6. 🧪 Test thoroughly
7. 🚢 Deploy to production

## 📞 Need Help?

1. **Backend API docs:** http://localhost:8000/docs
2. **Check logs:** Terminal running backend/frontend
3. **MongoDB data:** Use `mongosh` and `db.collection.find()`
4. **Browser console:** F12 → Console tab for frontend errors

## 🎉 Success Indicators

You've successfully set up the project when:

- ✅ Backend responds at http://localhost:8000
- ✅ Frontend loads at http://localhost:5173
- ✅ Can register a new user
- ✅ Can login successfully
- ✅ MongoDB shows user data: `db.users.find()`
- ✅ Dashboard displays after login
- ✅ No errors in terminal or browser console

---

**Congratulations! Your WasteWise app is now running with React → FastAPI → MongoDB architecture! 🎊**
