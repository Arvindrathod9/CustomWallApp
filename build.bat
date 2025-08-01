@echo off
echo ========================================
echo Building CustomWallApp for Production
echo ========================================

echo.
echo Step 1: Building frontend...
cd frontend
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Frontend build failed!
    pause
    exit /b 1
)
echo ✅ Frontend build completed successfully!

echo.
echo Step 2: Installing backend dependencies...
cd ..\backend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Backend dependencies installation failed!
    pause
    exit /b 1
)
echo ✅ Backend dependencies installed successfully!

echo.
echo Step 3: Starting the server...
echo 🚀 Your application is now running on: http://localhost:5000
echo.
echo Press Ctrl+C to stop the server
echo ========================================
call npm start 