from fastapi import FastAPI, HTTPException, Depends, status, UploadFile, File, Request, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List
from datetime import datetime, timedelta
from passlib.context import CryptContext
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from dotenv import load_dotenv
import jwt
import os
import logging
from bson import ObjectId
from pathlib import Path

# Load environment variables from .env file
load_dotenv()

# Environment configuration
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
DEBUG = os.getenv("DEBUG", "True").lower() == "true"
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")

# Configure logging
log_level = getattr(logging, LOG_LEVEL.upper(), logging.INFO)
logging.basicConfig(
    level=log_level,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Log environment info
logger.info(f"Starting WasteWise API in {ENVIRONMENT} mode")
logger.info(f"Debug mode: {DEBUG}")
logger.info(f"Log level: {LOG_LEVEL}")

# Rate limiting
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="WasteWise API",
    description="Waste management and issue reporting platform",
    version="1.0.0",
    debug=DEBUG,
    docs_url="/docs" if DEBUG else None,
    redoc_url="/redoc" if DEBUG else None
)

# Add rate limiting middleware
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

# Security Headers Middleware
@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Content-Security-Policy"] = "default-src 'self'"
    return response

# CORS Configuration
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB Configuration
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "wastewise_db")
client = AsyncIOMotorClient(MONGODB_URL)
db = client[DATABASE_NAME]

# Collections
users_collection = db["users"]
reports_collection = db["reports"]

# Create indexes for better query performance
async def create_indexes():
    await users_collection.create_index("email", unique=True)
    await reports_collection.create_index("user_id")
    await reports_collection.create_index("status")
    await reports_collection.create_index("timestamp")

# Security Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
if SECRET_KEY == "your-secret-key-change-in-production":
    logger.warning("⚠️  Using default SECRET_KEY! Change this in production!")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))  # 24 hours default
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# Upload directory
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Mount static files for image serving
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Pydantic Models with validation
class UserRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6)
    role: str = Field(default="user")

    @validator('role')
    def validate_role(cls, v):
        if v not in ['user', 'admin']:
            raise ValueError('Role must be either "user" or "admin"')
        return v

class UserLogin(BaseModel):
    email: EmailStr
    password: str
    role: str

    @validator('role')
    def validate_role(cls, v):
        if v not in ['user', 'admin']:
            raise ValueError('Role must be either "user" or "admin"')
        return v

class UserProfileUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    email: Optional[EmailStr] = None

class UserPasswordUpdate(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=6)

class Token(BaseModel):
    token: str
    user: dict

class ReportCreate(BaseModel):
    location: str = Field(..., min_length=3, max_length=200)
    description: str = Field(..., min_length=10, max_length=1000)

class ReportUpdate(BaseModel):
    status: Optional[str] = None
    admin_comment: Optional[str] = None

    @validator('status')
    def validate_status(cls, v):
        if v and v not in ['pending', 'in_progress', 'completed']:
            raise ValueError('Status must be "pending", "in_progress", or "completed"')
        return v

class ReportResponse(BaseModel):
    id: str = Field(alias="_id")
    user_id: str
    user_name: str
    user_email: str
    image_url: str
    location: str
    description: str
    status: str
    admin_comment: str
    timestamp: datetime

    class Config:
        populate_by_name = True

# Helper Functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials"
            )
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except jwt.JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )
    
    user = await users_collection.find_one({"email": email})
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user["_id"] = str(user["_id"])
    return user

# Startup event
@app.on_event("startup")
async def startup_event():
    logger.info("🚀 Starting WasteWise API...")
    await create_indexes()
    logger.info("✅ Database indexes created")
    logger.info(f"📊 Database: {DATABASE_NAME}")
    logger.info(f"🌐 CORS allowed origins: {ALLOWED_ORIGINS}")
    logger.info("🔒 Security headers enabled")
    logger.info("⏱️  Rate limiting enabled")

# Health check endpoint
@app.get("/health", tags=["Health"])
@limiter.limit("10/minute")
async def health_check(request: Request):
    try:
        # Check database connection
        await db.command("ping")
        return {
            "status": "healthy",
            "database": "connected",
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Service unhealthy"
        )

@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "WasteWise API is running",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.post("/auth/register", response_model=Token, status_code=status.HTTP_201_CREATED, tags=["Authentication"])
@limiter.limit("5/minute")
async def register(request: Request, user_data: UserRegister):
    """Register a new user or admin account"""
    try:
        # Check if user exists
        existing_user = await users_collection.find_one({"email": user_data.email})
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Create new user
        hashed_password = get_password_hash(user_data.password)
        user = {
            "name": user_data.name,
            "email": user_data.email,
            "password": hashed_password,
            "role": user_data.role,
            "created_at": datetime.utcnow()
        }
        
        result = await users_collection.insert_one(user)
        logger.info(f"✅ New {user_data.role} registered: {user_data.email}")
        
        # Generate token
        access_token = create_access_token(data={"sub": user_data.email})
        
        return {
            "token": access_token,
            "user": {
                "id": str(result.inserted_id),
                "name": user_data.name,
                "email": user_data.email,
                "role": user_data.role
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed"
        )

@app.post("/auth/login", response_model=Token, tags=["Authentication"])
@limiter.limit("10/minute")
async def login(request: Request, credentials: UserLogin):
    """Login with email and password"""
    try:
        # Find user
        user = await users_collection.find_one({"email": credentials.email})
        if not user or not verify_password(credentials.password, user["password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Check role
        if user["role"] != credentials.role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"This account is not registered as {credentials.role}"
            )
        
        # Generate token
        access_token = create_access_token(data={"sub": credentials.email})
        logger.info(f"✅ User logged in: {credentials.email} as {credentials.role}")
        
        return {
            "token": access_token,
            "user": {
                "id": str(user["_id"]),
                "name": user["name"],
                "email": user["email"],
                "role": user["role"]
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed"
        )

# User Profile Endpoints
@app.get("/user/profile", tags=["User Profile"])
async def get_user_profile(current_user: dict = Depends(get_current_user)):
    """Get current user profile"""
    try:
        return {
            "id": current_user["_id"],
            "name": current_user["name"],
            "email": current_user["email"],
            "role": current_user["role"],
            "created_at": current_user.get("created_at", "")
        }
    except Exception as e:
        logger.error(f"Error fetching profile: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch profile"
        )

@app.put("/user/profile", tags=["User Profile"])
@limiter.limit("10/minute")
async def update_user_profile(
    request: Request,
    profile_data: UserProfileUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update user profile (name and email)"""
    try:
        update_fields = {}
        
        if profile_data.name:
            update_fields["name"] = profile_data.name
        
        if profile_data.email:
            # Check if email is already in use by another user
            existing_user = await users_collection.find_one({
                "email": profile_data.email,
                "_id": {"$ne": ObjectId(current_user["_id"])}
            })
            if existing_user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already in use"
                )
            update_fields["email"] = profile_data.email
        
        if not update_fields:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No fields to update"
            )
        
        await users_collection.update_one(
            {"_id": ObjectId(current_user["_id"])},
            {"$set": update_fields}
        )
        
        # Get updated user
        updated_user = await users_collection.find_one({"_id": ObjectId(current_user["_id"])})
        
        logger.info(f"✅ Profile updated for user: {current_user['email']}")
        
        return {
            "message": "Profile updated successfully",
            "user": {
                "id": str(updated_user["_id"]),
                "name": updated_user["name"],
                "email": updated_user["email"],
                "role": updated_user["role"]
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating profile: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update profile"
        )

@app.put("/user/password", tags=["User Profile"])
@limiter.limit("5/minute")
async def update_user_password(
    request: Request,
    password_data: UserPasswordUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update user password"""
    try:
        # Verify current password
        user = await users_collection.find_one({"_id": ObjectId(current_user["_id"])})
        if not verify_password(password_data.current_password, user["password"]):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect"
            )
        
        # Hash new password
        new_hashed_password = get_password_hash(password_data.new_password)
        
        # Update password
        await users_collection.update_one(
            {"_id": ObjectId(current_user["_id"])},
            {"$set": {"password": new_hashed_password}}
        )
        
        logger.info(f"✅ Password updated for user: {current_user['email']}")
        
        return {"message": "Password updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating password: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update password"
        )

@app.post("/reports/create", status_code=status.HTTP_201_CREATED, tags=["Reports"])
@limiter.limit("20/minute")
async def create_report(
    request: Request,
    location: str = Form(..., min_length=3),
    description: str = Form(..., min_length=10),
    image: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """Create a new waste report with image upload"""
    try:
        logger.info(f"📝 Creating report - Location: {location}, Description length: {len(description)}, Image: {image.filename}")
        
        # Validate file type
        if not image.content_type.startswith('image/'):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded file must be an image"
            )
        
        # Validate file size (max 10MB)
        content = await image.read()
        if len(content) > 10 * 1024 * 1024:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Image size must be less than 10MB"
            )
        
        # Save uploaded image with unique filename
        file_extension = Path(image.filename).suffix
        image_filename = f"{datetime.utcnow().timestamp()}_{current_user['_id']}{file_extension}"
        image_path = os.path.join(UPLOAD_DIR, image_filename)
        
        with open(image_path, "wb") as f:
            f.write(content)
        
        # Create report
        report = {
            "user_id": current_user["_id"],
            "user_name": current_user["name"],
            "user_email": current_user["email"],
            "image_url": f"/uploads/{image_filename}",
            "location": location,
            "description": description,
            "status": "pending",
            "admin_comment": "",
            "timestamp": datetime.utcnow()
        }
        
        result = await reports_collection.insert_one(report)
        report["_id"] = str(result.inserted_id)
        
        logger.info(f"✅ New report created by {current_user['email']}")
        return report
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Report creation error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create report"
        )

@app.get("/reports/user/{user_id}", tags=["Reports"])
async def get_user_reports(user_id: str, current_user: dict = Depends(get_current_user)):
    """Get all reports for a specific user"""
    try:
        # Verify user can only access their own reports (unless admin)
        if current_user["_id"] != user_id and current_user["role"] != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access these reports"
            )
        
        reports = []
        async for report in reports_collection.find({"user_id": user_id}).sort("timestamp", -1):
            report["_id"] = str(report["_id"])
            reports.append(report)
        
        return reports
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching user reports: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch reports"
        )

@app.get("/reports/all", tags=["Reports"])
async def get_all_reports(current_user: dict = Depends(get_current_user)):
    """Get all reports (admin only)"""
    try:
        # Only admins can access all reports
        if current_user["role"] != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )
        
        reports = []
        async for report in reports_collection.find().sort("timestamp", -1):
            report["_id"] = str(report["_id"])
            reports.append(report)
        
        return reports
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching all reports: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch reports"
        )

@app.put("/reports/update/{report_id}", tags=["Reports"])
@limiter.limit("30/minute")
async def update_report(
    request: Request,
    report_id: str,
    update_data: ReportUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update report status or add admin comments (admin only)"""
    try:
        # Only admins can update reports
        if current_user["role"] != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )
        
        # Build update fields
        update_fields = {}
        if update_data.status:
            update_fields["status"] = update_data.status
        if update_data.admin_comment is not None:
            update_fields["admin_comment"] = update_data.admin_comment
        
        if not update_fields:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No fields to update"
            )
        
        # Validate ObjectId
        if not ObjectId.is_valid(report_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid report ID"
            )
        
        result = await reports_collection.update_one(
            {"_id": ObjectId(report_id)},
            {"$set": update_fields}
        )
        
        if result.matched_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Report not found"
            )
        
        # Get updated report
        updated_report = await reports_collection.find_one({"_id": ObjectId(report_id)})
        updated_report["_id"] = str(updated_report["_id"])
        
        logger.info(f"✅ Report {report_id} updated by admin {current_user['email']}")
        return updated_report
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating report: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update report"
        )

@app.get("/reports/stats", tags=["Reports"])
async def get_report_stats(current_user: dict = Depends(get_current_user)):
    """Get statistics about reports"""
    try:
        # Get counts for each status
        pending = await reports_collection.count_documents({"status": "pending"})
        in_progress = await reports_collection.count_documents({"status": "in_progress"})
        completed = await reports_collection.count_documents({"status": "completed"})
        
        # Get user-specific stats if not admin
        user_stats = {}
        if current_user["role"] == "user":
            user_pending = await reports_collection.count_documents({
                "user_id": current_user["_id"],
                "status": "pending"
            })
            user_in_progress = await reports_collection.count_documents({
                "user_id": current_user["_id"],
                "status": "in_progress"
            })
            user_completed = await reports_collection.count_documents({
                "user_id": current_user["_id"],
                "status": "completed"
            })
            user_stats = {
                "my_pending": user_pending,
                "my_in_progress": user_in_progress,
                "my_completed": user_completed,
                "my_total": user_pending + user_in_progress + user_completed
            }
        
        return {
            "pending": pending,
            "in_progress": in_progress,
            "completed": completed,
            "total": pending + in_progress + completed,
            **user_stats
        }
    except Exception as e:
        logger.error(f"Error fetching stats: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch statistics"
        )

# Health Check Endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint for deployment monitoring"""
    try:
        # Test database connection
        await db.list_collection_names()
        return {
            "status": "healthy",
            "environment": ENVIRONMENT,
            "timestamp": datetime.utcnow().isoformat(),
            "database": "connected"
        }
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return {
            "status": "unhealthy",
            "environment": ENVIRONMENT,
            "timestamp": datetime.utcnow().isoformat(),
            "database": "disconnected",
            "error": str(e)
        }

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "WasteWise API",
        "version": "1.0.0",
        "status": "running",
        "environment": ENVIRONMENT,
        "docs": "/docs" if DEBUG else "disabled in production"
    }

# Initialize database indexes on startup
@app.on_event("startup")
async def startup_event():
    """Initialize database indexes and perform startup tasks"""
    try:
        await create_indexes()
        logger.info("Database indexes created successfully")
        logger.info("WasteWise API startup completed successfully")
    except Exception as e:
        logger.error(f"Startup error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=port,
        log_level="info",
        access_log=True
    )