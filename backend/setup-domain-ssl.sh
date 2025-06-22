#!/bin/bash

# Domain and SSL Setup Script for Finance Backend
# Usage: ./setup-domain-ssl.sh [domain_name] [email]
# Example: ./setup-domain-ssl.sh jas-technologies.in admin@jas-technologies.in

set -e

# Configuration
DOMAIN=${1:-"jas-technologies.in"}
EMAIL=${2:-"admin@jas-technologies.in"}
BACKEND_PORT=${3:-5000}

echo "🚀 Setting up domain and SSL for Finance Backend..."
echo "📍 Domain: $DOMAIN"
echo "📧 Email: $EMAIL"
echo "🔌 Backend Port: $BACKEND_PORT"

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo "❌ This script must be run as root (use sudo)"
   exit 1
fi

# Update system packages
echo "📦 Updating system packages..."
apt-get update -y

# Install required packages
echo "📦 Installing required packages..."
apt-get install -y nginx certbot python3-certbot-nginx ufw

# Stop nginx temporarily
systemctl stop nginx

# Setup firewall
echo "🔥 Configuring firewall..."
ufw allow ssh
ufw allow 'Nginx Full'
ufw allow 80
ufw allow 443
ufw allow $BACKEND_PORT
ufw --force enable

# Create Nginx configuration for the domain
echo "⚙️ Creating Nginx configuration for $DOMAIN..."
cat > /etc/nginx/sites-available/$DOMAIN << EOF
# HTTP configuration (temporary for Let's Encrypt)
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    
    # Let's Encrypt challenge
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    # Redirect HTTP to HTTPS (will be enabled after SSL setup)
    # return 301 https://\$server_name\$request_uri;
    
    # Temporary proxy to backend for testing
    location / {
        proxy_pass http://localhost:$BACKEND_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
EOF

# Enable the site
ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/

# Remove default Nginx site
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t

# Start Nginx
systemctl start nginx
systemctl enable nginx

# Wait a moment for Nginx to start
sleep 3

# Obtain SSL certificate from Let's Encrypt
echo "🔒 Obtaining SSL certificate from Let's Encrypt..."
certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email $EMAIL --redirect

# Create enhanced Nginx configuration with SSL
echo "⚙️ Creating enhanced Nginx configuration with SSL..."
cat > /etc/nginx/sites-available/$DOMAIN << EOF
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    return 301 https://\$server_name\$request_uri;
}

# HTTPS configuration
server {
    listen 443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # API routes
    location /api/ {
        proxy_pass http://localhost:$BACKEND_PORT/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # CORS headers
        add_header Access-Control-Allow-Origin * always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept, Authorization" always;
        
        # Handle preflight requests
        if (\$request_method = 'OPTIONS') {
            add_header Access-Control-Allow-Origin * always;
            add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
            add_header Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept, Authorization" always;
            add_header Access-Control-Max-Age 1728000;
            add_header Content-Type 'text/plain charset=UTF-8';
            add_header Content-Length 0;
            return 204;
        }
    }

    # Health check endpoint
    location /api/health {
        proxy_pass http://localhost:$BACKEND_PORT/api/health;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Root redirect to API documentation or status
    location / {
        return 301 /api/health;
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Rate limiting
    limit_req_zone \$binary_remote_addr zone=api:10m rate=10r/s;
    limit_req zone=api burst=20 nodelay;
}
EOF

# Test Nginx configuration
nginx -t

# Reload Nginx with new configuration
systemctl reload nginx

# Setup auto-renewal for SSL certificates
echo "🔄 Setting up SSL certificate auto-renewal..."
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -

# Display status
echo ""
echo "✅ Domain and SSL setup completed successfully!"
echo ""
echo "📍 Domain: https://$DOMAIN"
echo "🔒 SSL Certificate: Active (Let's Encrypt)"
echo "🔄 Auto-renewal: Configured"
echo "🌐 Backend API: https://$DOMAIN/api"
echo "❤️ Health Check: https://$DOMAIN/api/health"
echo ""
echo "🔧 Next steps:"
echo "1. Update your DNS A record to point $DOMAIN to this server's IP"
echo "2. Test the API: curl https://$DOMAIN/api/health"
echo "3. Update your React Native app configuration"
echo ""
echo "📝 Nginx configuration: /etc/nginx/sites-available/$DOMAIN"
echo "🔒 SSL certificates: /etc/letsencrypt/live/$DOMAIN/"
echo ""

# Test the setup
echo "🧪 Testing the setup..."
sleep 5

echo "Testing HTTP redirect..."
curl -I http://$DOMAIN/api/health || echo "⚠️ HTTP test failed (this is normal if DNS isn't propagated yet)"

echo "Testing HTTPS..."
curl -I https://$DOMAIN/api/health || echo "⚠️ HTTPS test failed (this is normal if DNS isn't propagated yet)"

echo ""
echo "🎉 Setup complete! Your API should be available at https://$DOMAIN/api" 