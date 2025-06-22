#!/bin/bash

# Finance Backend - Master Deployment Script
# This script orchestrates the complete deployment process

set -e

# Configuration
SERVER_IP=""
DOMAIN=""
EMAIL=""
REPO_URL=""
PROJECT_PATH=""
SKIP_SETUP=false
SKIP_BACKEND=false
SKIP_DOMAIN=false
SKIP_FRONTEND=false

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_header() {
    echo -e "${PURPLE}================================${NC}"
    echo -e "${PURPLE}$1${NC}"
    echo -e "${PURPLE}================================${NC}"
}

print_step() {
    echo -e "${CYAN}[STEP]${NC} $1"
}

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
    echo "Finance Backend - Master Deployment Script"
    echo ""
    echo "Usage: $0 -s SERVER_IP -d DOMAIN -e EMAIL [OPTIONS]"
    echo ""
    echo "Required Options:"
    echo "  -s SERVER_IP    IP address of the target server"
    echo "  -d DOMAIN       Domain name"
    echo "  -e EMAIL        Email for SSL certificate"
    echo ""
    echo "Optional Options:"
    echo "  -r REPO_URL     Git repository URL (optional, will use local files)"
    echo "  -p PROJECT_PATH Path to React Native project (defaults to current directory)"
    echo "  --skip-setup    Skip initial server setup"
    echo "  --skip-backend  Skip backend deployment"
    echo "  --skip-domain   Skip domain and SSL setup"
    echo "  --skip-frontend Skip frontend configuration update"
    echo ""
    echo "Examples:"
    echo "  $0 -s 157.180.90.43 -d jas-technologies.in -e admin@jas-technologies.in"
    echo "  $0 -s 157.180.90.43 -d jas-technologies.in -e admin@jas-technologies.in --skip-setup"
    echo "  $0 -s 157.180.90.43 -d jas-technologies.in -e admin@jas-technologies.in -p /path/to/react-native"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -s|--server)
            SERVER_IP="$2"
            shift 2
            ;;
        -d|--domain)
            DOMAIN="$2"
            shift 2
            ;;
        -e|--email)
            EMAIL="$2"
            shift 2
            ;;
        -r|--repo)
            REPO_URL="$2"
            shift 2
            ;;
        -p|--project-path)
            PROJECT_PATH="$2"
            shift 2
            ;;
        --skip-setup)
            SKIP_SETUP=true
            shift
            ;;
        --skip-backend)
            SKIP_BACKEND=true
            shift
            ;;
        --skip-domain)
            SKIP_DOMAIN=true
            shift
            ;;
        --skip-frontend)
            SKIP_FRONTEND=true
            shift
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Validate required parameters
if [[ -z "$SERVER_IP" ]] || [[ -z "$DOMAIN" ]] || [[ -z "$EMAIL" ]]; then
    print_error "Server IP, domain, and email are required"
    show_usage
    exit 1
fi

# Set default project path if not provided
if [[ -z "$PROJECT_PATH" ]]; then
    PROJECT_PATH="$(pwd)"
fi

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

print_header "Finance Backend Deployment"
print_status "🚀 Starting deployment process..."
print_status "📡 Server IP: $SERVER_IP"
print_status "🌐 Domain: $DOMAIN"
print_status "📧 Email: $EMAIL"
if [[ -n "$REPO_URL" ]]; then
    print_status "📦 Repository: $REPO_URL"
fi
print_status "📁 Project Path: $PROJECT_PATH"
echo ""

# Check if scripts exist
SCRIPTS=(
    "scripts/01-initial-server-setup.sh"
    "scripts/02-deploy-backend.sh"
    "scripts/03-setup-domain-ssl.sh"
    "scripts/04-update-frontend.sh"
)

for script in "${SCRIPTS[@]}"; do
    if [[ ! -f "$SCRIPT_DIR/$script" ]]; then
        print_error "Script not found: $SCRIPT_DIR/$script"
        exit 1
    fi
done

print_success "All deployment scripts found"

# Test SSH connection
print_step "Testing SSH connection to server..."
if ! ssh -o ConnectTimeout=10 -o BatchMode=yes root@$SERVER_IP exit 2>/dev/null; then
    print_error "Cannot connect to server via SSH"
    print_error "Please ensure:"
    print_error "1. SSH key is configured"
    print_error "2. Server is accessible"
    print_error "3. Root access is available"
    exit 1
fi
print_success "SSH connection successful"

# Step 1: Initial Server Setup
if [[ "$SKIP_SETUP" == false ]]; then
    print_header "Step 1: Initial Server Setup"
    print_step "Configuring server with necessary packages and security..."
    
    # Upload and run initial setup script
    scp "$SCRIPT_DIR/scripts/01-initial-server-setup.sh" root@$SERVER_IP:/tmp/
    ssh root@$SERVER_IP "chmod +x /tmp/01-initial-server-setup.sh && /tmp/01-initial-server-setup.sh"
    
    print_success "Initial server setup completed"
else
    print_warning "Skipping initial server setup"
fi

# Step 2: Backend Deployment
if [[ "$SKIP_BACKEND" == false ]]; then
    print_header "Step 2: Backend Application Deployment"
    print_step "Deploying backend application..."
    
    cd "$SCRIPT_DIR"
    chmod +x scripts/02-deploy-backend.sh
    
    if [[ -n "$REPO_URL" ]]; then
        ./scripts/02-deploy-backend.sh -s "$SERVER_IP" -d "$DOMAIN" -r "$REPO_URL"
    else
        ./scripts/02-deploy-backend.sh -s "$SERVER_IP" -d "$DOMAIN"
    fi
    
    print_success "Backend deployment completed"
else
    print_warning "Skipping backend deployment"
fi

# Step 3: Domain and SSL Setup
if [[ "$SKIP_DOMAIN" == false ]]; then
    print_header "Step 3: Domain and SSL Configuration"
    print_step "Setting up domain and SSL certificates..."
    
    cd "$SCRIPT_DIR"
    chmod +x scripts/03-setup-domain-ssl.sh
    ./scripts/03-setup-domain-ssl.sh -d "$DOMAIN" -e "$EMAIL" -s "$SERVER_IP"
    
    print_success "Domain and SSL setup completed"
else
    print_warning "Skipping domain and SSL setup"
fi

# Step 4: Frontend Configuration Update
if [[ "$SKIP_FRONTEND" == false ]]; then
    print_header "Step 4: Frontend Configuration Update"
    print_step "Updating React Native app configuration..."
    
    cd "$SCRIPT_DIR"
    chmod +x scripts/04-update-frontend.sh
    ./scripts/04-update-frontend.sh -d "$DOMAIN" -p "$PROJECT_PATH"
    
    print_success "Frontend configuration updated"
else
    print_warning "Skipping frontend configuration update"
fi

# Final verification
print_header "Deployment Verification"
print_step "Running final verification checks..."

# Check service status
print_status "Checking backend service status..."
SERVICE_STATUS=$(ssh root@$SERVER_IP "systemctl is-active finance-backend" || echo "inactive")
if [[ "$SERVICE_STATUS" == "active" ]]; then
    print_success "Backend service is running"
else
    print_error "Backend service is not running: $SERVICE_STATUS"
fi

# Check Nginx status
print_status "Checking Nginx status..."
NGINX_STATUS=$(ssh root@$SERVER_IP "systemctl is-active nginx" || echo "inactive")
if [[ "$NGINX_STATUS" == "active" ]]; then
    print_success "Nginx is running"
else
    print_error "Nginx is not running: $NGINX_STATUS"
fi

# Test API health
print_status "Testing API health endpoint..."
sleep 5  # Wait for services to be fully ready
API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN/api/health" || echo "000")
if [[ "$API_STATUS" == "200" ]]; then
    print_success "API health check passed"
else
    print_warning "API health check returned status: $API_STATUS"
fi

# Test SSL certificate
print_status "Checking SSL certificate..."
SSL_CHECK=$(echo | openssl s_client -connect "$DOMAIN:443" -servername "$DOMAIN" 2>/dev/null | openssl x509 -noout -issuer 2>/dev/null | grep -i "let's encrypt" && echo "OK" || echo "FAIL")
if [[ "$SSL_CHECK" == "OK" ]]; then
    print_success "SSL certificate is valid"
else
    print_warning "SSL certificate check failed"
fi

# Create deployment summary
SUMMARY_FILE="/tmp/deployment-summary-$(date +%Y%m%d-%H%M%S).txt"
cat > "$SUMMARY_FILE" << EOF
Finance Backend Deployment Summary
==================================
Date: $(date)
Server IP: $SERVER_IP
Domain: $DOMAIN
Email: $EMAIL

Deployment Status:
- Initial Setup: $([ "$SKIP_SETUP" == false ] && echo "✅ Completed" || echo "⏭️  Skipped")
- Backend Deployment: $([ "$SKIP_BACKEND" == false ] && echo "✅ Completed" || echo "⏭️  Skipped")
- Domain & SSL: $([ "$SKIP_DOMAIN" == false ] && echo "✅ Completed" || echo "⏭️  Skipped")
- Frontend Update: $([ "$SKIP_FRONTEND" == false ] && echo "✅ Completed" || echo "⏭️  Skipped")

Service Status:
- Backend Service: $SERVICE_STATUS
- Nginx Service: $NGINX_STATUS
- API Health: HTTP $API_STATUS
- SSL Certificate: $SSL_CHECK

API Endpoints:
- Base URL: https://$DOMAIN/api
- Health Check: https://$DOMAIN/api/health
- Test Connection: https://$DOMAIN/api/test-connection

Next Steps:
1. Test all API endpoints
2. Build and test React Native app
3. Monitor logs for any issues
4. Set up database if needed

Useful Commands:
- Check backend logs: ssh root@$SERVER_IP "journalctl -u finance-backend -f"
- Check Nginx logs: ssh root@$SERVER_IP "tail -f /var/log/nginx/error.log"
- Restart backend: ssh root@$SERVER_IP "systemctl restart finance-backend"
- Check SSL: openssl s_client -connect $DOMAIN:443 -servername $DOMAIN
EOF

print_header "Deployment Complete!"
print_success "🎉 Finance Backend deployment completed successfully!"
print_status "📋 Deployment summary saved to: $SUMMARY_FILE"
echo ""
print_status "🌐 Your API is now available at:"
print_status "   https://$DOMAIN/api"
print_status "   https://$DOMAIN/api/health"
echo ""
print_status "🔧 Next steps:"
print_status "1. Test your API endpoints"
print_status "2. Build and install your updated React Native app"
print_status "3. Monitor the application logs"
print_status "4. Set up your database if needed"
echo ""
print_status "📊 Monitoring commands:"
print_status "   ssh root@$SERVER_IP 'systemctl status finance-backend'"
print_status "   ssh root@$SERVER_IP 'journalctl -u finance-backend -f'"
print_status "   curl https://$DOMAIN/api/health"
echo ""

# Display summary
cat "$SUMMARY_FILE" 