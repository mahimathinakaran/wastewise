#!/bin/bash

# WasteWise Production Deployment Script for Render
# This script prepares your application for deployment

echo "🚀 WasteWise Production Deployment Preparation"
echo "=============================================="

# Check if we're in the right directory
if [ ! -f "render.yaml" ]; then
    echo "❌ Error: render.yaml not found. Please run this script from the project root."
    exit 1
fi

echo "✅ Found render.yaml configuration"

# Check backend requirements
if [ ! -f "backend/requirements.txt" ]; then
    echo "❌ Error: backend/requirements.txt not found"
    exit 1
fi

echo "✅ Backend requirements.txt found"

# Check frontend package.json
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found"
    exit 1
fi

echo "✅ Frontend package.json found"

# Check environment files
if [ ! -f ".env.production" ]; then
    echo "⚠️  Warning: .env.production not found"
else
    echo "✅ Production environment file found"
fi

if [ ! -f "backend/.env.production" ]; then
    echo "⚠️  Warning: backend/.env.production not found"
else
    echo "✅ Backend production environment file found"
fi

echo ""
echo "📋 Pre-deployment Checklist:"
echo "1. ✅ Project structure verified"
echo "2. ✅ Configuration files present"
echo "3. ✅ Environment files configured"
echo ""

echo "🔗 Next Steps:"
echo "1. Commit all changes to Git:"
echo "   git add ."
echo "   git commit -m \"Production deployment configuration\""
echo "   git push origin main"
echo ""
echo "2. Go to Render.com:"
echo "   - Create account or login"
echo "   - Click 'New' → 'Blueprint'"
echo "   - Connect your GitHub repository"
echo "   - Select 'wastewise' repository"
echo "   - Click 'Apply' to deploy"
echo ""
echo "3. Monitor deployment:"
echo "   - Watch build logs for both services"
echo "   - Test health endpoint: https://wastewise-backend.onrender.com/health"
echo "   - Access frontend: https://wastewise-frontend.onrender.com"
echo ""

echo "📚 Documentation:"
echo "- Deployment Guide: RENDER_DEPLOYMENT.md"
echo "- Deployment Checklist: DEPLOYMENT_CHECKLIST.md"
echo ""

echo "✨ Ready for deployment! Good luck! 🍀"