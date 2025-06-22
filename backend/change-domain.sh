#!/bin/bash

# Domain Change Script for Finance Backend
# Usage: ./change-domain.sh [old_domain] [new_domain] [email]
# Example: ./change-domain.sh jas-technologies.in newdomain.com admin@newdomain.com

set -e

# Configuration
OLD_DOMAIN=${1:-""}
NEW_DOMAIN=${2:-""}
EMAIL=${3:-"admin@$NEW_DOMAIN"}
BACKEND_PORT=${4:-5000}

if [[ -z "$OLD_DOMAIN" || -z "$NEW_DOMAIN" ]]; then
    echo "❌ Usage: ./change-domain.sh [old_domain] [new_domain] [email]"
    echo "📝 Example: ./change-domain.sh jas-technologies.in mynewdomain.com admin@mynewdomain.com"
    exit 1
fi

echo "🔄 Changing domain from $OLD_DOMAIN to $NEW_DOMAIN..."
echo "📧 Email: $EMAIL"

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo "❌ This script must be run as root (use sudo)"
   exit 1
fi

# Backup old configuration
echo "💾 Backing up old configuration..."
cp /etc/nginx/sites-available/$OLD_DOMAIN /etc/nginx/sites-available/$OLD_DOMAIN.backup.$(date +%Y%m%d_%H%M%S) 2>/dev/null || true

# Remove old domain configuration
echo "🗑️ Removing old domain configuration..."
rm -f /etc/nginx/sites-enabled/$OLD_DOMAIN
rm -f /etc/nginx/sites-available/$OLD_DOMAIN

# Create new Nginx configuration
echo "⚙️ Creating Nginx configuration for $NEW_DOMAIN..."
cat > /etc/nginx/sites-available/$NEW_DOMAIN << EOF
# HTTP configuration (temporary for Let's Encrypt)
server {
    listen 80;
    server_name $NEW_DOMAIN www.$NEW_DOMAIN;
    
    # Let's Encrypt challenge
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
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

# Enable the new site
ln -sf /etc/nginx/sites-available/$NEW_DOMAIN /etc/nginx/sites-enabled/

# Test Nginx configuration
nginx -t

# Reload Nginx
systemctl reload nginx

# Wait a moment
sleep 3

# Obtain SSL certificate for new domain
echo "🔒 Obtaining SSL certificate for $NEW_DOMAIN..."
certbot --nginx -d $NEW_DOMAIN -d www.$NEW_DOMAIN --non-interactive --agree-tos --email $EMAIL --redirect

# Create enhanced Nginx configuration with SSL
echo "⚙️ Creating enhanced Nginx configuration with SSL..."
cat > /etc/nginx/sites-available/$NEW_DOMAIN << EOF
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name $NEW_DOMAIN www.$NEW_DOMAIN;
    return 301 https://\$server_name\$request_uri;
}

# HTTPS configuration
server {
    listen 443 ssl http2;
    server_name $NEW_DOMAIN www.$NEW_DOMAIN;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/$NEW_DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$NEW_DOMAIN/privkey.pem;
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

# Clean up old SSL certificates (optional)
echo "🧹 Would you like to remove SSL certificates for $OLD_DOMAIN? (y/N)"
read -r response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    certbot delete --cert-name $OLD_DOMAIN --non-interactive || echo "⚠️ Failed to delete old certificates"
fi

# Display status
echo ""
echo "✅ Domain change completed successfully!"
echo ""
echo "📍 Old Domain: $OLD_DOMAIN (disabled)"
echo "📍 New Domain: https://$NEW_DOMAIN"
echo "🔒 SSL Certificate: Active (Let's Encrypt)"
echo "🌐 Backend API: https://$NEW_DOMAIN/api"
echo "❤️ Health Check: https://$NEW_DOMAIN/api/health"
echo ""
echo "🔧 Next steps:"
echo "1. Update your DNS A record to point $NEW_DOMAIN to this server's IP"
echo "2. Test the API: curl https://$NEW_DOMAIN/api/health"
echo "3. Update your React Native app configuration"
echo "4. Update any external services using the old domain"
echo ""

# Test the setup
echo "🧪 Testing the new setup..."
sleep 5

echo "Testing HTTPS..."
curl -I https://$NEW_DOMAIN/api/health || echo "⚠️ HTTPS test failed (this is normal if DNS isn't propagated yet)"

echo ""
echo "🎉 Domain change complete! Your API should be available at https://$NEW_DOMAIN/api" 