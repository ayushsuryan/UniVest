#!/bin/bash

# Finance Backend - Initial Server Setup Script
# This script sets up a fresh Ubuntu VPS with all necessary packages and security

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   print_error "This script must be run as root"
   exit 1
fi

print_status "🚀 Starting Finance Backend Server Setup..."

# Update system packages
print_status "📦 Updating system packages..."
apt update && apt upgrade -y

# Install essential packages
print_status "📦 Installing essential packages..."
apt install -y \
    curl \
    wget \
    git \
    unzip \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release \
    ufw \
    fail2ban \
    htop \
    nano \
    vim

# Install Node.js 18 (LTS)
print_status "📦 Installing Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Verify Node.js installation
node_version=$(node --version)
npm_version=$(npm --version)
print_success "Node.js installed: $node_version"
print_success "NPM installed: $npm_version"

# Install PM2 globally
print_status "📦 Installing PM2 process manager..."
npm install -g pm2

# Install Nginx
print_status "📦 Installing Nginx..."
apt install -y nginx

# Install Certbot for SSL
print_status "📦 Installing Certbot for SSL certificates..."
apt install -y certbot python3-certbot-nginx

# Configure UFW Firewall
print_status "🔥 Configuring UFW Firewall..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 'Nginx Full'
ufw allow 5000/tcp comment 'Backend API'
ufw --force enable

print_success "Firewall configured with rules:"
ufw status

# Configure Fail2Ban
print_status "🔒 Configuring Fail2Ban..."
systemctl enable fail2ban
systemctl start fail2ban

# Create application directory
print_status "📁 Creating application directories..."
mkdir -p /var/www/finance-backend
mkdir -p /var/log/finance-backend
mkdir -p /etc/nginx/ssl

# Create finance user for running the application
print_status "👤 Creating finance user..."
if ! id "finance" &>/dev/null; then
    useradd -r -s /bin/false finance
    print_success "Created finance user"
else
    print_warning "Finance user already exists"
fi

# Set proper permissions
chown -R finance:finance /var/www/finance-backend
chown -R finance:finance /var/log/finance-backend

# Create systemd service file for the backend
print_status "📋 Creating systemd service..."
cat > /etc/systemd/system/finance-backend.service << 'EOF'
[Unit]
Description=Finance Backend API Server
After=network.target

[Service]
Type=simple
User=finance
WorkingDirectory=/var/www/finance-backend
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=5000
StandardOutput=journal
StandardError=journal
SyslogIdentifier=finance-backend

[Install]
WantedBy=multi-user.target
EOF

# Enable the service
systemctl daemon-reload
systemctl enable finance-backend

# Create log rotation configuration
print_status "📋 Setting up log rotation..."
cat > /etc/logrotate.d/finance-backend << 'EOF'
/var/log/finance-backend/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 644 finance finance
    postrotate
        systemctl reload finance-backend
    endscript
}
EOF

# Configure system limits
print_status "⚙️ Configuring system limits..."
cat >> /etc/security/limits.conf << 'EOF'
finance soft nofile 65536
finance hard nofile 65536
EOF

# Create backup directory
print_status "💾 Creating backup directory..."
mkdir -p /var/backups/finance-backend
chown finance:finance /var/backups/finance-backend

# Install additional monitoring tools
print_status "📊 Installing monitoring tools..."
apt install -y netstat-nat iotop

# Configure automatic security updates
print_status "🔄 Configuring automatic security updates..."
apt install -y unattended-upgrades
echo 'Unattended-Upgrade::Automatic-Reboot "false";' >> /etc/apt/apt.conf.d/50unattended-upgrades

# Create deployment info file
cat > /root/deployment-info.txt << EOF
Finance Backend Deployment Information
=====================================
Date: $(date)
Server: $(hostname -f)
IP: $(curl -s ifconfig.me)
Node.js: $(node --version)
NPM: $(npm --version)
PM2: $(pm2 --version)
Nginx: $(nginx -v 2>&1)

Directories:
- Application: /var/www/finance-backend
- Logs: /var/log/finance-backend
- Backups: /var/backups/finance-backend
- SSL: /etc/nginx/ssl

Services:
- finance-backend.service (systemd)
- nginx
- fail2ban
- ufw (firewall)

Next Steps:
1. Deploy backend code to /var/www/finance-backend
2. Configure domain and SSL
3. Start the application service
EOF

print_success "🎉 Initial server setup completed successfully!"
print_status "📋 Deployment info saved to /root/deployment-info.txt"
print_status "🔧 Next: Run the backend deployment script"

# Display system information
print_status "📊 System Information:"
echo "Hostname: $(hostname -f)"
echo "IP Address: $(curl -s ifconfig.me)"
echo "OS: $(lsb_release -d | cut -f2)"
echo "Kernel: $(uname -r)"
echo "Memory: $(free -h | grep Mem | awk '{print $2}')"
echo "Disk: $(df -h / | tail -1 | awk '{print $2}')" 