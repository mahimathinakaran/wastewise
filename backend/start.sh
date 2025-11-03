#!/bin/bash

# Production startup script for WasteWise Backend

echo "🚀 Starting WasteWise Backend in Production Mode..."

# Check if required environment variables are set
required_vars=("MONGODB_URL" "SECRET_KEY" "DATABASE_NAME")

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Error: $var environment variable is not set"
        exit 1
    fi
done

echo "✅ Environment variables verified"

# Create uploads directory if it doesn't exist
mkdir -p uploads
echo "✅ Uploads directory ready"

# Start the application with production settings
echo "🌐 Starting server on port ${PORT:-8000}..."

if [ "$ENVIRONMENT" = "production" ]; then
    # Use Gunicorn for production
    exec gunicorn main:app \
        --workers 4 \
        --worker-class uvicorn.workers.UvicornWorker \
        --bind 0.0.0.0:${PORT:-8000} \
        --access-logfile - \
        --error-logfile - \
        --log-level info
else
    # Use Uvicorn for development
    exec uvicorn main:app \
        --host 0.0.0.0 \
        --port ${PORT:-8000} \
        --log-level info
fi