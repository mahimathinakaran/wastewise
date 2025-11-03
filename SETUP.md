# WasteWise - Setup Guide

## 🚀 Complete Setup Instructions

WasteWise is a full-stack waste management platform with React frontend, FastAPI backend, and MongoDB database.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **Python** (v3.9 or higher) - [Download here](https://python.org/)
- **MongoDB** (v5 or higher) - [Download here](https://www.mongodb.com/try/download/community)
- **Git** - [Download here](https://git-scm.com/)

## 🏗️ Project Structure

```
wastewise/
├── frontend/          # React + Vite application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── contexts/      # React contexts (Auth, Theme)
│   │   ├── lib/           # Utilities and API client
│   │   └── pages/         # Page components
│   ├── package.json
│   └── vite.config.js
│
├── backend/           # FastAPI application
│   ├── main.py           # Main FastAPI app
│   ├── requirements.txt  # Python dependencies
│   └── uploads/          # Image upload directory (auto-created)
│
├── src/              # Legacy Next.js files (can be ignored/removed)
└── README.md
```

## 🔧 Backend Setup (FastAPI)

### 1. Navigate to Backend Directory
```bash
cd backend
```

### 2. Create Virtual Environment
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables
Create a `.env` file in the `backend/` directory:

```env
# Database
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=wastewise_db

# Security
SECRET_KEY=your-super-secret-key-change-this-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# CORS (add your frontend URL)
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

**Important:** Change the `SECRET_KEY` to a random secure string in production!

### 5. Start MongoDB
```bash
# Windows
mongod

# macOS (with Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### 6. Start Backend Server
```bash
python main.py
```

The backend will be available at: **http://localhost:8000**

API Documentation: **http://localhost:8000/docs**

## 💻 Frontend Setup (React + Vite)

### 1. Navigate to Frontend Directory
```bash
cd frontend
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Configure Environment Variables
Create a `.env` file in the `frontend/` directory:

```env
VITE_API_URL=http://localhost:8000
```

### 4. Start Development Server
```bash
npm run dev
# or
yarn dev
```

The frontend will be available at: **http://localhost:5173**

## 🎯 Quick Start (Both Servers)

### Terminal 1 - Backend
```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
python main.py
```

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

### Terminal 3 - MongoDB (if not running as service)
```bash
mongod
```

## 👤 Creating Your First Account

1. Open **http://localhost:5173** in your browser
2. Click **"Get Started Free"** or **"Register"**
3. Fill in the registration form:
   - **Name:** Your full name
   - **Email:** Your email address
   - **Password:** Minimum 6 characters
   - **Role:** Select "user" or "admin"
4. Click **"Register"**
5. You'll be automatically logged in

### Default Test Accounts (Optional)

You can create these accounts for testing:

**User Account:**
- Email: user@example.com
- Password: password123
- Role: user

**Admin Account:**
- Email: admin@example.com
- Password: admin123
- Role: admin

## 🔍 Verify Installation

### Check Backend Health
```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2025-01-XX..."
}
```

### Check Frontend
Visit http://localhost:5173 - you should see the landing page

### Check MongoDB
```bash
mongosh
use wastewise_db
db.users.find()
```

## 📦 Database Collections

WasteWise uses two main MongoDB collections:

### 1. Users Collection
```javascript
{
  "_id": ObjectId,
  "name": String,
  "email": String (unique),
  "password": String (hashed),
  "role": String ("user" or "admin"),
  "created_at": Date
}
```

### 2. Reports Collection
```javascript
{
  "_id": ObjectId,
  "user_id": String,
  "user_name": String,
  "user_email": String,
  "image_url": String,
  "location": String,
  "description": String,
  "status": String ("pending", "in_progress", "completed"),
  "admin_comment": String,
  "timestamp": Date
}
```

## 🐛 Troubleshooting

### Backend Issues

**Error: "ModuleNotFoundError"**
```bash
# Reinstall dependencies
pip install -r requirements.txt
```

**Error: "Connection refused" (MongoDB)**
```bash
# Start MongoDB
mongod
# or
brew services start mongodb-community
```

**Error: "Port 8000 already in use"**
```bash
# Find and kill the process
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:8000 | xargs kill -9
```

### Frontend Issues

**Error: "EADDRINUSE: port 5173 already in use"**
```bash
# Kill the process
npx kill-port 5173
```

**Error: "Failed to fetch" when calling API**
- Check if backend is running on port 8000
- Verify VITE_API_URL in frontend/.env
- Check CORS settings in backend

**Error: npm install fails**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### MongoDB Issues

**Error: "Connection timeout"**
```bash
# Check if MongoDB is running
# Windows
tasklist | findstr mongod

# macOS/Linux
ps aux | grep mongod
```

**Database not found**
- MongoDB creates databases automatically on first use
- Just start the backend and it will create wastewise_db

## 🔐 Security Notes

1. **Change SECRET_KEY** in production
2. **Use environment variables** for sensitive data
3. **Enable MongoDB authentication** in production
4. **Use HTTPS** for production deployment
5. **Rate limiting** is enabled (check backend/main.py)

## 📱 Features Available

### User Features
- ✅ Register/Login with email and password
- ✅ Report waste issues with image upload
- ✅ Auto-detect location using GPS
- ✅ Track report status (pending, in progress, completed)
- ✅ View all personal reports
- ✅ Edit profile (name, email, password)
- ✅ Dark mode toggle

### Admin Features
- ✅ View all reports in table or map view
- ✅ Update report status
- ✅ Add comments to reports
- ✅ Filter reports by status
- ✅ Analytics dashboard with charts
- ✅ Interactive map with Leaflet
- ✅ Comprehensive statistics

## 🎨 Technology Stack

### Frontend
- React 18
- Vite (build tool)
- React Router (routing)
- Axios (HTTP client)
- Tailwind CSS (styling)
- Recharts (analytics charts)
- Leaflet (maps)
- Lucide React (icons)
- Sonner (toast notifications)

### Backend
- FastAPI (web framework)
- Motor (async MongoDB driver)
- Passlib (password hashing)
- PyJWT (JWT authentication)
- SlowAPI (rate limiting)
- Python Multipart (file uploads)

### Database
- MongoDB (NoSQL database)

## 📚 Next Steps

1. Read [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment
2. Check [API.md](./API.md) for API documentation
3. Explore the code in `frontend/src/` and `backend/`
4. Test all features as both user and admin

## 💡 Tips

- Use **Postman** or **Thunder Client** to test API endpoints
- Check **http://localhost:8000/docs** for interactive API documentation
- Use **MongoDB Compass** for database visualization
- Enable browser DevTools to debug frontend issues

## 🆘 Need Help?

- Check the API documentation at http://localhost:8000/docs
- Review error logs in terminal
- Verify all environment variables are set
- Ensure all services (MongoDB, Backend, Frontend) are running

## 📄 License

This project is open source and available under the MIT License.

---

Happy coding! 🎉
