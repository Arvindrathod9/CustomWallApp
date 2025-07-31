#!/bin/bash

# 🚀 CustomWallApp Application Setup Script
# Run this after uploading your application files

set -e  # Exit on any error

echo "🚀 Setting up CustomWallApp application..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if application directory exists
if [ ! -d "/var/www/customwallapp" ]; then
    print_error "Application directory not found. Please upload your files first."
    exit 1
fi

# Check if backend directory exists
if [ ! -d "/var/www/customwallapp/backend" ]; then
    print_error "Backend directory not found. Please upload your backend files."
    exit 1
fi

# Install backend dependencies
print_status "Installing backend dependencies..."
cd /var/www/customwallapp/backend
npm install --production

# Check if .env file exists
if [ ! -f "/var/www/customwallapp/backend/.env" ]; then
    print_warning "Backend .env file not found. Creating template..."
    cat > /var/www/customwallapp/backend/.env << EOF
PORT=5000
JWT_SECRET=your_very_secure_jwt_secret_key_here
DB_HOST=localhost
DB_USER=customwall
DB_PASSWORD=your_secure_password
DB_NAME=memorywall
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
NODE_ENV=production
EOF
    print_warning "Please edit /var/www/customwallapp/backend/.env with your actual values"
fi

# Check if frontend directory exists
if [ ! -d "/var/www/customwallapp/frontend" ]; then
    print_error "Frontend directory not found. Please upload your frontend build files."
    exit 1
fi

# Create frontend .env file
print_status "Creating frontend environment file..."
cat > /var/www/customwallapp/frontend/.env << EOF
REACT_APP_API_BASE_URL=http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)
EOF

print_warning "Frontend API URL set to EC2 public IP. Update this if you have a domain."

# Configure Nginx
print_status "Configuring Nginx..."
sudo tee /etc/nginx/sites-available/customwallapp > /dev/null << EOF
server {
    listen 80;
    server_name _;
    
    # Frontend
    location / {
        root /var/www/customwallapp/frontend/build;
        try_files \$uri \$uri/ /index.html;
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # Socket.IO
    location /socket.io/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Enable Nginx site
print_status "Enabling Nginx site..."
sudo ln -sf /etc/nginx/sites-available/customwallapp /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

# Start backend with PM2
print_status "Starting backend with PM2..."
cd /var/www/customwallapp/backend
pm2 start Server.js --name "customwall-backend"
pm2 save
pm2 startup

print_status "✅ Application setup completed!"
print_warning "Next steps:"
echo "1. Edit /var/www/customwallapp/backend/.env with your actual values"
echo "2. Import your database schema: mysql -u customwall -p memorywall < export_database.sql"
echo "3. Test your application at http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)"
echo ""
echo "Useful commands:"
echo "- Check backend status: pm2 status"
echo "- View backend logs: pm2 logs customwall-backend"
echo "- Restart backend: pm2 restart customwall-backend"
echo "- Check nginx status: sudo systemctl status nginx"
echo "- View nginx logs: sudo tail -f /var/log/nginx/error.log" 