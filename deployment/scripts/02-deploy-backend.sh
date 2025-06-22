#!/bin/bash

# Finance Backend - Application Deployment Script
# This script deploys the Node.js backend application to the server

set -e

# Configuration
REPO_URL="https://github.com/your-username/finance-backend.git"  # Update with your repo
LOCAL_BACKEND_PATH="../backend"  # Path to your local backend code
SERVER_IP=""
DOMAIN=""

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
    echo "Usage: $0 -s SERVER_IP [-d DOMAIN] [-r REPO_URL]"
    echo ""
    echo "Options:"
    echo "  -s SERVER_IP    IP address of the target server (required)"
    echo "  -d DOMAIN       Domain name (optional, will use IP if not provided)"
    echo "  -r REPO_URL     Git repository URL (optional, will use local files)"
    echo ""
    echo "Examples:"
    echo "  $0 -s 157.180.90.43"
    echo "  $0 -s 157.180.90.43 -d jas-technologies.in"
    echo "  $0 -s 157.180.90.43 -d jas-technologies.in -r https://github.com/user/repo.git"
}

# Parse command line arguments
while getopts "s:d:r:h" opt; do
    case $opt in
        s)
            SERVER_IP="$OPTARG"
            ;;
        d)
            DOMAIN="$OPTARG"
            ;;
        r)
            REPO_URL="$OPTARG"
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
if [[ -z "$SERVER_IP" ]]; then
    print_error "Server IP is required"
    show_usage
    exit 1
fi

print_status "🚀 Starting Finance Backend Deployment..."
print_status "📡 Target Server: $SERVER_IP"
if [[ -n "$DOMAIN" ]]; then
    print_status "🌐 Domain: $DOMAIN"
fi

# Test SSH connection
print_status "🔐 Testing SSH connection..."
if ! ssh -o ConnectTimeout=10 -o BatchMode=yes root@$SERVER_IP exit 2>/dev/null; then
    print_error "Cannot connect to server via SSH"
    print_error "Please ensure:"
    print_error "1. SSH key is configured"
    print_error "2. Server is accessible"
    print_error "3. Root access is available"
    exit 1
fi
print_success "SSH connection successful"

# Create deployment package
print_status "📦 Creating deployment package..."
TEMP_DIR=$(mktemp -d)
PACKAGE_NAME="finance-backend-$(date +%Y%m%d-%H%M%S).tar.gz"

if [[ -n "$REPO_URL" ]]; then
    print_status "📥 Cloning from repository..."
    git clone "$REPO_URL" "$TEMP_DIR/finance-backend"
else
    print_status "📁 Using local backend files..."
    if [[ ! -d "$LOCAL_BACKEND_PATH" ]]; then
        print_error "Local backend path not found: $LOCAL_BACKEND_PATH"
        exit 1
    fi
    cp -r "$LOCAL_BACKEND_PATH" "$TEMP_DIR/finance-backend"
fi

# Create the backend application files
cd "$TEMP_DIR/finance-backend"

# Create package.json if it doesn't exist
if [[ ! -f "package.json" ]]; then
    print_status "📋 Creating package.json..."
    cat > package.json << 'EOF'
{
  "name": "finance-backend",
  "version": "1.0.0",
  "description": "Finance Backend API Server",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "express-rate-limit": "^6.7.0",
    "dotenv": "^16.0.3",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.0",
    "mongoose": "^7.0.3",
    "express-validator": "^6.15.0",
    "morgan": "^1.10.0",
    "compression": "^1.7.4"
  },
  "devDependencies": {
    "nodemon": "^2.0.22"
  },
  "engines": {
    "node": ">=18.0.0"
  },
  "keywords": ["finance", "api", "backend", "express"],
  "author": "Your Name",
  "license": "MIT"
}
EOF
fi

# Create server.js if it doesn't exist
if [[ ! -f "server.js" ]]; then
    print_status "📋 Creating server.js..."
    cat > server.js << 'EOF'
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https:"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(limiter);

// CORS configuration
app.use(cors({
    origin: ['http://localhost:3000', 'https://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan('combined'));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Finance Backend Server is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// API routes
app.get('/api', (req, res) => {
    res.json({
        message: 'Finance Backend API',
        version: '1.0.0',
        endpoints: {
            health: '/api/health',
            auth: '/api/auth',
            users: '/api/users'
        }
    });
});

// Auth routes
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { email, password, name } = req.body;
        
        // Basic validation
        if (!email || !password || !name) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Simulate user creation (replace with actual database logic)
        const user = {
            id: Date.now(),
            email,
            name,
            createdAt: new Date().toISOString()
        };

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: user
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Basic validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Simulate authentication (replace with actual logic)
        const user = {
            id: 1,
            email,
            name: 'Test User'
        };

        res.json({
            success: true,
            message: 'Login successful',
            data: user,
            token: 'sample-jwt-token'
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Test connectivity endpoint
app.get('/api/test-connection', (req, res) => {
    res.json({
        success: true,
        message: 'Connection successful',
        server: 'Finance Backend',
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!'
    });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Finance Backend Server running on port ${PORT}`);
    console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;
EOF
fi

# Create .env file
if [[ ! -f ".env" ]]; then
    print_status "📋 Creating .env file..."
    cat > .env << 'EOF'
NODE_ENV=production
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
DB_CONNECTION_STRING=mongodb://localhost:27017/finance
API_VERSION=v1
CORS_ORIGIN=*
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
EOF
fi

# Create .gitignore if it doesn't exist
if [[ ! -f ".gitignore" ]]; then
    cat > .gitignore << 'EOF'
node_modules/
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
logs/
*.log
.DS_Store
coverage/
.nyc_output/
EOF
fi

# Create the package
cd "$TEMP_DIR"
tar -czf "$PACKAGE_NAME" finance-backend/
print_success "Package created: $PACKAGE_NAME"

# Upload package to server
print_status "📤 Uploading package to server..."
scp "$PACKAGE_NAME" root@$SERVER_IP:/tmp/

# Deploy on server
print_status "🚀 Deploying application on server..."
ssh root@$SERVER_IP << EOF
set -e

# Stop existing service if running
if systemctl is-active --quiet finance-backend; then
    echo "Stopping existing service..."
    systemctl stop finance-backend
fi

# Backup existing deployment
if [[ -d "/var/www/finance-backend" ]]; then
    echo "Backing up existing deployment..."
    tar -czf "/var/backups/finance-backend/backup-\$(date +%Y%m%d-%H%M%S).tar.gz" -C /var/www finance-backend
fi

# Extract new deployment
echo "Extracting new deployment..."
cd /tmp
tar -xzf "$PACKAGE_NAME"
rm -rf /var/www/finance-backend/*
cp -r finance-backend/* /var/www/finance-backend/
chown -R finance:finance /var/www/finance-backend

# Install dependencies
echo "Installing dependencies..."
cd /var/www/finance-backend
npm install --production

# Start the service
echo "Starting finance-backend service..."
systemctl start finance-backend
systemctl enable finance-backend

# Wait for service to start
sleep 5

# Check service status
if systemctl is-active --quiet finance-backend; then
    echo "✅ Service started successfully"
    systemctl status finance-backend --no-pager
else
    echo "❌ Service failed to start"
    journalctl -u finance-backend --no-pager -n 20
    exit 1
fi

# Test the API
echo "🧪 Testing API..."
curl -f http://localhost:5000/api/health || echo "API test failed"

# Cleanup
rm -f /tmp/$PACKAGE_NAME
rm -rf /tmp/finance-backend
EOF

# Cleanup local temp files
rm -rf "$TEMP_DIR"

print_success "🎉 Backend deployment completed successfully!"
print_status "🌐 API should be available at:"
if [[ -n "$DOMAIN" ]]; then
    print_status "   https://$DOMAIN/api"
    print_status "   https://$DOMAIN/api/health"
else
    print_status "   http://$SERVER_IP:5000/api"
    print_status "   http://$SERVER_IP:5000/api/health"
fi

print_status "🔧 Next steps:"
print_status "1. Configure domain and SSL (if using domain)"
print_status "2. Set up Nginx reverse proxy"
print_status "3. Test the API endpoints"
print_status "4. Update your React Native app configuration" 