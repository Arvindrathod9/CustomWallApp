# Single Server Deployment Guide

## Overview
Your CustomWallApp now runs on a single server with the backend serving the frontend build.

## Quick Start

### 1. Build Frontend
```bash
# Run the build script
build.bat

# Or manually
cd frontend
npm run build
```

### 2. Start Server
```bash
cd backend
npm start
```

### 3. Access Application
Open your browser and go to:
```
http://localhost:5000
```

## Development Workflow

### When you make changes to frontend code:
1. **Build the frontend:**
   ```bash
   build.bat
   ```
   or
   ```bash
   cd frontend
   npm run build
   ```

2. **Restart the backend server:**
   ```bash
   cd backend
   npm start
   ```

### When you make changes to backend code:
1. **Restart the backend server:**
   ```bash
   cd backend
   npm start
   ```

## Server Configuration

### Backend (Server.js)
- **Port**: 5000 (configurable in .env)
- **Frontend**: Served from `../frontend/build`
- **API Routes**: `/api/*` and `/admin/*`
- **Static Files**: Walls and stickers served from build directory

### Frontend
- **Build Output**: `frontend/build/`
- **API Calls**: Relative to same server (no separate URL needed)
- **Routing**: Handled by React Router

## Environment Variables

### Backend (.env)
```
PORT=5000
JWT_SECRET=your_very_secure_jwt_secret_key_here
DB_HOST=memorywall-db.ctoqm40iysju.ap-south-1.rds.amazonaws.com
DB_USER=admin
DB_PASSWORD="#arvinD99"
DB_NAME=memorywall
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
NODE_ENV=production
```

## Deployment to Production

### 1. Build for Production
```bash
build.bat
```

### 2. Upload to Server
Upload the entire project to your server:
- `backend/` folder
- `frontend/build/` folder
- `.env` file

### 3. Install Dependencies
```bash
cd backend
npm install --production
```

### 4. Start Server
```bash
npm start
```

## Benefits of Single Server Setup

1. **Simplified Deployment**: Only one server to manage
2. **No CORS Issues**: Frontend and backend on same domain
3. **Better Performance**: No cross-origin requests
4. **Easier Configuration**: No need for separate frontend/backend URLs
5. **Cost Effective**: Only one server needed

## Troubleshooting

### Build Issues
- Make sure all frontend dependencies are installed: `cd frontend && npm install`
- Check for any JavaScript errors in the build process

### Server Issues
- Check if port 5000 is available
- Verify database connection
- Check server logs for errors

### Static File Issues
- Ensure `frontend/build/` directory exists
- Check file permissions on the build directory 