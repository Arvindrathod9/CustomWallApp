#!/bin/bash

echo "========================================"
echo "Building CustomWallApp for Render"
echo "========================================"

# Step 1: Build frontend
echo "Step 1: Building frontend..."
cd frontend
npm install
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed!"
    exit 1
fi
echo "✅ Frontend build completed successfully!"

# Step 2: Install backend dependencies
echo "Step 2: Installing backend dependencies..."
cd ../backend
npm install --production
if [ $? -ne 0 ]; then
    echo "❌ Backend dependencies installation failed!"
    exit 1
fi
echo "✅ Backend dependencies installed successfully!"

echo "========================================"
echo "✅ Build completed successfully!"
echo "🚀 Ready to start server with: npm start"
echo "========================================" 