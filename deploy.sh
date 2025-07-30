#!/bin/bash

# CustomWallApp Deployment Script
# Run this on your Ubuntu server

echo "🚀 Starting CustomWallApp Deployment..."

# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
echo "📦 Installing dependencies..."
sudo apt install -y nodejs npm mysql-server nginx

# Install PM2
sudo npm install -g pm2

# Create application directory
sudo mkdir -p /var/www/customwallapp
sudo chown $USER:$USER /var/www/customwallapp

# Copy application files
echo "📁 Copying application files..."
cp -r backend/* /var/www/customwallapp/backend/
cp -r frontend/* /var/www/customwallapp/frontend/
cp -r assets/* /var/www/customwallapp/frontend/

# Install backend dependencies
cd /var/www/customwallapp/backend
npm install --production

# Setup database
echo "🗄️ Setting up database..."
sudo mysql -e "CREATE DATABASE IF NOT EXISTS memorywall;"
sudo mysql -e "CREATE USER IF NOT EXISTS 'customwall'@'localhost' IDENTIFIED BY '${DB_PASSWORD:-your_secure_password}';"
sudo mysql -e "GRANT ALL PRIVILEGES ON memorywall.* TO 'customwall'@'localhost';"
sudo mysql -e "FLUSH PRIVILEGES;"

# Import database schema
mysql -u customwall -p memorywall < database/export_database.sql

# Create environment file
cat > /var/www/customwallapp/backend/.env << EOF
PORT=5000
JWT_SECRET=${JWT_SECRET:-your_very_secure_jwt_secret_key_here}
DB_HOST=localhost
DB_USER=customwall
DB_PASSWORD=${DB_PASSWORD:-your_secure_password}
DB_NAME=memorywall
EMAIL_USER=${EMAIL_USER:-your_email@gmail.com}
EMAIL_PASS=${EMAIL_PASS:-your_email_app_password}
NODE_ENV=production
EOF

# Start backend with PM2
cd /var/www/customwallapp/backend
pm2 start Server.js --name "customwall-backend"
pm2 save
pm2 startup

# Configure Nginx
sudo tee /etc/nginx/sites-available/customwallapp > /dev/null << EOF
server {
    listen 80;
    server_name ${DOMAIN:-your-domain.com} www.${DOMAIN:-your-domain.com};
    
    # Frontend
    location / {
        root /var/www/customwallapp/frontend;
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

# Enable site
sudo ln -s /etc/nginx/sites-available/customwallapp /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

echo "✅ Deployment completed!"
echo "🌐 Your app should be available at: http://${DOMAIN:-your-domain.com}"
echo "📊 Check PM2 status: pm2 status"
echo "📝 Check logs: pm2 logs customwall-backend"