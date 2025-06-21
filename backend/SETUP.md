# Finance App Backend - Setup Guide

## 🚀 Quick Setup

### 1. Install Dependencies
```bash
cd Finance/backend
npm install
```

### 2. Configure Environment Variables

Update the `.env` file with your actual credentials:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration (Already configured with your MongoDB Atlas)
MONGODB_URI=mongodb+srv://ayush:mypassword@cluster0.6rwkptj.mongodb.net/finance_app

# JWT Configuration
JWT_SECRET=finance_app_super_secure_jwt_secret_key_2024
JWT_EXPIRES_IN=7d

# Email Configuration (Gmail) - UPDATE THESE
EMAIL_USER=your_actual_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password

# OTP Configuration
OTP_EXPIRES_IN=10
OTP_LENGTH=6

# CORS Configuration
FRONTEND_URL=http://localhost:3000
```

### 3. Gmail App Password Setup

To enable email functionality:

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to [Google Account Settings](https://myaccount.google.com/)
   - Security → 2-Step Verification → App passwords
   - Select "Mail" and generate password
   - Copy the 16-character password (without spaces)
   - Update `EMAIL_USER` and `EMAIL_PASS` in `.env`

### 4. Start the Server

```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

You should see:
```
Server is running on port 5000
Environment: development
Connected to MongoDB
```

### 5. Test the API

```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Run comprehensive tests
node test-api.js
```

## 📱 React Native Integration

### Base URL Configuration

In your React Native app, configure the base URL:

```javascript
// For Android Emulator
const BASE_URL = 'http://10.0.2.2:5000/api';

// For iOS Simulator
const BASE_URL = 'http://localhost:5000/api';

// For Physical Device (replace with your computer's IP)
const BASE_URL = 'http://192.168.1.100:5000/api';
```

### Example API Calls

```javascript
import axios from 'axios';

const API = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Register user
const registerUser = async (userData) => {
  try {
    const response = await API.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Login user
const loginUser = async (credentials) => {
  try {
    const response = await API.post('/auth/login', credentials);
    // Store token for future requests
    API.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Verify email with OTP
const verifyEmail = async (email, otp) => {
  try {
    const response = await API.post('/auth/verify-email', { email, otp });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};
```

## 🔐 Authentication Flow

### 1. User Registration
```
POST /api/auth/register
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "phone": "+1234567890"
}
```

### 2. Email Verification
```
POST /api/auth/verify-email
{
  "email": "john@example.com",
  "otp": "123456"
}
```

### 3. User Login
```
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

### 4. Password Reset
```
# Step 1: Request reset OTP
POST /api/auth/forgot-password
{
  "email": "john@example.com"
}

# Step 2: Reset password with OTP
POST /api/auth/reset-password
{
  "email": "john@example.com",
  "otp": "123456",
  "newPassword": "NewSecurePass123"
}
```

## 🛡️ Security Features

- **Rate Limiting**: 5 auth attempts per 15 minutes
- **OTP Limiting**: 3 OTP requests per 5 minutes
- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: 7-day expiration
- **Input Validation**: Comprehensive validation rules
- **CORS Protection**: Configurable origins
- **Security Headers**: Helmet.js protection

## 🗄️ Database

The backend connects to your MongoDB Atlas cluster:
- **Database**: `finance_app`
- **Collections**: `users`, `otps`
- **Connection**: Already configured in `.env`

## 📧 Email Templates

The backend includes beautiful HTML email templates for:
- **Email Verification**: OTP with branded design
- **Welcome Email**: Sent after successful verification
- **Password Reset**: OTP for password reset
- **Reset Confirmation**: Confirmation after password change

## 🧪 Testing

Run the test script to verify all endpoints:

```bash
node test-api.js
```

This will test:
- Health check
- User registration
- Login attempt
- Forgot password
- Resend verification OTP

## 🚨 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Check your internet connection
   - Verify MongoDB Atlas credentials
   - Ensure IP whitelist includes your IP

2. **Email Not Sending**
   - Verify Gmail credentials in `.env`
   - Check Gmail App Password setup
   - Ensure 2FA is enabled on Gmail

3. **Port Already in Use**
   ```bash
   # Kill process on port 5000
   sudo lsof -t -i tcp:5000 | xargs kill -9
   ```

4. **CORS Errors**
   - Update `FRONTEND_URL` in `.env`
   - Check your React Native app's base URL

### Logs

Check server logs for detailed error information:
```bash
npm run dev  # Shows detailed logs in development
```

## 📞 Support

For issues or questions:
1. Check the logs for error details
2. Verify environment variables
3. Test with the provided test script
4. Review the API documentation in README.md

## 🎯 Next Steps

1. **Complete Email Setup**: Update Gmail credentials
2. **Test All Endpoints**: Run the test script
3. **Integrate with React Native**: Use the provided examples
4. **Deploy**: Consider platforms like Heroku, Railway, or DigitalOcean

Your backend is now ready to handle authentication for your Finance React Native app! 🎉 