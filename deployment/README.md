# Finance Backend Deployment Guide

This directory contains all the necessary scripts and configurations for deploying the Finance Backend API to a production server.

## 📁 Directory Structure

```
deployment/
├── scripts/                    # Deployment automation scripts
│   ├── 01-initial-server-setup.sh    # Initial server configuration
│   ├── 02-deploy-backend.sh          # Backend application deployment
│   ├── 03-setup-domain-ssl.sh        # Domain and SSL configuration
│   └── 04-update-frontend.sh         # Frontend configuration update
├── configs/                    # Configuration templates
│   ├── nginx-template.conf           # Nginx reverse proxy template
│   ├── network-security-config.xml   # Android network security config
│   ├── systemd-service.service       # Systemd service template
│   └── .env.production              # Production environment template
└── README.md                   # This documentation
```

## 🚀 Quick Start

### Prerequisites

- Ubuntu 20.04+ VPS with root access
- Domain name pointing to your server IP
- SSH key configured for root access
- Local React Native project

### Step 1: Initial Server Setup

Run this script on a fresh Ubuntu VPS to install all necessary packages and configure security:

```bash
# On your VPS as root
wget https://raw.githubusercontent.com/your-repo/finance-backend/main/deployment/scripts/01-initial-server-setup.sh
chmod +x 01-initial-server-setup.sh
./01-initial-server-setup.sh
```

This script will:
- ✅ Update system packages
- ✅ Install Node.js 18, Nginx, Certbot
- ✅ Configure UFW firewall
- ✅ Set up Fail2Ban security
- ✅ Create application directories
- ✅ Configure systemd service
- ✅ Set up log rotation

### Step 2: Deploy Backend Application

From your local machine, deploy the backend application:

```bash
# From your local machine
cd deployment/scripts
chmod +x 02-deploy-backend.sh

# Deploy to server
./02-deploy-backend.sh -s YOUR_SERVER_IP -d YOUR_DOMAIN
```

Example:
```bash
./02-deploy-backend.sh -s 157.180.90.43 -d jas-technologies.in
```

This script will:
- ✅ Create deployment package
- ✅ Upload to server
- ✅ Install dependencies
- ✅ Start the backend service
- ✅ Test API connectivity

### Step 3: Configure Domain and SSL

Set up Nginx reverse proxy and SSL certificates:

```bash
# From your local machine
chmod +x 03-setup-domain-ssl.sh

# Configure domain and SSL
./03-setup-domain-ssl.sh -d YOUR_DOMAIN -e YOUR_EMAIL
```

Example:
```bash
./03-setup-domain-ssl.sh -d jas-technologies.in -e admin@jas-technologies.in
```

This script will:
- ✅ Check DNS resolution
- ✅ Configure Nginx reverse proxy
- ✅ Obtain Let's Encrypt SSL certificate
- ✅ Set up auto-renewal
- ✅ Configure security headers
- ✅ Set up monitoring

### Step 4: Update Frontend Configuration

Update your React Native app to use the new domain:

```bash
# From your React Native project directory
chmod +x ../deployment/scripts/04-update-frontend.sh

# Update frontend configuration
../deployment/scripts/04-update-frontend.sh -d YOUR_DOMAIN
```

Example:
```bash
../deployment/scripts/04-update-frontend.sh -d jas-technologies.in
```

This script will:
- ✅ Update API base URL
- ✅ Configure Android network security
- ✅ Update environment files
- ✅ Create API test script
- ✅ Build configuration for release

## 📋 Manual Deployment Steps

If you prefer manual deployment, follow these steps:

### 1. Server Preparation

```bash
# Update system
apt update && apt upgrade -y

# Install required packages
apt install -y nodejs npm nginx certbot python3-certbot-nginx ufw fail2ban

# Configure firewall
ufw allow ssh
ufw allow 'Nginx Full'
ufw allow 5000/tcp
ufw --force enable

# Create application user
useradd -r -s /bin/false finance
mkdir -p /var/www/finance-backend
chown finance:finance /var/www/finance-backend
```

### 2. Backend Deployment

```bash
# Upload your backend code to /var/www/finance-backend
cd /var/www/finance-backend
npm install --production

# Create systemd service
cp deployment/configs/systemd-service.service /etc/systemd/system/finance-backend.service
systemctl daemon-reload
systemctl enable finance-backend
systemctl start finance-backend
```

### 3. Nginx Configuration

```bash
# Create Nginx configuration (replace {{DOMAIN}} with your domain)
cp deployment/configs/nginx-template.conf /etc/nginx/sites-available/your-domain
ln -s /etc/nginx/sites-available/your-domain /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

### 4. SSL Certificate

```bash
# Obtain SSL certificate
certbot --nginx -d your-domain.com -d www.your-domain.com --email your-email@domain.com --agree-tos --non-interactive
```

## 🔧 Configuration Files

### Environment Variables

Copy and customize the production environment file:

```bash
cp deployment/configs/.env.production /var/www/finance-backend/.env
```

Key variables to update:
- `JWT_SECRET`: Strong random secret for JWT tokens
- `DB_CONNECTION_STRING`: Your database connection
- `CORS_ORIGIN`: Your domain for CORS
- Email settings if using email features

### Android Network Security

For React Native Android apps, update the network security configuration:

```xml
<!-- android/app/src/main/res/xml/network_security_config.xml -->
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <domain-config cleartextTrafficPermitted="false">
        <domain includeSubdomains="false">your-domain.com</domain>
        <trust-anchors>
            <certificates src="system"/>
            <certificates src="user"/>
        </trust-anchors>
    </domain-config>
</network-security-config>
```

## 🧪 Testing

### API Health Check

```bash
# Test API endpoints
curl https://your-domain.com/api/health
curl https://your-domain.com/api/test-connection
```

### Frontend Testing

```bash
# Run API connectivity test
npm run test-api
```

### SSL Certificate Check

```bash
# Check SSL certificate
openssl s_client -connect your-domain.com:443 -servername your-domain.com
```

## 📊 Monitoring

### Service Status

```bash
# Check backend service
systemctl status finance-backend

# Check Nginx
systemctl status nginx

# View logs
journalctl -u finance-backend -f
tail -f /var/log/finance-backend/monitor.log
```

### SSL Certificate Monitoring

```bash
# Check certificate expiry
certbot certificates

# Test renewal
certbot renew --dry-run
```

## 🔒 Security Features

- **HTTPS Only**: All traffic redirected to HTTPS
- **HSTS Headers**: Strict Transport Security enabled
- **Security Headers**: XSS, CSRF, and content type protection
- **Rate Limiting**: API requests limited per IP
- **Firewall**: UFW configured with minimal required ports
- **Fail2Ban**: Protection against brute force attacks
- **SSL/TLS**: Modern TLS configuration with strong ciphers

## 🚨 Troubleshooting

### Common Issues

1. **SSL Certificate Fails**
   - Check DNS resolution: `nslookup your-domain.com`
   - Verify ports 80/443 are open
   - Check domain ownership

2. **Backend Service Won't Start**
   - Check logs: `journalctl -u finance-backend -n 50`
   - Verify Node.js installation: `node --version`
   - Check file permissions: `ls -la /var/www/finance-backend`

3. **Nginx Configuration Error**
   - Test config: `nginx -t`
   - Check syntax in configuration files
   - Verify SSL certificate paths

4. **API Not Accessible**
   - Check firewall: `ufw status`
   - Verify service is running: `systemctl status finance-backend`
   - Test local connection: `curl http://localhost:5000/api/health`

### Log Locations

- Backend logs: `/var/log/finance-backend/`
- Nginx logs: `/var/log/nginx/`
- System logs: `journalctl -u finance-backend`
- SSL logs: `/var/log/letsencrypt/`

## 🔄 Updates and Maintenance

### Backend Updates

```bash
# Stop service
systemctl stop finance-backend

# Backup current version
tar -czf /var/backups/finance-backend/backup-$(date +%Y%m%d).tar.gz -C /var/www finance-backend

# Deploy new version
# ... upload new files ...

# Start service
systemctl start finance-backend
```

### SSL Certificate Renewal

Certificates auto-renew via cron job. Manual renewal:

```bash
certbot renew
systemctl reload nginx
```

### System Updates

```bash
# Update system packages
apt update && apt upgrade -y

# Update Node.js (if needed)
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs
```

## 📞 Support

For issues or questions:

1. Check the troubleshooting section above
2. Review service logs for error messages
3. Verify all configuration files are correct
4. Test each component individually

## 📝 Changelog

- **v1.0.0**: Initial deployment scripts and documentation
- Added comprehensive error handling
- Included monitoring and security features
- Created automated deployment pipeline

---

**Note**: Always test deployments in a staging environment before deploying to production. 