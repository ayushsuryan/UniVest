# Finance Backend Deployment Guide

## Prerequisites
- VPS with Ubuntu 22.04
- GitLab repository with CI/CD enabled
- SSH access to the VPS

## VPS Information
- **IP Address**: 157.180.90.43
- **User**: root
- **Password**: L39xw1aqz0wsj

## Setup Steps

### 1. Initial Server Setup
SSH into your VPS and run the server setup script:

```bash
ssh root@157.180.90.43
# When prompted, enter password: L39xw1aqz0wsj

# Download and run the server setup script
wget https://raw.githubusercontent.com/your-repo/finance-backend/main/server-setup.sh
chmod +x server-setup.sh
./server-setup.sh
```

### 2. GitLab CI/CD Configuration

#### Add CI/CD Variables in GitLab
Go to your GitLab project → Settings → CI/CD → Variables and add:

1. **SSH_PRIVATE_KEY**: Your SSH private key for VPS access
   - Generate SSH key pair: `ssh-keygen -t rsa -b 4096 -C "gitlab-ci"`
   - Add public key to VPS: `ssh-copy-id root@157.180.90.43`
   - Add private key to GitLab variable

2. **SSH_KNOWN_HOSTS**: 
   ```bash
   ssh-keyscan 157.180.90.43
   ```

#### Generate SSH Key Pair
```bash
ssh-keygen -t rsa -b 4096 -C "gitlab-ci"
# This creates ~/.ssh/id_rsa (private) and ~/.ssh/id_rsa.pub (public)
```

#### Add Public Key to VPS
```bash
ssh-copy-id root@157.180.90.43
# Or manually:
# ssh root@157.180.90.43
# mkdir -p ~/.ssh
# echo "your-public-key-content" >> ~/.ssh/authorized_keys
# chmod 600 ~/.ssh/authorized_keys
```

### 3. Environment Configuration
Update `.env.production` file with your actual values:
- MongoDB connection string
- JWT secret key
- Email credentials
- Any other environment-specific variables

### 4. Deployment Process
1. Push code to GitLab (main/master branch)
2. GitLab CI/CD will automatically:
   - Build the application
   - Run tests (if any)
   - Deploy to VPS (manual trigger)

### 5. Manual Deployment
To trigger deployment manually:
1. Go to GitLab → CI/CD → Pipelines
2. Click on the latest pipeline
3. Click "Deploy" button (manual job)

## URLs and Endpoints

### Application URLs
- **Main Application**: http://157.180.90.43
- **Health Check**: http://157.180.90.43/api/health
- **API Base URL**: http://157.180.90.43/api

### Available Endpoints
- `GET /api/health` - Health check
- `POST /api/auth/*` - Authentication endpoints

## Server Management

### PM2 Commands
```bash
# Check application status
pm2 status

# View logs
pm2 logs finance-backend

# Restart application
pm2 restart finance-backend

# Stop application
pm2 stop finance-backend

# Monitor application
pm2 monit
```

### Nginx Commands
```bash
# Check Nginx status
systemctl status nginx

# Restart Nginx
systemctl restart nginx

# Check Nginx configuration
nginx -t

# View Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### MongoDB Commands
```bash
# Check MongoDB status
systemctl status mongod

# Connect to MongoDB
mongosh

# View MongoDB logs
tail -f /var/log/mongodb/mongod.log
```

## Troubleshooting

### Check Application Logs
```bash
pm2 logs finance-backend
```

### Check Server Resources
```bash
htop
df -h
free -h
```

### Check Port Usage
```bash
netstat -tulpn | grep :5000
```

### Restart Services
```bash
systemctl restart mongod
systemctl restart nginx
pm2 restart finance-backend
```

## Security Notes
- Firewall is configured to allow only necessary ports (22, 80, 443, 5000)
- Change default passwords and use SSH keys
- Consider setting up SSL/TLS with Let's Encrypt
- Regularly update the system and packages

## Next Steps
1. Set up SSL certificate with Let's Encrypt
2. Configure domain name
3. Set up monitoring and alerting
4. Configure backup strategy for MongoDB
5. Set up log rotation 