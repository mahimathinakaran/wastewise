"""
Seed admin user to MongoDB
Run this script once to create the default admin account
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from datetime import datetime
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# MongoDB Configuration
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "wastewise_db")

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def seed_admin():
    """Create default admin user"""
    try:
        # Connect to MongoDB
        client = AsyncIOMotorClient(MONGODB_URL)
        db = client[DATABASE_NAME]
        users_collection = db["users"]
        
        # Check if admin exists
        existing_admin = await users_collection.find_one({"email": "admin@wastewise.com"})
        
        if existing_admin:
            print("❌ Admin user already exists!")
            return
        
        # Create admin user
        admin = {
            "name": "Admin",
            "email": "admin@wastewise.com",
            "password": pwd_context.hash("admin123"),
            "role": "admin",
            "created_at": datetime.utcnow()
        }
        
        result = await users_collection.insert_one(admin)
        print("✅ Admin user created successfully!")
        print(f"   Email: admin@wastewise.com")
        print(f"   Password: admin123")
        print(f"   ID: {result.inserted_id}")
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
    finally:
        client.close()

if __name__ == "__main__":
    print("🔧 Seeding admin user...")
    asyncio.run(seed_admin())
