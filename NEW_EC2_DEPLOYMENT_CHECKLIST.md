# 🚀 NEW EC2 DEPLOYMENT CHECKLIST
## Avoiding Network Issues and Hardcoded Values

### ✅ PRE-DEPLOYMENT CHECKS (COMPLETED)

1. **Fixed Hardcoded Values** ✅
   - [x] Removed hardcoded IP `65.0.125.114` from `frontend/src/api.js`
   - [x] Updated to use environment variable `REACT_APP_API_BASE_URL`
   - [x] Verified backend uses environment variables properly
   - [x] Checked all configuration files for hardcoded values

2. **Environment Configuration** ✅
   - [x] Backend config uses environment variables
   - [x] Frontend config uses environment variables
   - [x] Database connection uses environment variables
   - [x] Email configuration uses environment variables

### 🔧 EC2 INSTANCE SETUP

#### Step 1: Launch New EC2 Instance
```bash
# Choose Ubuntu 20.04 LTS
# Instance Type: t2.micro (free) or t2.small (recommended)
# Security Group Configuration:
# - SSH (22): Your IP
# - HTTP (80): 0.0.0.0/0
# - HTTPS (443): 0.0.0.0/0
# - Custom TCP (5000): 0.0.0.0/0 (for Node.js backend)
```

#### Step 2: Connect and Update System
```bash
ssh -i your-key.pem ubuntu@your-new-ec2-ip
sudo apt update && sudo apt upgrade -y
```

#### Step 3: Install Dependencies
```bash
# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MySQL
sudo apt install mysql-server -y
sudo mysql_secure_installation

# Install Nginx
sudo apt install nginx -y

# Install PM2
sudo npm install -g pm2
```

### 🗄️ DATABASE SETUP

#### Step 4: Configure MySQL
```bash
sudo mysql -u root -p
```

```sql
CREATE DATABASE memorywall;
CREATE USER 'customwall'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON memorywall.* TO 'customwall'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### Step 5: Import Database Schema
```bash
# Upload export_database.sql to your server
mysql -u customwall -p memorywall < export_database.sql
```

### 📦 APPLICATION DEPLOYMENT

#### Step 6: Upload Application Files
```bash
# Create app directory
sudo mkdir -p /var/www/customwallapp
sudo chown ubuntu:ubuntu /var/www/customwallapp

# Upload your application files to /var/www/customwallapp/
# - backend/ folder
# - frontend/build/ folder
# - frontend/public/stickers/ folder
# - frontend/public/walls/ folder
```

#### Step 7: Install Backend Dependencies
```bash
cd /var/www/customwallapp/backend
npm install --production
```

#### Step 8: Configure Backend Environment
```bash
sudo nano /var/www/customwallapp/backend/.env
```

Add these environment variables:
```env
PORT=5000
JWT_SECRET=your_very_secure_jwt_secret_key_here
DB_HOST=localhost
DB_USER=customwall
DB_PASSWORD=your_secure_password
DB_NAME=memorywall
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
NODE_ENV=production
```

#### Step 9: Configure Frontend Environment
```bash
# Create frontend environment file
sudo nano /var/www/customwallapp/frontend/.env
```

Add these environment variables:
```env
REACT_APP_API_BASE_URL=http://your-new-ec2-public-ip
# OR if you have a domain:
# REACT_APP_API_BASE_URL=https://your-domain.com
```

#### Step 10: Rebuild Frontend with Correct API URL
```bash
# On your local machine, update the API URL
cd frontend
echo "REACT_APP_API_BASE_URL=http://your-new-ec2-public-ip" > .env
npm run build

# Upload the new build to server
# Replace /var/www/customwallapp/frontend/ with the new build
```

### 🚀 START APPLICATION

#### Step 11: Start Backend with PM2
```bash
cd /var/www/customwallapp/backend
pm2 start Server.js --name "customwall-backend"
pm2 save
pm2 startup
```

#### Step 12: Configure Nginx
```bash
sudo nano /etc/nginx/sites-available/customwallapp
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com your-new-ec2-public-ip;
    
    # Frontend
    location / {
        root /var/www/customwallapp/frontend/build;
        try_files $uri $uri/ /index.html;
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Socket.IO
    location /socket.io/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### Step 13: Enable Nginx Site
```bash
sudo ln -s /etc/nginx/sites-available/customwallapp /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### ✅ VERIFICATION CHECKLIST

#### Step 14: Test Everything
```bash
# Check backend status
pm2 status
pm2 logs customwall-backend

# Check nginx status
sudo systemctl status nginx

# Test database connection
mysql -u customwall -p memorywall -e "SHOW TABLES;"

# Check if port 5000 is listening
sudo netstat -tlnp | grep :5000
```

#### Step 15: Test Application Features
- [ ] Frontend loads at `http://your-new-ec2-public-ip`
- [ ] User registration works
- [ ] User login works
- [ ] Admin login works (Arvind Rathod / arvind)
- [ ] Stickers load correctly
- [ ] Wall backgrounds load correctly
- [ ] Chat functionality works
- [ ] Plan management works
- [ ] Database operations successful

### 🔧 TROUBLESHOOTING COMMANDS

```bash
# If backend not starting
pm2 logs customwall-backend
pm2 restart customwall-backend

# If nginx issues
sudo nginx -t
sudo systemctl restart nginx
sudo tail -f /var/log/nginx/error.log

# If database issues
mysql -u customwall -p memorywall -e "SHOW TABLES;"

# If port issues
sudo netstat -tlnp | grep :5000
sudo ufw status

# Check all services
pm2 status
sudo systemctl status nginx
sudo systemctl status mysql
```

### 🛡️ SECURITY CHECKLIST

- [ ] Changed default MySQL password
- [ ] Updated JWT secret
- [ ] Configured firewall (security groups)
- [ ] Limited SSH access to your IP
- [ ] Regular backups scheduled
- [ ] Monitoring set up

### 📊 MONITORING

```bash
# Monitor resources
htop
df -h
free -h

# Monitor application
pm2 monit
pm2 logs

# Monitor nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 🔄 BACKUP COMMANDS

```bash
# Database backup
mysqldump -u customwall -p memorywall > backup_$(date +%Y%m%d).sql

# Application backup
tar -czf app_backup_$(date +%Y%m%d).tar.gz /var/www/customwallapp/
```

### 🎯 SUCCESS INDICATORS

- [ ] No hardcoded IP addresses in code
- [ ] All environment variables properly set
- [ ] Application accessible via HTTP
- [ ] All features working correctly
- [ ] No network connectivity issues
- [ ] Database operations successful
- [ ] Admin panel accessible
- [ ] User registration/login working

### 🚨 CRITICAL FIXES APPLIED

1. **Removed hardcoded IP**: Changed from `http://65.0.125.114` to environment variable
2. **Environment-based configuration**: All URLs now use environment variables
3. **Proper fallbacks**: Added localhost fallback for development
4. **Comprehensive testing**: Added verification steps for all features

This checklist ensures your new EC2 deployment will avoid the network issues you experienced before! 