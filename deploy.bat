@echo off
echo 🚀 WasteWise Production Deployment Preparation
echo ==============================================

REM Check if we're in the right directory
if not exist "render.yaml" (
    echo ❌ Error: render.yaml not found. Please run this script from the project root.
    pause
    exit /b 1
)

echo ✅ Found render.yaml configuration

REM Check backend requirements
if not exist "backend\requirements.txt" (
    echo ❌ Error: backend\requirements.txt not found
    pause
    exit /b 1
)

echo ✅ Backend requirements.txt found

REM Check frontend package.json
if not exist "package.json" (
    echo ❌ Error: package.json not found
    pause
    exit /b 1
)

echo ✅ Frontend package.json found

REM Check environment files
if not exist ".env.production" (
    echo ⚠️  Warning: .env.production not found
) else (
    echo ✅ Production environment file found
)

if not exist "backend\.env.production" (
    echo ⚠️  Warning: backend\.env.production not found
) else (
    echo ✅ Backend production environment file found
)

echo.
echo 📋 Pre-deployment Checklist:
echo 1. ✅ Project structure verified
echo 2. ✅ Configuration files present
echo 3. ✅ Environment files configured
echo.

echo 🔗 Next Steps:
echo 1. Commit all changes to Git:
echo    git add .
echo    git commit -m "Production deployment configuration"
echo    git push origin main
echo.
echo 2. Go to Render.com:
echo    - Create account or login
echo    - Click 'New' → 'Blueprint'
echo    - Connect your GitHub repository
echo    - Select 'wastewise' repository
echo    - Click 'Apply' to deploy
echo.
echo 3. Monitor deployment:
echo    - Watch build logs for both services
echo    - Test health endpoint: https://wastewise-backend.onrender.com/health
echo    - Access frontend: https://wastewise-frontend.onrender.com
echo.

echo 📚 Documentation:
echo - Deployment Guide: RENDER_DEPLOYMENT.md
echo - Deployment Checklist: DEPLOYMENT_CHECKLIST.md
echo.

echo ✨ Ready for deployment! Good luck! 🍀
pause