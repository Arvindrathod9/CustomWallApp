# 🚀 CustomWallApp Deployment Guide - AWS EC2

## Prerequisites
- AWS Account
- EC2 Instance (Ubuntu 20.04 LTS recommended)
- Domain name (optional but recommended)

## Step 1: Launch EC2 Instance

### 1.1 Create EC2 Instance
1. Go to AWS Console → EC2 → Launch Instance
2. Choose **Ubuntu Server 20.04 LTS**
3. Select **t2.micro** (free tier) or **t2.small** for better performance
4. Configure Security Group:
   - **SSH (Port 22)** - Your IP
   - **HTTP (Port 80)** - 0.0.0.0/0
   - **HTTPS (Port 443)** - 0.0.0.0/0
   - **Custom TCP (Port 5000)** - 0.0.0.0/0 (for your Node.js backend)

### 1.2 Connect to Instance
```bash
ssh -i your-key.pem ubuntu@your-ec2-public-ip
```

## Step 2: Install Dependencies

### 2.1 Update System
```bash
sudo apt update && sudo apt upgrade -y
```

### 2.2 Install Node.js & npm
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2.3 Install MySQL
```bash
sudo apt install mysql-server -y
sudo mysql_secure_installation
```

### 2.4 Install Nginx
```bash
sudo apt install nginx -y
```

### 2.5 Install PM2 (Process Manager)
```bash
sudo npm install -g pm2
```

## Step 3: Setup Database

### 3.1 Create Database
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

### 3.2 Import Database Schema
```bash
# Copy your database schema to the server
mysql -u customwall -p memorywall < schema.sql
```

## Step 4: Deploy Backend

### 4.1 Upload Backend Files
```bash
# Create app directory
sudo mkdir -p /var/www/customwallapp
sudo chown ubuntu:ubuntu /var/www/customwallapp

# Upload your backend files to /var/www/customwallapp/backend/
```

### 4.2 Install Backend Dependencies
```bash
cd /var/www/customwallapp/backend
npm install --production
```

### 4.3 Configure Environment Variables
```bash
sudo nano /var/www/customwallapp/backend/.env
```

Add your production environment variables:
```
PORT=5000
JWT_SECRET=your_very_secure_jwt_secret_key
DB_HOST=localhost
DB_USER=customwall
DB_PASSWORD=your_secure_password
DB_NAME=memorywall
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
NODE_ENV=production
```

### 4.4 Start Backend with PM2
```bash
cd /var/www/customwallapp/backend
pm2 start Server.js --name "customwall-backend"
pm2 save
pm2 startup
```

## Step 5: Deploy Frontend

### 5.1 Upload Frontend Build
```bash
# Upload your frontend/build/ folder to /var/www/customwallapp/frontend/
```

### 5.2 Configure Nginx
```bash
sudo nano /etc/nginx/sites-available/customwallapp
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
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

### 5.3 Enable Site
```bash
sudo ln -s /etc/nginx/sites-available/customwallapp /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Step 6: SSL Certificate (Optional but Recommended)

### 6.1 Install Certbot
```bash
sudo apt install certbot python3-certbot-nginx -y
```

### 6.2 Get SSL Certificate
```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

## Step 7: Update Frontend API Configuration

### 7.1 Update API Base URL
In your frontend build, update the API base URL to point to your domain:
```javascript
// In frontend/src/api.js
export const API_BASE = 'https://your-domain.com';
```

### 7.2 Rebuild Frontend
```bash
# On your local machine
cd frontend
npm run build
# Upload the new build to server
```

## Step 8: Monitoring & Maintenance

### 8.1 Check Application Status
```bash
pm2 status
pm2 logs customwall-backend
```

### 8.2 Monitor System Resources
```bash
htop
df -h
free -h
```

### 8.3 Backup Database
```bash
mysqldump -u customwall -p memorywall > backup_$(date +%Y%m%d).sql
```

## Troubleshooting

### Common Issues:
1. **Port 5000 not accessible**: Check security group settings
2. **Database connection failed**: Verify MySQL credentials and permissions
3. **Nginx 502 error**: Check if backend is running (`pm2 status`)
4. **SSL issues**: Ensure domain points to your EC2 IP

### Useful Commands:
```bash
# Check backend logs
pm2 logs customwall-backend

# Restart backend
pm2 restart customwall-backend

# Check nginx status
sudo systemctl status nginx

# Check nginx logs
sudo tail -f /var/log/nginx/error.log
```

## Security Checklist
- [ ] Changed default MySQL password
- [ ] Updated JWT secret
- [ ] Configured firewall (security groups)
- [ ] Enabled SSL certificate
- [ ] Regular backups scheduled
- [ ] Monitoring set up

## Cost Optimization
- Use t2.micro for development (free tier)
- Consider t2.small for production
- Use Amazon RDS for database (optional)
- Set up CloudWatch monitoring 