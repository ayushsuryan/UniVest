#!/bin/bash

# Finance Backend - Domain and SSL Setup Script
# This script configures Nginx reverse proxy and SSL certificates

set -e

# Configuration
DOMAIN=""
EMAIL=""
SERVER_IP=""

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

# Function to show usage
show_usage() {
    echo "Usage: $0 -d DOMAIN -e EMAIL [-s SERVER_IP]"
    echo ""
    echo "Options:"
    echo "  -d DOMAIN       Domain name (required)"
    echo "  -e EMAIL        Email for SSL certificate (required)"
    echo "  -s SERVER_IP    Server IP for remote execution (optional)"
    echo ""
    echo "Examples:"
    echo "  $0 -d jas-technologies.in -e admin@jas-technologies.in"
    echo "  $0 -d jas-technologies.in -e admin@jas-technologies.in -s 157.180.90.43"
}

# Parse command line arguments
while getopts "d:e:s:h" opt; do
    case $opt in
        d)
            DOMAIN="$OPTARG"
            ;;
        e)
            EMAIL="$OPTARG"
            ;;
        s)
            SERVER_IP="$OPTARG"
            ;;
        h)
            show_usage
            exit 0
            ;;
        \?)
            print_error "Invalid option: -$OPTARG"
            show_usage
            exit 1
            ;;
    esac
done

# Validate required parameters
if [[ -z "$DOMAIN" ]] || [[ -z "$EMAIL" ]]; then
    print_error "Domain and email are required"
    show_usage
    exit 1
fi

print_status "🌐 Setting up domain and SSL for: $DOMAIN"
print_status "📧 SSL certificate email: $EMAIL"

# Function to execute commands (locally or remotely)
execute_cmd() {
    local cmd="$1"
    if [[ -n "$SERVER_IP" ]]; then
        ssh root@$SERVER_IP "$cmd"
    else
        eval "$cmd"
    fi
}

# Function to create file (locally or remotely)
create_file() {
    local file_path="$1"
    local content="$2"
    if [[ -n "$SERVER_IP" ]]; then
        ssh root@$SERVER_IP "cat > '$file_path'" << EOF
$content
EOF
    else
        cat > "$file_path" << EOF
$content
EOF
    fi
}

# Check if running as root (for local execution)
if [[ -z "$SERVER_IP" ]] && [[ $EUID -ne 0 ]]; then
   print_error "This script must be run as root for local execution"
   exit 1
fi

# Test SSH connection if remote
if [[ -n "$SERVER_IP" ]]; then
    print_status "🔐 Testing SSH connection to $SERVER_IP..."
    if ! ssh -o ConnectTimeout=10 -o BatchMode=yes root@$SERVER_IP exit 2>/dev/null; then
        print_error "Cannot connect to server via SSH"
        exit 1
    fi
    print_success "SSH connection successful"
fi

# Check DNS resolution
print_status "🔍 Checking DNS resolution for $DOMAIN..."
RESOLVED_IP=$(dig +short $DOMAIN | tail -n1)
if [[ -z "$RESOLVED_IP" ]]; then
    print_error "Domain $DOMAIN does not resolve to any IP"
    print_error "Please ensure DNS records are configured correctly"
    exit 1
fi
print_success "Domain resolves to: $RESOLVED_IP"

# Check if backend service is running
print_status "🔍 Checking backend service..."
if ! execute_cmd "systemctl is-active --quiet finance-backend"; then
    print_error "Backend service is not running"
    print_error "Please run the backend deployment script first"
    exit 1
fi
print_success "Backend service is running"

# Create Nginx configuration
print_status "⚙️ Creating Nginx configuration..."
NGINX_CONFIG="server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN www.$DOMAIN;
    
    # Redirect HTTP to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;

    # SSL Configuration (will be updated by certbot)
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    
    # Modern SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # HSTS
    add_header Strict-Transport-Security \"max-age=31536000; includeSubDomains\" always;
    
    # Security headers
    add_header X-Frame-Options SAMEORIGIN always;
    add_header X-XSS-Protection \"1; mode=block\" always;
    add_header X-Content-Type-Options nosniff always;
    add_header Referrer-Policy \"no-referrer-when-downgrade\" always;
    
    # CORS headers for API
    add_header Access-Control-Allow-Origin \"*\" always;
    add_header Access-Control-Allow-Methods \"GET, POST, PUT, DELETE, OPTIONS\" always;
    add_header Access-Control-Allow-Headers \"Content-Type, Authorization, X-Requested-With\" always;
    
    # Handle preflight requests
    if (\$request_method = 'OPTIONS') {
        add_header Access-Control-Allow-Origin \"*\";
        add_header Access-Control-Allow-Methods \"GET, POST, PUT, DELETE, OPTIONS\";
        add_header Access-Control-Allow-Headers \"Content-Type, Authorization, X-Requested-With\";
        add_header Access-Control-Max-Age 86400;
        add_header Content-Length 0;
        add_header Content-Type text/plain;
        return 204;
    }
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # Rate limiting for API
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        limit_req_status 429;
        
        # Proxy to backend
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Health check endpoint
    location = /api/health {
        access_log off;
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Root location
    location / {
        return 200 '{\"message\":\"Finance Backend API\",\"status\":\"active\",\"domain\":\"$DOMAIN\"}';
        add_header Content-Type application/json;
    }
    
    # Security.txt
    location = /.well-known/security.txt {
        return 200 \"Contact: $EMAIL\\nExpires: \$(date -d '+1 year' --iso-8601)\\n\";
        add_header Content-Type text/plain;
    }
}

# Rate limiting zone
limit_req_zone \$binary_remote_addr zone=api:10m rate=10r/s;"

create_file "/etc/nginx/sites-available/$DOMAIN" "$NGINX_CONFIG"

# Create rate limiting configuration in main nginx.conf if not exists
print_status "⚙️ Updating Nginx main configuration..."
execute_cmd "grep -q 'limit_req_zone' /etc/nginx/nginx.conf || sed -i '/http {/a\\tlimit_req_zone \$binary_remote_addr zone=api:10m rate=10r/s;' /etc/nginx/nginx.conf"

# Enable the site
print_status "🔗 Enabling Nginx site..."
execute_cmd "ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/"

# Remove default site if it exists
execute_cmd "rm -f /etc/nginx/sites-enabled/default"

# Test Nginx configuration
print_status "🧪 Testing Nginx configuration..."
if ! execute_cmd "nginx -t"; then
    print_error "Nginx configuration test failed"
    exit 1
fi
print_success "Nginx configuration is valid"

# Reload Nginx
print_status "🔄 Reloading Nginx..."
execute_cmd "systemctl reload nginx"

# Wait for Nginx to reload
sleep 2

# Test HTTP access (should redirect to HTTPS)
print_status "🧪 Testing HTTP access..."
HTTP_STATUS=$(execute_cmd "curl -s -o /dev/null -w '%{http_code}' http://$DOMAIN/api/health")
if [[ "$HTTP_STATUS" == "301" ]] || [[ "$HTTP_STATUS" == "200" ]]; then
    print_success "HTTP access working (status: $HTTP_STATUS)"
else
    print_warning "HTTP access returned status: $HTTP_STATUS"
fi

# Obtain SSL certificate
print_status "🔒 Obtaining SSL certificate from Let's Encrypt..."
CERTBOT_CMD="certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email $EMAIL --redirect"

if execute_cmd "$CERTBOT_CMD"; then
    print_success "SSL certificate obtained successfully!"
else
    print_error "Failed to obtain SSL certificate"
    print_error "Please check:"
    print_error "1. Domain DNS is correctly configured"
    print_error "2. Port 80 and 443 are accessible"
    print_error "3. No firewall blocking Let's Encrypt"
    exit 1
fi

# Test HTTPS access
print_status "🧪 Testing HTTPS access..."
sleep 5  # Wait for SSL to be fully configured

HTTPS_STATUS=$(execute_cmd "curl -s -o /dev/null -w '%{http_code}' https://$DOMAIN/api/health")
if [[ "$HTTPS_STATUS" == "200" ]]; then
    print_success "HTTPS access working!"
    
    # Get certificate info
    CERT_INFO=$(execute_cmd "openssl s_client -connect $DOMAIN:443 -servername $DOMAIN 2>/dev/null | openssl x509 -noout -dates")
    print_status "📜 Certificate information:"
    echo "$CERT_INFO"
else
    print_warning "HTTPS access returned status: $HTTPS_STATUS"
fi

# Set up auto-renewal
print_status "🔄 Setting up SSL certificate auto-renewal..."
CRON_JOB="0 12 * * * /usr/bin/certbot renew --quiet && /usr/bin/systemctl reload nginx"
execute_cmd "(crontab -l 2>/dev/null | grep -v certbot; echo '$CRON_JOB') | crontab -"
print_success "Auto-renewal configured"

# Create monitoring script
print_status "📊 Creating monitoring script..."
MONITOR_SCRIPT="#!/bin/bash
# Finance Backend Monitoring Script

DOMAIN=\"$DOMAIN\"
EMAIL=\"$EMAIL\"
LOG_FILE=\"/var/log/finance-backend/monitor.log\"

# Function to log with timestamp
log() {
    echo \"\$(date '+%Y-%m-%d %H:%M:%S') - \$1\" >> \"\$LOG_FILE\"
}

# Check backend service
if ! systemctl is-active --quiet finance-backend; then
    log \"ERROR: Backend service is down\"
    systemctl restart finance-backend
    log \"INFO: Attempted to restart backend service\"
fi

# Check Nginx
if ! systemctl is-active --quiet nginx; then
    log \"ERROR: Nginx is down\"
    systemctl restart nginx
    log \"INFO: Attempted to restart Nginx\"
fi

# Check API health
HTTP_STATUS=\$(curl -s -o /dev/null -w '%{http_code}' https://\$DOMAIN/api/health)
if [[ \"\$HTTP_STATUS\" != \"200\" ]]; then
    log \"ERROR: API health check failed (status: \$HTTP_STATUS)\"
else
    log \"INFO: API health check passed\"
fi

# Check SSL certificate expiry
DAYS_UNTIL_EXPIRY=\$(openssl s_client -connect \$DOMAIN:443 -servername \$DOMAIN 2>/dev/null | openssl x509 -noout -checkend \$((30*24*3600)) && echo \"OK\" || echo \"EXPIRING\")
if [[ \"\$DAYS_UNTIL_EXPIRY\" == \"EXPIRING\" ]]; then
    log \"WARNING: SSL certificate expires within 30 days\"
fi"

create_file "/usr/local/bin/finance-monitor.sh" "$MONITOR_SCRIPT"
execute_cmd "chmod +x /usr/local/bin/finance-monitor.sh"

# Add monitoring to cron
MONITOR_CRON="*/5 * * * * /usr/local/bin/finance-monitor.sh"
execute_cmd "(crontab -l 2>/dev/null | grep -v finance-monitor; echo '$MONITOR_CRON') | crontab -"
print_success "Monitoring script configured"

# Create deployment summary
SUMMARY_FILE="/root/domain-ssl-summary.txt"
SUMMARY_CONTENT="Finance Backend Domain & SSL Configuration Summary
===================================================
Date: $(date)
Domain: $DOMAIN
Email: $EMAIL
SSL Certificate: Let's Encrypt

Configuration Files:
- Nginx: /etc/nginx/sites-available/$DOMAIN
- SSL Certificate: /etc/letsencrypt/live/$DOMAIN/
- Monitoring: /usr/local/bin/finance-monitor.sh

API Endpoints:
- Health Check: https://$DOMAIN/api/health
- API Base: https://$DOMAIN/api
- Test Connection: https://$DOMAIN/api/test-connection

Services:
- Backend: systemctl status finance-backend
- Nginx: systemctl status nginx
- SSL Auto-renewal: certbot renew --dry-run

Monitoring:
- Service monitoring every 5 minutes
- SSL certificate expiry alerts
- Logs: /var/log/finance-backend/monitor.log

Security Features:
- HTTPS redirect
- HSTS headers
- Security headers (XSS, CSRF, etc.)
- Rate limiting (10 req/sec per IP)
- CORS configured for API access

Next Steps:
1. Update React Native app to use https://$DOMAIN/api
2. Test all API endpoints
3. Monitor logs for any issues
4. Set up database if needed"

create_file "$SUMMARY_FILE" "$SUMMARY_CONTENT"

print_success "🎉 Domain and SSL setup completed successfully!"
print_status "📋 Configuration summary saved to: $SUMMARY_FILE"
print_status ""
print_status "🌐 Your API is now available at:"
print_status "   https://$DOMAIN/api"
print_status "   https://$DOMAIN/api/health"
print_status ""
print_status "🔧 Final steps:"
print_status "1. Update your React Native app configuration"
print_status "2. Test all API endpoints"
print_status "3. Monitor the application logs"
print_status ""
print_status "📊 Useful commands:"
print_status "   systemctl status finance-backend"
print_status "   systemctl status nginx"
print_status "   tail -f /var/log/finance-backend/monitor.log"
print_status "   certbot certificates" 