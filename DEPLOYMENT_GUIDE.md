# 🚀 Deploy WasteWise to Render.com - Step by Step Guide

This guide will walk you through deploying your WasteWise full-stack application to Render.com.

## 📋 Prerequisites

Before starting, ensure you have:

- ✅ A GitHub account with your WasteWise repository
- ✅ A Render.com account (free tier available)
- ✅ A MongoDB Atlas account (free tier available)
- ✅ All code committed and pushed to GitHub

## 🗄️ Step 1: Set Up MongoDB Atlas (Database)

1. **Create MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Sign up for a free account
   - Create a new project called "WasteWise"

2. **Create a Database Cluster**
   - Click "Build a Database"
   - Choose "M0 Sandbox" (Free tier)
   - Select your preferred cloud provider and region
   - Name your cluster "wastewise-cluster"

3. **Configure Database Access**
   - Go to "Database Access" in the left sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Username: `wastewise_user`
   - Generate a secure password and save it
   - Database User Privileges: "Read and write to any database"

4. **Configure Network Access**
   - Go to "Network Access" in the left sidebar
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Confirm

5. **Get Connection String**
   - Go to "Databases" in the left sidebar
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string (looks like: `mongodb+srv://wastewise_user:<password>@wastewise-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority`)
   - Replace `<password>` with your actual password
   - Add `/wastewise_db` before the `?` to specify the database name

## 🔧 Step 2: Deploy Backend (FastAPI) to Render

1. **Create New Web Service**
   - Log in to [Render.com](https://render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub account if not already connected
   - Select your `wastewise` repository

2. **Configure Backend Service**
   - **Name**: `wastewise-backend`
   - **Region**: Choose closest to your users (e.g., Oregon)
   - **Branch**: `master` (or `main`)
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

3. **Add Environment Variables**
   Click "Advanced" and add these environment variables:
   
   ```
   MONGODB_URL = mongodb+srv://wastewise_user:YOUR_PASSWORD@wastewise-cluster.xxxxx.mongodb.net/wastewise_db?retryWrites=true&w=majority
   SECRET_KEY = your-super-secure-secret-key-at-least-32-characters-long
   DATABASE_NAME = wastewise_db
   ACCESS_TOKEN_EXPIRE_MINUTES = 1440
   ALLOWED_ORIGINS = https://wastewise-frontend.onrender.com
   ```

   **Important Notes:**
   - Replace `YOUR_PASSWORD` with your MongoDB password
   - Replace `xxxxx` with your actual cluster URL
   - Generate a strong SECRET_KEY (use a password generator)
   - Update `ALLOWED_ORIGINS` with your frontend URL (you'll get this in the next step)

4. **Deploy Backend**
   - Click "Create Web Service"
   - Wait for deployment to complete (5-10 minutes)
   - Note your backend URL (e.g., `https://wastewise-backend.onrender.com`)

## 🌐 Step 3: Deploy Frontend (Next.js) to Render

1. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Select your `wastewise` repository again

2. **Configure Frontend Service**
   - **Name**: `wastewise-frontend`
   - **Region**: Same as backend
   - **Branch**: `master` (or `main`)
   - **Root Directory**: Leave empty (root directory)
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

3. **Add Environment Variables**
   ```
   NEXT_PUBLIC_API_URL = https://wastewise-backend.onrender.com
   ```
   
   **Important:** Replace with your actual backend URL from Step 2

4. **Deploy Frontend**
   - Click "Create Web Service"
   - Wait for deployment to complete (5-10 minutes)
   - Note your frontend URL (e.g., `https://wastewise-frontend.onrender.com`)

## 🔄 Step 4: Update CORS Settings

1. **Update Backend Environment Variables**
   - Go to your backend service in Render dashboard
   - Go to "Environment" tab
   - Update `ALLOWED_ORIGINS` to include your frontend URL:
   ```
   ALLOWED_ORIGINS = https://wastewise-frontend.onrender.com,http://localhost:3000
   ```
   - Save changes (this will trigger a redeploy)

## 🧪 Step 5: Test Your Deployment

1. **Test Backend Health**
   - Visit `https://your-backend-url.onrender.com/health`
   - Should return: `{"status": "healthy", "database": "connected", ...}`

2. **Test Frontend**
   - Visit `https://your-frontend-url.onrender.com`
   - Should load the WasteWise landing page

3. **Test Full Application**
   - Register a new user account
   - Login successfully
   - Create a test report with image upload
   - Check admin dashboard functionality

## 🎯 Step 6: Custom Domain (Optional)

1. **Add Custom Domain**
   - In Render dashboard, go to your frontend service
   - Go to "Settings" tab
   - Scroll to "Custom Domains"
   - Add your domain (e.g., `www.wastewise.com`)
   - Follow DNS configuration instructions

2. **Update Environment Variables**
   - Update `ALLOWED_ORIGINS` in backend to include your custom domain
   - Update any hardcoded URLs in your frontend

## 🔒 Production Security Checklist

- ✅ Strong SECRET_KEY (32+ characters)
- ✅ MongoDB credentials secured
- ✅ CORS properly configured
- ✅ HTTPS enabled (automatic on Render)
- ✅ Environment variables not hardcoded
- ✅ Database network access restricted
- ✅ Security headers enabled

## 🚨 Troubleshooting

### Backend Issues
- **502 Bad Gateway**: Check logs in Render dashboard, ensure `uvicorn` is running on `$PORT`
- **Database Connection**: Verify MongoDB URL and network access settings
- **Module Import Errors**: Check `requirements.txt` and build logs

### Frontend Issues
- **Build Failures**: Check Node.js version compatibility and package.json
- **API Connection**: Verify `NEXT_PUBLIC_API_URL` environment variable
- **CORS Errors**: Ensure backend `ALLOWED_ORIGINS` includes your frontend URL

### General Tips
- Check service logs in Render dashboard
- Test locally first with production environment variables
- Ensure all dependencies are listed in requirements.txt/package.json
- Monitor resource usage on free tier (limited hours per month)

## 📱 Final Testing Checklist

Test these features after deployment:

- [ ] User registration and login
- [ ] User profile management
- [ ] Image upload for reports
- [ ] Report creation and viewing
- [ ] Admin dashboard access
- [ ] Report status updates (admin)
- [ ] Statistics and analytics
- [ ] Responsive design on mobile
- [ ] API error handling
- [ ] Security headers (check with browser dev tools)

## 🎉 Congratulations!

Your WasteWise application is now live in production! 

- **Frontend URL**: `https://your-frontend-service.onrender.com`
- **Backend API**: `https://your-backend-service.onrender.com`
- **API Documentation**: `https://your-backend-service.onrender.com/docs`

## 📈 Next Steps

1. **Monitoring**: Set up monitoring and alerts
2. **Backup**: Configure database backups
3. **Analytics**: Add Google Analytics or similar
4. **Performance**: Monitor and optimize performance
5. **Updates**: Set up CI/CD for automatic deployments

## 💡 Tips for Free Tier Users

- Render free tier services sleep after 15 minutes of inactivity
- First request after sleep takes 30-60 seconds to wake up
- Consider upgrading to paid tier for production use
- Monitor usage to avoid hitting free tier limits

---

Need help? Check the Render documentation or create an issue in your repository.