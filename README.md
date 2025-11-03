# WasteWise - Smart Waste Management Platform

A full-stack web application for waste management and issue reporting with role-based access control.

![WasteWise](https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=1200&h=400&fit=crop)

## 🌟 Overview

WasteWise is a modern waste management platform that connects citizens with administrators to efficiently report, track, and resolve waste-related issues in their communities.

### Key Features

- 🔐 **Role-Based Authentication** - Separate interfaces for Users and Admins
- 📍 **GPS Location Tracking** - Auto-detect issue locations with geolocation
- 📸 **Image Upload** - Visual documentation of waste issues
- 📊 **Real-Time Analytics** - Comprehensive charts and statistics
- 🗺️ **Interactive Map View** - Visualize all reports on a map using Leaflet.js
- 🔔 **Status Notifications** - Toast notifications for user actions
- 🌓 **Dark Mode** - Full dark mode support
- 📱 **Responsive Design** - Works seamlessly on all devices

## 🚀 Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS v4** - Modern styling
- **Shadcn/UI** - Beautiful UI components
- **Recharts** - Data visualization
- **Leaflet.js** - Interactive maps
- **React Leaflet** - React wrapper for Leaflet
- **Sonner** - Toast notifications
- **date-fns** - Date formatting

### State Management
- **React Context API** - For authentication and theme management
- **Local Storage** - JWT token persistence

### Mock Backend
- Mock authentication system with JWT tokens
- In-memory report storage with CRUD operations
- Simulated API delays for realistic UX

## 🔧 Installation & Setup

1. **Install dependencies**
```bash
npm install
# or
bun install
```

2. **Run the development server**
```bash
npm run dev
# or
bun dev
```

3. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Usage Guide

### Getting Started

1. **Landing Page**
   - Visit the homepage to learn about WasteWise
   - Click "Get Started" to register or "Sign In" to login

2. **Registration**
   - Choose your role (User or Admin)
   - Fill in your details
   - Create an account

3. **Login**
   - Select your role
   - Enter credentials
   - Access your dashboard

### For Users

1. **Report an Issue**
   - Click "Report Issue" button
   - Upload an image of the waste issue
   - Add location (click "Auto-detect" or enter manually)
   - Describe the issue
   - Submit the report

2. **Track Reports**
   - View all your reports on the dashboard
   - Check status updates (Pending, In Progress, Completed)
   - Read admin comments
   - Filter by status or search by location

3. **Manage Profile**
   - Update your name and email
   - Change your password
   - View account statistics

### For Admins

1. **Dashboard Overview**
   - View total reports count
   - Monitor pending, in-progress, and completed reports
   - See all reports in a detailed table

2. **Manage Reports**
   - Click "Update" on any report
   - Change status (Pending → In Progress → Completed)
   - Add comments for users
   - Save changes

3. **Analytics**
   - View bar charts showing report distribution
   - See pie charts with status breakdown
   - Monitor completion rates
   - Track key metrics

4. **Map View**
   - View all reports on an interactive map
   - Click markers to see report details
   - Visualize geographic distribution of issues

## 🎨 Design Features

### Modern UI
- Gradient backgrounds inspired by saas22.com
- Glass-morphism effects
- Smooth animations and transitions
- Responsive grid layouts

### Color Scheme
- **Primary**: Green-Emerald gradient (#10B981 → #059669)
- **Status Colors**:
  - Pending: Yellow (#EAB308)
  - In Progress: Blue (#3B82F6)
  - Completed: Green (#10B981)

### Dark Mode
- Toggle between light and dark themes
- Persistent theme preference
- Optimized for readability in both modes

## 🔐 Authentication

The application uses a mock JWT-based authentication system:

- **Token Storage**: LocalStorage
- **Session Persistence**: Tokens persist across page refreshes
- **Role-Based Access**: Separate routes for users and admins
- **Protected Routes**: Automatic redirection if not authenticated

### Mock Credentials
Since this uses a mock backend, you can register with any email/password combination.

## 📊 Data Model

### Report Object
```typescript
{
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  image_url: string;
  location: string;
  latitude?: number;
  longitude?: number;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  admin_comment?: string;
  timestamp: Date;
}
```

### User Object
```typescript
{
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
}
```

## 🚀 Future Enhancements

### Backend Integration (Next Steps)

To connect to a real backend:

1. **Create FastAPI backend** (as per original requirements)
   - Implement POST /auth/register
   - Implement POST /auth/login
   - Implement POST /reports/create
   - Implement GET /reports/user/{user_id}
   - Implement GET /reports/all
   - Implement PUT /reports/update/{report_id}

2. **Setup MongoDB database**
   - Database name: wastewise_db
   - Collections: users, reports
   - Use environment variables for DB credentials

3. **Update API calls**
   - Replace mock functions in `src/lib/auth.ts` and `src/lib/reports.ts`
   - Add environment variables for API URL
   - Implement error handling for network requests

4. **File Upload**
   - Set up file upload endpoint
   - Store images in `/backend/uploads` or cloud storage
   - Return image URLs to frontend

## 📝 License

This project is open source and available under the MIT License.

## 💡 Acknowledgments

- Design inspiration from [saas22.com](https://www.saas22.com)
- UI components from [Shadcn/UI](https://ui.shadcn.com)
- Icons from [Lucide](https://lucide.dev)
- Maps powered by [Leaflet.js](https://leafletjs.com)

---

**Built with ❤️ using Next.js, TypeScript, and Tailwind CSS**