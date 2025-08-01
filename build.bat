@echo off
echo Building frontend...
cd frontend
call npm run build
if %errorlevel% neq 0 (
    echo Build failed!
    pause
    exit /b 1
)
echo Frontend build completed successfully!
echo.
echo Your application is ready to run on one server.
echo Run: cd backend && npm start
pause 