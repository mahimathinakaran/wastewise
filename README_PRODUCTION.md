# 🌱 WasteWise Platform

A comprehensive waste management and environmental reporting platform that empowers communities to track, report, and manage waste-related issues effectively.

[![Deployment Status](https://img.shields.io/badge/deployment-ready-brightgreen)](https://render.com)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-latest-green)](https://fastapi.tiangolo.com/)

## 🚀 Features

### For Users
- 👤 **User Registration & Authentication** - Secure account creation and login
- 📱 **Waste Reporting** - Easy reporting with image uploads and location tracking
- 📊 **Personal Dashboard** - Track your reported issues and their status
- 👨‍💼 **Profile Management** - Update personal information and preferences
- 📈 **Report History** - View all your past reports and their current status

### For Administrators
- 🛠️ **Admin Dashboard** - Comprehensive management interface
- 📋 **Report Management** - Review, update, and manage all user reports
- 📊 **Analytics & Insights** - Data visualization and reporting statistics
- 💬 **Status Updates** - Add comments and update report statuses
- 🎯 **User Management** - Oversee user accounts and activities

### Technical Features
- 🔒 **JWT Authentication** - Secure token-based authentication
- 📤 **Image Upload** - Secure file handling with validation
- ⚡ **Rate Limiting** - API protection against abuse
- 🔍 **Search & Filter** - Advanced report filtering capabilities
- 📱 **Responsive Design** - Mobile-first, responsive interface
- 🛡️ **Security Headers** - Production-ready security configurations

## 🏗️ Tech Stack

### Frontend (Next.js)
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4.0
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React, Tabler Icons
- **Animations**: Framer Motion
- **Maps**: React Leaflet
- **Charts**: Recharts
- **Forms**: React Hook Form with Zod validation

### Backend (FastAPI)
- **Framework**: FastAPI with async/await
- **Database**: MongoDB with Motor (async driver)
- **Authentication**: JWT with bcrypt password hashing
- **File Upload**: Secure image handling with validation
- **API Documentation**: Auto-generated OpenAPI/Swagger
- **Rate Limiting**: SlowAPI for request throttling
- **CORS**: Configurable cross-origin resource sharing

### Infrastructure
- **Deployment**: Render.com (Backend & Frontend)
- **Database**: MongoDB Atlas (Cloud)
- **File Storage**: Local filesystem (upgradeable to cloud storage)
- **Monitoring**: Built-in health checks and logging

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Python** 3.11+ ([Download](https://python.org/))
- **MongoDB** ([Atlas](https://mongodb.com/atlas) recommended)
- **Git** ([Download](https://git-scm.com/))

### Installation

1. **Clone the repository**:
```bash
git clone https://github.com/mahimathinakaran/wastewise.git
cd wastewise
```

2. **Install frontend dependencies**:
```bash
npm install
```

3. **Install backend dependencies**:
```bash
cd backend
pip install -r requirements.txt
cd ..
```

4. **Set up environment variables**:
```bash
# Copy environment files
cp .env.example .env.local
cp backend/.env.example backend/.env
```

5. **Configure your environment variables**:
   - Update `.env.local` with your backend URL
   - Update `backend/.env` with your MongoDB connection string and secret key

### Running Locally

1. **Start the backend server**:
```bash
cd backend
python main.py
```

2. **Start the frontend server** (in a new terminal):
```bash
npm run dev
```

3. **Open your browser**:
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:8000
   - **API Docs**: http://localhost:8000/docs

## 🌐 Deployment

### Deploy to Render.com (Recommended)

We provide a comprehensive deployment guide for Render.com:

📖 **[Complete Deployment Guide](DEPLOYMENT_GUIDE.md)**

The guide includes:
- ✅ MongoDB Atlas setup
- ✅ Backend deployment configuration
- ✅ Frontend deployment configuration
- ✅ Environment variables setup
- ✅ Custom domain configuration
- ✅ Production security checklist
- ✅ Troubleshooting guide

## 📁 Project Structure

```
wastewise-full-stack-platform/
├── 📁 backend/                 # FastAPI backend
│   ├── main.py                 # Main application file
│   ├── requirements.txt        # Python dependencies
│   ├── Dockerfile             # Backend container config
│   └── uploads/               # File upload directory
├── 📁 frontend/               # Legacy React frontend (Vite)
├── 📁 src/                    # Next.js application
│   ├── 📁 app/                # App router pages
│   ├── 📁 components/         # React components
│   ├── 📁 lib/                # Utilities and API clients
│   └── 📁 contexts/           # React contexts
├── 📁 public/                 # Static assets
├── Dockerfile                 # Frontend container config
├── next.config.ts            # Next.js configuration
├── package.json              # Frontend dependencies
└── README.md                 # This file
```

## 🛠️ Development

### API Documentation

The backend automatically generates interactive API documentation:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Environment Variables

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

#### Backend (backend/.env)
```env
MONGODB_URL=mongodb://localhost:27017
SECRET_KEY=your-secret-key-change-in-production
DATABASE_NAME=wastewise_db
ACCESS_TOKEN_EXPIRE_MINUTES=1440
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### Available Scripts

#### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

#### Backend
```bash
python main.py       # Start development server
uvicorn main:app --reload  # Alternative dev command
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**
4. **Run tests**: Ensure all tests pass
5. **Commit your changes**: `git commit -m 'Add amazing feature'`
6. **Push to branch**: `git push origin feature/amazing-feature`
7. **Submit a Pull Request**

## 🛡️ Security

- 🔐 JWT-based authentication
- 🔒 Password hashing with bcrypt
- 🛡️ CORS protection
- 📝 Input validation and sanitization
- 🚦 Rate limiting on sensitive endpoints
- 🔍 Security headers in production

## 📊 Performance

- ⚡ Server-side rendering with Next.js
- 🗄️ Database indexing for fast queries
- 📱 Image optimization and compression
- 🔄 Async/await for non-blocking operations
- 📦 Code splitting and lazy loading

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [FastAPI](https://fastapi.tiangolo.com/) for the modern Python API framework
- [MongoDB](https://mongodb.com/) for the flexible NoSQL database
- [Render.com](https://render.com/) for reliable cloud hosting
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Deployment Guide](DEPLOYMENT_GUIDE.md)
2. Look through existing [Issues](https://github.com/mahimathinakaran/wastewise/issues)
3. Create a new issue with detailed information

---

**Made with ❤️ for a cleaner environment**