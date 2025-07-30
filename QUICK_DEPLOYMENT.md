# ⚡ Quick Deployment Checklist

## **Pre-Deployment (5 minutes)**

### **1. Build Your Application**
```bash
# Build frontend
cd frontend
npm run build

# Test backend locally
cd ../backend
npm start
```

### **2. Create Deployment Package**
```bash
# Create deployment folder
mkdir customwallapp-deployment
cd customwallapp-deployment

# Copy files
cp -r ../backend ./backend
cp -r ../frontend/build ./frontend
cp -r ../frontend/public/stickers ./frontend/
cp -r ../frontend/public/walls ./frontend/
cp ../frontend/public/home.jpg ./frontend/
cp ../export_database.sql ./database.sql
```

## **Server Setup (10 minutes)**

### **3. Connect to Your Server**
```bash
# AWS EC2
ssh -i your-key.pem ubuntu@your-ec2-ip

# DigitalOcean
ssh root@your-droplet-ip
```

### **4. Run Quick Setup**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install -y nodejs npm mysql-server nginx

# Install PM2
sudo npm install -g pm2
```

## **Database Setup (5 minutes)**

### **5. Setup MySQL**
```bash
# Secure MySQL
sudo mysql_secure_installation

# Create database
sudo mysql -e "CREATE DATABASE IF NOT EXISTS memorywall;"
sudo mysql -e "CREATE USER IF NOT EXISTS 'customwall'@'localhost' IDENTIFIED BY 'your_password';"
sudo mysql -e "GRANT ALL PRIVILEGES ON memorywall.* TO 'customwall'@'localhost';"
sudo mysql -e "FLUSH PRIVILEGES;"

# Import schema
mysql -u customwall -p memorywall < database.sql
```

## **Application Deployment (10 minutes)**

### **6. Deploy Application**
```bash
# Create app directory
sudo mkdir -p /var/www/customwallapp
sudo chown $USER:$USER /var/www/customwallapp

# Copy files
cp -r backend/* /var/www/customwallapp/backend/
cp -r frontend/* /var/www/customwallapp/frontend/

# Install dependencies
cd /var/www/customwallapp/backend
npm install --production
```

### **7. Configure Environment**
```bash
# Create .env file
cat > /var/www/customwallapp/backend/.env << EOF
PORT=5000
JWT_SECRET=your_secure_jwt_secret_here
DB_HOST=localhost
DB_USER=customwall
DB_PASSWORD=your_password
DB_NAME=memorywall
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
NODE_ENV=production
EOF
```

### **8. Start Application**
```bash
# Start with PM2
cd /var/www/customwallapp/backend
pm2 start Server.js --name "customwall-backend"
pm2 save
pm2 startup
```

## **Web Server Setup (5 minutes)**

### **9. Configure Nginx**
```bash
# Create Nginx config
sudo tee /etc/nginx/sites-available/customwallapp > /dev/null << EOF
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    location / {
        root /var/www/customwallapp/frontend;
        try_files \$uri \$uri/ /index.html;
    }
    
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
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
```

## **Testing (5 minutes)**

### **10. Verify Deployment**
```bash
# Check application status
pm2 status
pm2 logs customwall-backend

# Check Nginx
sudo systemctl status nginx

# Test database
mysql -u customwall -p memorywall -e "SHOW TABLES;"
```

### **11. Test Your Application**
- Visit your domain: `http://your-domain.com`
- Test user registration
- Test admin login (Arvind Rathod / arvind)
- Test sticker management
- Test plan assignments

## **SSL Setup (Optional - 5 minutes)**

### **12. Enable HTTPS**
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

## **✅ Success Checklist**

- [ ] Frontend loads at your domain
- [ ] User registration works
- [ ] Admin panel accessible
- [ ] Stickers load correctly
- [ ] Plan sticker management works
- [ ] Database operations successful
- [ ] SSL certificate installed (optional)

## **🚨 Quick Troubleshooting**

```bash
# If backend not starting
pm2 logs customwall-backend

# If Nginx not working
sudo nginx -t
sudo systemctl restart nginx

# If database issues
mysql -u customwall -p memorywall -e "SHOW TABLES;"

# If stickers not loading
ls -la /var/www/customwallapp/frontend/stickers/
```

## **📊 Monitoring Commands**

```bash
# Check all services
pm2 status
sudo systemctl status nginx
sudo systemctl status mysql

# Monitor resources
htop
df -h
free -h
```

## **🔄 Backup Commands**

```bash
# Database backup
mysqldump -u customwall -p memorywall > backup.sql

# Application backup
tar -czf app_backup.tar.gz /var/www/customwallapp/
```

**Total Time: ~35 minutes**
**Cost: ~$5-10/month (depending on provider)**