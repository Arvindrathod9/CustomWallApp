#!/bin/bash

# 🚀 CustomWallApp New EC2 Deployment Script
# This script automates the deployment process for a new EC2 instance

set -e  # Exit on any error

echo "🚀 Starting CustomWallApp deployment on new EC2 instance..."

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

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    print_error "Please don't run this script as root. Use a regular user with sudo privileges."
    exit 1
fi

# Update system
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x
print_status "Installing Node.js 18.x..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MySQL
print_status "Installing MySQL..."
sudo apt install mysql-server -y

# Install Nginx
print_status "Installing Nginx..."
sudo apt install nginx -y

# Install PM2
print_status "Installing PM2..."
sudo npm install -g pm2

# Create application directory
print_status "Creating application directory..."
sudo mkdir -p /var/www/customwallapp
sudo chown $USER:$USER /var/www/customwallapp

print_status "✅ Basic system setup completed!"
print_warning "Next steps:"
echo "1. Configure MySQL database"
echo "2. Upload your application files to /var/www/customwallapp/"
echo "3. Configure environment variables"
echo "4. Start the application"
echo ""
echo "Run the following commands manually:"
echo ""
echo "# Configure MySQL:"
echo "sudo mysql_secure_installation"
echo "sudo mysql -u root -p"
echo "# Then run: CREATE DATABASE memorywall; CREATE USER 'customwall'@'localhost' IDENTIFIED BY 'your_password'; GRANT ALL PRIVILEGES ON memorywall.* TO 'customwall'@'localhost'; FLUSH PRIVILEGES; EXIT;"
echo ""
echo "# Upload your files and configure environment variables"
echo "# Then run the application setup script:"
echo "bash setup_application.sh" 