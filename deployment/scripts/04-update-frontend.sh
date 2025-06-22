#!/bin/bash

# Finance Backend - Frontend Update Script
# This script updates the React Native app configuration with new domain

set -e

# Configuration
DOMAIN=""
PROJECT_PATH=""

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
    echo "Usage: $0 -d DOMAIN [-p PROJECT_PATH]"
    echo ""
    echo "Options:"
    echo "  -d DOMAIN       Domain name (required)"
    echo "  -p PROJECT_PATH Path to React Native project (optional, defaults to current directory)"
    echo ""
    echo "Examples:"
    echo "  $0 -d jas-technologies.in"
    echo "  $0 -d jas-technologies.in -p /path/to/react-native-project"
}

# Parse command line arguments
while getopts "d:p:h" opt; do
    case $opt in
        d)
            DOMAIN="$OPTARG"
            ;;
        p)
            PROJECT_PATH="$OPTARG"
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
if [[ -z "$DOMAIN" ]]; then
    print_error "Domain is required"
    show_usage
    exit 1
fi

# Set default project path if not provided
if [[ -z "$PROJECT_PATH" ]]; then
    PROJECT_PATH="$(pwd)"
fi

print_status "🚀 Updating React Native frontend configuration..."
print_status "🌐 Domain: $DOMAIN"
print_status "📁 Project Path: $PROJECT_PATH"

# Check if project path exists
if [[ ! -d "$PROJECT_PATH" ]]; then
    print_error "Project path does not exist: $PROJECT_PATH"
    exit 1
fi

# Check if it's a React Native project
if [[ ! -f "$PROJECT_PATH/package.json" ]]; then
    print_error "Not a valid React Native project (package.json not found)"
    exit 1
fi

cd "$PROJECT_PATH"

# Find and update auth.js file
AUTH_FILE="src/connections/auth.js"
if [[ -f "$AUTH_FILE" ]]; then
    print_status "📝 Updating $AUTH_FILE..."
    
    # Create backup
    cp "$AUTH_FILE" "$AUTH_FILE.backup.$(date +%Y%m%d-%H%M%S)"
    print_status "📋 Backup created: $AUTH_FILE.backup.$(date +%Y%m%d-%H%M%S)"
    
    # Update the API base URL
    sed -i "s|https://[^/]*/api|https://$DOMAIN/api|g" "$AUTH_FILE"
    sed -i "s|http://[^/]*/api|https://$DOMAIN/api|g" "$AUTH_FILE"
    
    print_success "Updated API base URL in $AUTH_FILE"
else
    print_warning "$AUTH_FILE not found, creating new one..."
    
    # Create directory if it doesn't exist
    mkdir -p "$(dirname "$AUTH_FILE")"
    
    # Create new auth.js file
    cat > "$AUTH_FILE" << EOF
// API Configuration
// Use different URLs based on environment
const getBaseURL = () => {
  if (__DEV__) {
    return 'https://$DOMAIN/api'; // Using domain with proper SSL
  } else {
    return 'https://$DOMAIN/api'; // Using domain with proper SSL
  }
};

const BASE_URL = getBaseURL();

// Export configuration
export const API_CONFIG = {
  BASE_URL,
  ENDPOINTS: {
    HEALTH: '/health',
    TEST_CONNECTION: '/test-connection',
    AUTH: {
      SIGNUP: '/auth/signup',
      LOGIN: '/auth/login',
    },
  },
  TIMEOUT: 10000, // 10 seconds
};

// Helper function to make API requests
export const apiRequest = async (endpoint, options = {}) => {
  const url = \`\${BASE_URL}\${endpoint}\`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    timeout: API_CONFIG.TIMEOUT,
  };

  const requestOptions = {
    ...defaultOptions,
    ...options,
  };

  try {
    console.log('🌐 API Request:', url);
    const response = await fetch(url, requestOptions);
    
    if (!response.ok) {
      throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
    }
    
    const data = await response.json();
    console.log('✅ API Response:', data);
    return data;
  } catch (error) {
    console.error('❌ API Error:', error);
    throw error;
  }
};

// Test connection function
export const testConnection = async () => {
  try {
    const response = await apiRequest(API_CONFIG.ENDPOINTS.TEST_CONNECTION);
    return {
      success: true,
      data: response,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

// Health check function
export const healthCheck = async () => {
  try {
    const response = await apiRequest(API_CONFIG.ENDPOINTS.HEALTH);
    return {
      success: true,
      data: response,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

export default API_CONFIG;
EOF
    
    print_success "Created new $AUTH_FILE"
fi

# Update network security config for Android
NETWORK_CONFIG_FILE="android/app/src/main/res/xml/network_security_config.xml"
if [[ -f "$NETWORK_CONFIG_FILE" ]]; then
    print_status "📝 Updating Android network security config..."
    
    # Create backup
    cp "$NETWORK_CONFIG_FILE" "$NETWORK_CONFIG_FILE.backup.$(date +%Y%m%d-%H%M%S)"
    
    # Update domain in network security config
    sed -i "s/<domain[^>]*>[^<]*<\/domain>/<domain includeSubdomains=\"false\">$DOMAIN<\/domain>/g" "$NETWORK_CONFIG_FILE"
    
    print_success "Updated Android network security config"
else
    print_warning "Android network security config not found, creating new one..."
    
    # Create directory if it doesn't exist
    mkdir -p "$(dirname "$NETWORK_CONFIG_FILE")"
    
    # Create new network security config
    cat > "$NETWORK_CONFIG_FILE" << EOF
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <domain-config cleartextTrafficPermitted="false">
        <domain includeSubdomains="false">$DOMAIN</domain>
        <trust-anchors>
            <certificates src="system"/>
            <certificates src="user"/>
        </trust-anchors>
    </domain-config>
    
    <base-config cleartextTrafficPermitted="false">
        <trust-anchors>
            <certificates src="system"/>
            <certificates src="user"/>
        </trust-anchors>
    </base-config>
</network-security-config>
EOF
    
    print_success "Created Android network security config"
fi

# Update AndroidManifest.xml to use network security config
MANIFEST_FILE="android/app/src/main/AndroidManifest.xml"
if [[ -f "$MANIFEST_FILE" ]]; then
    print_status "📝 Checking AndroidManifest.xml..."
    
    if ! grep -q "networkSecurityConfig" "$MANIFEST_FILE"; then
        print_status "Adding network security config to AndroidManifest.xml..."
        
        # Create backup
        cp "$MANIFEST_FILE" "$MANIFEST_FILE.backup.$(date +%Y%m%d-%H%M%S)"
        
        # Add network security config
        sed -i 's/<application/& android:networkSecurityConfig="@xml\/network_security_config"/' "$MANIFEST_FILE"
        
        print_success "Added network security config to AndroidManifest.xml"
    else
        print_success "AndroidManifest.xml already has network security config"
    fi
else
    print_warning "AndroidManifest.xml not found"
fi

# Update any environment files
ENV_FILES=(".env" ".env.local" ".env.production")
for env_file in "${ENV_FILES[@]}"; do
    if [[ -f "$env_file" ]]; then
        print_status "📝 Updating $env_file..."
        
        # Create backup
        cp "$env_file" "$env_file.backup.$(date +%Y%m%d-%H%M%S)"
        
        # Update API URL in env file
        sed -i "s|API_URL=.*|API_URL=https://$DOMAIN/api|g" "$env_file"
        sed -i "s|REACT_APP_API_URL=.*|REACT_APP_API_URL=https://$DOMAIN/api|g" "$env_file"
        
        print_success "Updated $env_file"
    fi
done

# Check for other config files that might need updating
CONFIG_FILES=(
    "src/config/api.js"
    "src/config/config.js"
    "src/constants/api.js"
    "src/utils/api.js"
    "config/api.js"
)

for config_file in "${CONFIG_FILES[@]}"; do
    if [[ -f "$config_file" ]]; then
        print_status "📝 Found config file: $config_file"
        
        # Create backup
        cp "$config_file" "$config_file.backup.$(date +%Y%m%d-%H%M%S)"
        
        # Update URLs in config file
        sed -i "s|https://[^/]*/api|https://$DOMAIN/api|g" "$config_file"
        sed -i "s|http://[^/]*/api|https://$DOMAIN/api|g" "$config_file"
        
        print_success "Updated $config_file"
    fi
done

# Create a test script
TEST_SCRIPT="scripts/test-api.js"
mkdir -p "$(dirname "$TEST_SCRIPT")"

cat > "$TEST_SCRIPT" << EOF
#!/usr/bin/env node

// API Test Script for Finance Backend
const https = require('https');

const DOMAIN = '$DOMAIN';
const API_BASE = \`https://\${DOMAIN}/api\`;

// Test endpoints
const endpoints = [
    '/health',
    '/test-connection',
    '/',
];

function testEndpoint(endpoint) {
    return new Promise((resolve, reject) => {
        const url = \`\${API_BASE}\${endpoint}\`;
        console.log(\`🧪 Testing: \${url}\`);
        
        const req = https.get(url, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    console.log(\`✅ \${endpoint}: \${res.statusCode} - \${JSON.stringify(jsonData)}\`);
                    resolve({ endpoint, status: res.statusCode, data: jsonData });
                } catch (e) {
                    console.log(\`✅ \${endpoint}: \${res.statusCode} - \${data}\`);
                    resolve({ endpoint, status: res.statusCode, data });
                }
            });
        });
        
        req.on('error', (error) => {
            console.log(\`❌ \${endpoint}: Error - \${error.message}\`);
            reject({ endpoint, error: error.message });
        });
        
        req.setTimeout(10000, () => {
            console.log(\`⏰ \${endpoint}: Timeout\`);
            req.destroy();
            reject({ endpoint, error: 'Timeout' });
        });
    });
}

async function runTests() {
    console.log(\`🚀 Testing Finance Backend API at: \${API_BASE}\`);
    console.log('=' .repeat(50));
    
    const results = [];
    
    for (const endpoint of endpoints) {
        try {
            const result = await testEndpoint(endpoint);
            results.push(result);
        } catch (error) {
            results.push(error);
        }
    }
    
    console.log('\\n📊 Test Results Summary:');
    console.log('=' .repeat(50));
    
    let passed = 0;
    let failed = 0;
    
    results.forEach(result => {
        if (result.status && result.status >= 200 && result.status < 300) {
            console.log(\`✅ \${result.endpoint}: PASSED (\${result.status})\`);
            passed++;
        } else {
            console.log(\`❌ \${result.endpoint}: FAILED (\${result.error || result.status})\`);
            failed++;
        }
    });
    
    console.log(\`\\n📈 Total: \${results.length}, Passed: \${passed}, Failed: \${failed}\`);
    
    if (failed === 0) {
        console.log('🎉 All tests passed! Your API is working correctly.');
    } else {
        console.log('⚠️  Some tests failed. Please check your server configuration.');
        process.exit(1);
    }
}

runTests().catch(console.error);
EOF

chmod +x "$TEST_SCRIPT"
print_success "Created API test script: $TEST_SCRIPT"

# Update package.json scripts
if [[ -f "package.json" ]]; then
    print_status "📝 Updating package.json scripts..."
    
    # Create backup
    cp "package.json" "package.json.backup.$(date +%Y%m%d-%H%M%S)"
    
    # Add test script if it doesn't exist
    if ! grep -q '"test-api"' package.json; then
        # Use Node.js to update package.json properly
        node -e "
        const fs = require('fs');
        const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        if (!pkg.scripts) pkg.scripts = {};
        pkg.scripts['test-api'] = 'node scripts/test-api.js';
        fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
        "
        print_success "Added test-api script to package.json"
    fi
fi

# Create summary file
SUMMARY_FILE="deployment-frontend-update-$(date +%Y%m%d-%H%M%S).txt"
cat > "$SUMMARY_FILE" << EOF
Finance Frontend Update Summary
===============================
Date: $(date)
Domain: $DOMAIN
Project Path: $PROJECT_PATH

Files Updated:
- $AUTH_FILE
- $NETWORK_CONFIG_FILE
- $MANIFEST_FILE
- Environment files (.env, .env.local, .env.production)
- Configuration files (if found)

New Files Created:
- $TEST_SCRIPT
- Backup files with timestamp

API Configuration:
- Base URL: https://$DOMAIN/api
- Health Check: https://$DOMAIN/api/health
- Test Connection: https://$DOMAIN/api/test-connection

Next Steps:
1. Build new release APK: cd android && ./gradlew assembleRelease
2. Test API connectivity: npm run test-api
3. Install and test the updated app
4. Monitor logs for any issues

Commands to run:
cd $PROJECT_PATH
npm run test-api
cd android && ./gradlew assembleRelease
EOF

print_success "🎉 Frontend update completed successfully!"
print_status "📋 Summary saved to: $SUMMARY_FILE"
print_status ""
print_status "🔧 Next steps:"
print_status "1. Test API connectivity: npm run test-api"
print_status "2. Build new release APK: cd android && ./gradlew assembleRelease"
print_status "3. Install and test the updated app"
print_status ""
print_status "📱 Your React Native app is now configured to use:"
print_status "   https://$DOMAIN/api" 