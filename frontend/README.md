# WasteWise Frontend (React + Vite)

This is the frontend application for WasteWise, built with React, Vite, React Router, and Tailwind CSS.

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend API running on `http://localhost:8000`

## Setup Instructions

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and set:
```
VITE_API_URL=http://localhost:8000
```

### 3. Run Development Server

```bash
npm run dev
```

The app will be available at: `http://localhost:5173`

## Project Structure

```
frontend/
├── src/
│   ├── pages/           # Page components
│   │   ├── LandingPage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── UserDashboard.jsx
│   │   ├── UserReports.jsx
│   │   ├── UserProfile.jsx
│   │   ├── AdminDashboard.jsx
│   │   ├── AdminReports.jsx
│   │   └── AdminAnalytics.jsx
│   ├── contexts/        # React contexts
│   │   ├── AuthContext.jsx
│   │   └── ThemeContext.jsx
│   ├── lib/             # Utilities
│   │   └── api.js       # Axios API client
│   ├── App.jsx          # Main app component with routing
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles
├── index.html
├── vite.config.js       # Vite configuration
├── tailwind.config.js   # Tailwind configuration
├── postcss.config.js    # PostCSS configuration
└── package.json
```

## Available Routes

### Public Routes
- `/` - Landing page
- `/login` - Login page
- `/register` - Register page

### User Routes (protected)
- `/user/dashboard` - User dashboard
- `/user/reports` - User reports list
- `/user/profile` - User profile settings

### Admin Routes (protected)
- `/admin/dashboard` - Admin dashboard with all reports
- `/admin/reports` - Manage all reports
- `/admin/analytics` - View analytics and statistics

## Features Implemented

- ✅ User & Admin authentication with JWT
- ✅ Protected routes with role-based access
- ✅ Landing page with hero and features
- ✅ User dashboard with reports
- ✅ Admin dashboard with all reports management
- ✅ Admin analytics with statistics
- ✅ Dark mode support
- ✅ Toast notifications
- ✅ Responsive design
- ✅ Tailwind CSS styling

## API Integration

The frontend communicates with the FastAPI backend through Axios. All API calls are centralized in `src/lib/api.js`.

### Authentication
- `authAPI.register(data)` - Register new user
- `authAPI.login(data)` - Login user

### Reports
- `reportsAPI.create(formData)` - Create new report
- `reportsAPI.getUserReports(userId)` - Get user reports
- `reportsAPI.getAllReports()` - Get all reports (admin)
- `reportsAPI.updateReport(id, data)` - Update report status (admin)
- `reportsAPI.getStats()` - Get report statistics

## Building for Production

```bash
npm run build
```

The build output will be in the `dist/` directory.

## Preview Production Build

```bash
npm run preview
```
