# WasteWise Render Deployment - Step by Step Guide

## Your Project Structure
✅ **Backend**: Located in `/backend` folder (Python/FastAPI)  
✅ **Frontend**: Located in root directory (Next.js app in `/src`)  
✅ **Database**: MongoDB Atlas (already configured)  

## Step-by-Step Deployment

### Step 1: Prepare Your Code
1. **Make sure all changes are committed and pushed to GitHub:**
   ```bash
   git add .
   git commit -m "Production ready for Render deployment"
   git push origin master
   ```

### Step 2: Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up or log in
3. Connect your GitHub account

### Step 3: Deploy Using Blueprint (Automatic - Recommended)

1. **Go to Render Dashboard**
   - Visit [dashboard.render.com](https://dashboard.render.com)
   - Click "New" → "Blueprint"

2. **Connect Repository**
   - Select "Connect GitHub"
   - Choose your repository: `mahimathinakaran/wastewise`
   - Grant necessary permissions

3. **Deploy Services**
   - Render will detect your `render.yaml` file
   - Click "Apply" to create both services:
     - `wastewise-backend` (Python API)
     - `wastewise` (Next.js Frontend)

4. **Monitor Deployment**
   - Watch the build logs for both services
   - Deployment typically takes 5-10 minutes

### Step 4: Verify Deployment

1. **Check Backend Health**
   - Visit: `https://wastewise-backend.onrender.com/health`
   - Should show: `{"status": "healthy", "database": "connected"}`

2. **Check Frontend**
   - Visit: `https://wastewise.onrender.com`
   - Should load your WasteWise application

### Step 5: Test Your Application

1. **Test Registration/Login**
   - Try creating a new user account
   - Test login functionality

2. **Test API Endpoints**
   - Check if frontend can communicate with backend
   - Test creating reports, viewing dashboard, etc.

## Alternative: Manual Deployment

If automatic deployment doesn't work, follow these steps:

### Backend Service (Manual)

1. **Create Web Service**
   - Click "New" → "Web Service"
   - Connect GitHub repository
   - Configure:
     ```
     Name: wastewise-backend
     Environment: Python 3
     Build Command: cd backend && pip install -r requirements.txt
     Start Command: cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT
     ```

2. **Add Environment Variables**
   ```
   MONGODB_URL=mongodb+srv://wastewise_user:wastewise_user123@cluster0.wcjs6gg.mongodb.net/wastewise_db?retryWrites=true&w=majority&appName=Cluster0
   SECRET_KEY=[Auto-generated]
   DATABASE_NAME=wastewise_db
   ACCESS_TOKEN_EXPIRE_MINUTES=1440
   ALLOWED_ORIGINS=https://wastewise.onrender.com
   ENVIRONMENT=production
   DEBUG=False
   ```

### Frontend Service (Manual)

1. **Create Web Service**
   - Click "New" → "Web Service"
   - Connect GitHub repository
   - Configure:
     ```
     Name: wastewise
     Environment: Node
     Build Command: npm install && npm run build
     Start Command: npm start
     ```

2. **Add Environment Variables**
   ```
   NEXT_PUBLIC_API_URL=https://wastewise-backend.onrender.com
   NODE_ENV=production
   NEXTAUTH_URL=https://wastewise.onrender.com
   NEXTAUTH_SECRET=[Auto-generated]
   ```

## Your Service URLs

After deployment, your services will be available at:

- **Frontend (Main App)**: `https://wastewise.onrender.com`
- **Backend API**: `https://wastewise-backend.onrender.com`
- **API Documentation**: `https://wastewise-backend.onrender.com/docs`
- **Health Check**: `https://wastewise-backend.onrender.com/health`

## Important Notes

### Free Tier Limitations
- Services sleep after 15 minutes of inactivity
- First request after sleep takes ~30 seconds (cold start)
- 750 hours/month per service

### Default Admin Account
The system will create a default admin account:
- **Email**: `admin@wastewise.com`
- **Password**: `admin123`
- ⚠️ **Change this password immediately after first login!**

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check ALLOWED_ORIGINS in backend environment
   - Make sure it includes your frontend URL

2. **Database Connection Failed**
   - Verify MongoDB connection string
   - Check MongoDB Atlas IP whitelist (set to 0.0.0.0/0 for all IPs)

3. **Build Failures**
   - Check build logs in Render dashboard
   - Verify all dependencies are listed in requirements.txt/package.json

4. **Environment Variables**
   - Make sure all required variables are set
   - Use Render's auto-generate feature for secrets

### Quick Fixes

1. **If backend fails to start:**
   ```bash
   # Check the start command includes the correct path
   cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT
   ```

2. **If frontend build fails:**
   ```bash
   # Make sure these scripts exist in package.json
   "build": "next build"
   "start": "next start"
   ```

3. **If CORS issues persist:**
   - Update ALLOWED_ORIGINS to include both HTTP and HTTPS
   - Add localhost for development testing

## Monitoring Your App

1. **Render Dashboard**
   - Monitor service health
   - View logs and metrics
   - Check deployment history

2. **MongoDB Atlas**
   - Monitor database connections
   - Check query performance
   - Review storage usage

## Next Steps After Deployment

1. **Security**: Change default admin password
2. **Domain**: Consider setting up a custom domain
3. **Monitoring**: Set up error tracking and monitoring
4. **Backup**: Configure database backups
5. **Scaling**: Monitor usage and upgrade plans as needed

## Support

If you encounter issues:
1. Check Render's build and runtime logs
2. Verify all environment variables are set correctly
3. Test endpoints individually
4. Check MongoDB Atlas connection and permissions

---

**Your deployment is ready! 🚀**

Visit `https://wastewise.onrender.com` to see your live WasteWise application!