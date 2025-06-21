#!/bin/bash

# Server setup script for Ubuntu 22.04
echo "Setting up server for Finance Backend deployment..."

# Update system packages
apt-get update -y
apt-get upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Install PM2 globally
npm install -g pm2

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list
apt-get update
apt-get install -y mongodb-org

# Start and enable MongoDB
systemctl start mongod
systemctl enable mongod

# Install Nginx
apt-get install -y nginx

# Install other useful tools
apt-get install -y git curl wget htop ufw

# Setup firewall
ufw allow ssh
ufw allow 'Nginx Full'
ufw allow 5000
ufw --force enable

# Create application directory
mkdir -p /var/www/finance-backend
chown -R root:root /var/www/finance-backend

# Setup PM2 to start on boot
pm2 startup systemd -u root --hp /root
pm2 save

echo "Server setup completed successfully!"
echo "Node.js version: $(node --version)"
echo "NPM version: $(npm --version)"
echo "PM2 version: $(pm2 --version)"
echo "MongoDB status: $(systemctl is-active mongod)"
echo "Nginx status: $(systemctl is-active nginx)" 