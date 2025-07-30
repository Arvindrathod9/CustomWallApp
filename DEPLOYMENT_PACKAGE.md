# 🚀 CustomWallApp Deployment Package

## **What's Included in This Package**

### **📁 File Structure**
```
customwallapp-deployment/
├── backend/                 # Backend Node.js application
│   ├── Server.js           # Main server file
│   ├── config.js           # Configuration
│   ├── package.json        # Dependencies
│   └── .env               # Environment variables (create this)
├── frontend/               # Built React application
│   ├── index.html
│   ├── static/
│   └── assets/
├── assets/                 # Static assets
│   ├── stickers/          # All sticker images
│   ├── walls/             # Wall background images
│   └── home.jpg           # Home page background
├── database/
│   └── export_database.sql # Database schema
├── deploy.sh              # Automated deployment script
└── README.md              # This file
```

## **🎯 Deployment Options**

### **Option 1: AWS EC2 (Recommended)**

#### **Prerequisites:**
- AWS Account
- EC2 Instance (Ubuntu 20.04 LTS)
- Domain name (optional)

#### **Step-by-Step:**

1. **Launch EC2 Instance:**
   ```bash
   # Connect to your EC2 instance
   ssh -i your-key.pem ubuntu@your-ec2-ip
   ```

2. **Upload Files:**
   ```bash
   # Upload your deployment package
   scp -r customwallapp-deployment/* ubuntu@your-ec2-ip:/home/ubuntu/
   ```

3. **Run Deployment Script:**
   ```bash
   # Make script executable
   chmod +x deploy.sh
   
   # Run deployment
   ./deploy.sh
   ```

4. **Configure Environment:**
   ```bash
   # Edit environment variables
   nano /var/www/customwallapp/backend/.env
   ```

### **Option 2: DigitalOcean Droplet**

1. **Create Droplet:**
   - Choose Ubuntu 20.04
   - Select plan (Basic $5/month recommended)
   - Add SSH key

2. **Follow same steps as AWS EC2**

### **Option 3: VPS (Any Provider)**

1. **Install Ubuntu 20.04**
2. **Follow deployment script manually**

## **🔧 Manual Deployment Steps**

If you prefer manual deployment:

### **Step 1: Server Setup**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install -y nodejs npm mysql-server nginx

# Install PM2
sudo npm install -g pm2
```

### **Step 2: Database Setup**
```bash
# Secure MySQL
sudo mysql_secure_installation

# Create database and user
sudo mysql -e "CREATE DATABASE IF NOT EXISTS memorywall;"
sudo mysql -e "CREATE USER IF NOT EXISTS 'customwall'@'localhost' IDENTIFIED BY 'your_secure_password';"
sudo mysql -e "GRANT ALL PRIVILEGES ON memorywall.* TO 'customwall'@'localhost';"
sudo mysql -e "FLUSH PRIVILEGES;"

# Import schema
mysql -u customwall -p memorywall < export_database.sql
```

### **Step 3: Application Setup**
```bash
# Create app directory
sudo mkdir -p /var/www/customwallapp
sudo chown $USER:$USER /var/www/customwallapp

# Copy files
cp -r backend/* /var/www/customwallapp/backend/
cp -r frontend/* /var/www/customwallapp/frontend/
cp -r assets/* /var/www/customwallapp/frontend/

# Install dependencies
cd /var/www/customwallapp/backend
npm install --production
```

### **Step 4: Environment Configuration**
```bash
# Create .env file
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
```

### **Step 5: Start Application**
```bash
# Start with PM2
cd /var/www/customwallapp/backend
pm2 start Server.js --name "customwall-backend"
pm2 save
pm2 startup
```

### **Step 6: Configure Nginx**
```bash
# Create Nginx config
sudo tee /etc/nginx/sites-available/customwallapp > /dev/null << EOF
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
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
```

## **🔒 Security Checklist**

- [ ] Changed default MySQL password
- [ ] Updated JWT secret
- [ ] Configured firewall (security groups)
- [ ] Enabled SSL certificate
- [ ] Regular backups scheduled
- [ ] Monitoring set up

## **📊 Monitoring Commands**

```bash
# Check application status
pm2 status
pm2 logs customwall-backend

# Check Nginx status
sudo systemctl status nginx
sudo tail -f /var/log/nginx/error.log

# Check database
mysql -u customwall -p memorywall -e "SHOW TABLES;"

# Monitor system resources
htop
df -h
free -h
```

## **🔄 Backup Strategy**

```bash
# Database backup
mysqldump -u customwall -p memorywall > backup_$(date +%Y%m%d).sql

# Application backup
tar -czf app_backup_$(date +%Y%m%d).tar.gz /var/www/customwallapp/
```

## **🚨 Troubleshooting**

### **Common Issues:**

1. **Port 5000 not accessible:**
   - Check security group settings
   - Verify PM2 is running

2. **Database connection failed:**
   - Verify MySQL credentials
   - Check .env file

3. **Nginx 502 error:**
   - Check if backend is running
   - Verify Nginx configuration

4. **Stickers not loading:**
   - Check file permissions
   - Verify assets are copied correctly

## **💰 Cost Optimization**

- **AWS EC2:** t2.micro (free tier) for development
- **DigitalOcean:** Basic $5/month droplet
- **VPS:** Any provider with Ubuntu 20.04

## **📞 Support**

- Check logs: `pm2 logs customwall-backend`
- Restart services: `pm2 restart customwall-backend`
- Monitor resources: `htop`

## **✅ Success Criteria**

After deployment, verify:
- [ ] Frontend loads at your domain
- [ ] User registration works
- [ ] Admin panel accessible
- [ ] Stickers load correctly
- [ ] Plan sticker management works
- [ ] Database operations successful