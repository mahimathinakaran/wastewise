# WasteWise - Deployment Guide

## 🚀 Production Deployment Guide

This guide covers deploying WasteWise to production environments.

## 📋 Pre-Deployment Checklist

- [ ] All features tested locally
- [ ] Environment variables configured
- [ ] Database backup strategy in place
- [ ] SSL certificates obtained
- [ ] Domain name configured
- [ ] Error logging configured
- [ ] Rate limiting tested
- [ ] Security headers verified

## 🌐 Deployment Options

### Option 1: Traditional Server (VPS/Dedicated)
### Option 2: Cloud Platforms (AWS, Google Cloud, Azure)
### Option 3: Platform as a Service (Heroku, Render, Railway)
### Option 4: Containerized (Docker + Docker Compose)

---

## 🐳 Docker Deployment (Recommended)

### 1. Create Docker Files

**Frontend Dockerfile** (`frontend/Dockerfile`):
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**Frontend nginx.conf** (`frontend/nginx.conf`):
```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

**Backend Dockerfile** (`backend/Dockerfile`):
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN mkdir -p uploads

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Docker Compose** (`docker-compose.yml`):
```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:latest
    container_name: wastewise-mongo
    restart: always
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD}

  backend:
    build: ./backend
    container_name: wastewise-backend
    restart: always
    ports:
      - "8000:8000"
    depends_on:
      - mongodb
    environment:
      MONGODB_URL: mongodb://admin:${MONGO_PASSWORD}@mongodb:27017
      DATABASE_NAME: wastewise_db
      SECRET_KEY: ${SECRET_KEY}
      ALLOWED_ORIGINS: ${FRONTEND_URL}
    volumes:
      - ./backend/uploads:/app/uploads

  frontend:
    build: ./frontend
    container_name: wastewise-frontend
    restart: always
    ports:
      - "80:80"
    depends_on:
      - backend
    environment:
      VITE_API_URL: ${BACKEND_URL}

volumes:
  mongodb_data:
```

**Environment File** (`.env`):
```env
MONGO_PASSWORD=your-secure-mongo-password
SECRET_KEY=your-super-secret-production-key
FRONTEND_URL=https://yourdomain.com
BACKEND_URL=https://api.yourdomain.com
```

### 2. Deploy with Docker Compose
```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild after changes
docker-compose up -d --build
```

---

## ☁️ MongoDB Atlas (Cloud Database)

### 1. Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user
4. Whitelist your IP (or 0.0.0.0/0 for all IPs)

### 2. Get Connection String
```
mongodb+srv://username:password@cluster.mongodb.net/wastewise_db
```

### 3. Update Backend Environment
```env
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/wastewise_db
```

---

## 🖥️ VPS Deployment (Ubuntu)

### 1. Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y python3 python3-pip python3-venv nodejs npm nginx mongodb-org

# Install PM2 for process management
sudo npm install -g pm2
```

### 2. Clone Repository
```bash
cd /var/www
git clone https://github.com/yourusername/wastewise.git
cd wastewise
```

### 3. Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Create .env file
nano .env
# Add production environment variables

# Start with PM2
pm2 start "uvicorn main:app --host 0.0.0.0 --port 8000" --name wastewise-backend
pm2 save
pm2 startup
```

### 4. Frontend Setup
```bash
cd ../frontend
npm install
npm run build

# Copy build to nginx
sudo cp -r dist/* /var/www/html/
```

### 5. Nginx Configuration
```bash
sudo nano /etc/nginx/sites-available/wastewise
```

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend
    location / {
        root /var/www/html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Uploads
    location /uploads {
        proxy_pass http://localhost:8000/uploads;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/wastewise /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 6. SSL Certificate (Let's Encrypt)
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## 🚀 Platform as a Service (Render/Railway)

### Render.com

**Backend (Web Service):**
1. Connect GitHub repository
2. Select `backend` as root directory
3. Build Command: `pip install -r requirements.txt`
4. Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables:
   - `MONGODB_URL`
   - `SECRET_KEY`
   - `ALLOWED_ORIGINS`

**Frontend (Static Site):**
1. Connect GitHub repository
2. Select `frontend` as root directory
3. Build Command: `npm install && npm run build`
4. Publish Directory: `dist`
5. Add environment variable:
   - `VITE_API_URL` = your backend URL

### Railway.app

Similar process, but Railway auto-detects configuration from `Dockerfile`.

---

## 🔒 Production Security Checklist

### Backend Security
- [ ] Change `SECRET_KEY` to a strong random string
- [ ] Enable MongoDB authentication
- [ ] Use environment variables for all secrets
- [ ] Enable HTTPS only
- [ ] Configure proper CORS origins
- [ ] Enable rate limiting (already configured)
- [ ] Add request logging
- [ ] Validate all user inputs
- [ ] Set up error monitoring (Sentry, Rollbar)

### Frontend Security
- [ ] Remove console.logs
- [ ] Enable Content Security Policy
- [ ] Configure security headers
- [ ] Minify and bundle code
- [ ] Use environment variables
- [ ] Enable HTTPS
- [ ] Implement CSRF protection

### Database Security
- [ ] Enable MongoDB authentication
- [ ] Use strong passwords
- [ ] Restrict network access
- [ ] Enable encryption at rest
- [ ] Regular backups
- [ ] Monitor database performance

---

## 📊 Monitoring & Logging

### Backend Logging
The backend already has logging configured. For production, consider:

**Sentry Integration:**
```bash
pip install sentry-sdk
```

```python
import sentry_sdk

sentry_sdk.init(
    dsn="your-sentry-dsn",
    traces_sample_rate=1.0,
)
```

### Application Monitoring
- **Backend**: PM2, Supervisor, or systemd
- **Frontend**: Nginx access logs
- **Database**: MongoDB Atlas monitoring or Mongo Compass
- **Error Tracking**: Sentry, Rollbar, or LogRocket

---

## 🗄️ Database Backup

### MongoDB Backup Script
```bash
#!/bin/bash
# backup-mongodb.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/mongodb"

mkdir -p $BACKUP_DIR

mongodump --uri="mongodb://localhost:27017/wastewise_db" --out="$BACKUP_DIR/backup_$DATE"

# Keep only last 7 days
find $BACKUP_DIR -type d -mtime +7 -exec rm -rf {} \;

echo "Backup completed: $BACKUP_DIR/backup_$DATE"
```

### Automated Backup (Cron)
```bash
crontab -e

# Add this line for daily 2 AM backup
0 2 * * * /path/to/backup-mongodb.sh
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Deploy to server
      uses: appleboy/ssh-action@master
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.SSH_KEY }}
        script: |
          cd /var/www/wastewise
          git pull
          cd backend && source venv/bin/activate && pip install -r requirements.txt
          pm2 restart wastewise-backend
          cd ../frontend && npm install && npm run build
          sudo cp -r dist/* /var/www/html/
```

---

## 📈 Performance Optimization

### Backend
- Use `gunicorn` with multiple workers
- Enable response caching
- Optimize database queries with indexes
- Use connection pooling for MongoDB

### Frontend
- Enable gzip compression in nginx
- Use CDN for static assets
- Implement lazy loading
- Optimize images
- Enable browser caching

### Database
- Create indexes on frequently queried fields
- Use projection to limit returned fields
- Enable query profiling
- Monitor slow queries

---

## 🆘 Troubleshooting Production

### Check Service Status
```bash
# Backend
pm2 status
pm2 logs wastewise-backend

# Frontend
sudo nginx -t
sudo systemctl status nginx

# Database
sudo systemctl status mongod
```

### Common Issues

**502 Bad Gateway**
- Backend not running
- Wrong proxy_pass URL in nginx
- Firewall blocking port 8000

**CORS Errors**
- Check `ALLOWED_ORIGINS` in backend
- Verify frontend URL matches

**Database Connection Failed**
- Check MongoDB is running
- Verify connection string
- Check network access rules

---

## 📞 Support & Maintenance

### Regular Maintenance Tasks
- [ ] Update dependencies monthly
- [ ] Review error logs weekly
- [ ] Check disk space
- [ ] Monitor database size
- [ ] Review backup logs
- [ ] Update SSL certificates (automated with certbot)

### Update Procedure
```bash
# 1. Backup database
./backup-mongodb.sh

# 2. Pull latest code
git pull

# 3. Update backend
cd backend
source venv/bin/activate
pip install -r requirements.txt
pm2 restart wastewise-backend

# 4. Update frontend
cd ../frontend
npm install
npm run build
sudo cp -r dist/* /var/www/html/
```

---

## ✅ Post-Deployment Verification

1. **Backend Health Check**: https://api.yourdomain.com/health
2. **Frontend Access**: https://yourdomain.com
3. **Test User Registration**: Create new account
4. **Test Report Creation**: Upload report with image
5. **Test Admin Functions**: Login as admin, update status
6. **Check Analytics**: View dashboard charts
7. **Test Map View**: Verify Leaflet map loads
8. **Monitor Logs**: Check for errors

---

Congratulations! Your WasteWise application is now deployed to production! 🎉
