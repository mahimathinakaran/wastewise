# WasteWise Backend (FastAPI)

This is the backend API for WasteWise, built with FastAPI and MongoDB.

## Setup Instructions

### 1. Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Set Up MongoDB

Make sure you have MongoDB installed and running locally on `mongodb://localhost:27017`

Or use MongoDB Atlas (cloud):
1. Create a free account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get your connection string
4. Update `.env` file with your connection string

### 3. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and set your values:
- `MONGODB_URL`: Your MongoDB connection string
- `SECRET_KEY`: A secure random string for JWT tokens
- `DATABASE_NAME`: wastewise_db (or your preferred name)

### 4. Run the API Server

```bash
python main.py
```

Or using uvicorn directly:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at: `http://localhost:8000`

API documentation: `http://localhost:8000/docs` (Swagger UI)

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user or admin
- `POST /auth/login` - Login and get JWT token

### Reports
- `POST /reports/create` - Create new waste report (requires auth)
- `GET /reports/user/{user_id}` - Get reports for specific user (requires auth)
- `GET /reports/all` - Get all reports (admin only)
- `PUT /reports/update/{report_id}` - Update report status/comment (admin only)
- `GET /reports/stats` - Get report statistics (requires auth)

## Project Structure

```
backend/
├── main.py              # Main FastAPI application
├── requirements.txt     # Python dependencies
├── .env.example         # Environment variables template
├── uploads/             # Uploaded images directory (auto-created)
└── README.md           # This file
```

## Testing the API

Use the interactive docs at `http://localhost:8000/docs` or use curl/Postman:

```bash
# Register a user
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123","role":"user"}'

# Login
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123","role":"user"}'
```
