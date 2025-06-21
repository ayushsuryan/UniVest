# Authentication Integration Guide

## Overview
This guide explains how to use the integrated authentication system in your React Native Finance app. The system provides complete user management including registration, email verification, login, and password reset functionality.

## 🚀 Quick Start

### 1. Backend Setup
Make sure your backend server is running:
```bash
cd Finance/backend
npm start
```

### 2. Configure API Base URL
Update the `BASE_URL` in `src/graphql/auth.js` based on your setup:

```javascript
// For iOS Simulator
const BASE_URL = 'http://localhost:5000/api';

// For Android Emulator  
const BASE_URL = 'http://10.0.2.2:5000/api';

// For Physical Device (replace with your IP)
const BASE_URL = 'http://192.168.1.100:5000/api';
```

### 3. Install Dependencies
The required packages are already installed:
- `axios` - For API calls
- `@react-native-async-storage/async-storage` - For local storage

## 📱 Screen Integration

### Registration Flow
The `Signup.tsx` screen now:
- ✅ Validates user input
- ✅ Calls backend registration API
- ✅ Handles success/error responses
- ✅ Navigates to OTP verification on success
- ✅ Shows appropriate error messages

### Login Flow
The `Login.tsx` screen now:
- ✅ Authenticates users via backend API
- ✅ Handles email verification requirements
- ✅ Stores JWT tokens securely
- ✅ Navigates to Dashboard on success
- ✅ Redirects to OTP verification if email not verified

### OTP Verification Flow
The `OTPVerification.tsx` screen now:
- ✅ Verifies OTP via backend API
- ✅ Handles different verification contexts (signup, login, password reset)
- ✅ Resends OTP when needed
- ✅ Shows remaining attempts
- ✅ Stores authentication tokens

### Password Reset Flow
The `ResetPassword.tsx` screen now:
- ✅ Sends password reset OTP
- ✅ Validates new password requirements
- ✅ Resets password via backend API
- ✅ Handles OTP validation

## 🔐 Authentication Features

### Automatic Token Management
- JWT tokens are automatically stored in AsyncStorage
- Tokens are included in all API requests via interceptors
- Automatic logout on token expiration
- Secure token storage and retrieval

### Error Handling
- Network error handling
- API error message display
- Validation error handling
- User-friendly error messages

### Security Features
- Password strength validation
- Email format validation
- Rate limiting protection
- Secure token storage
- Automatic token refresh handling

## 📋 API Methods Available

### AuthService Methods
```javascript
import AuthService from '../graphql/auth';

// User Registration
const result = await AuthService.signup({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  password: 'SecurePass123',
  phone: '1234567890'
});

// Email Verification
const result = await AuthService.verifyOTP('john@example.com', '123456');

// User Login
const result = await AuthService.login('john@example.com', 'SecurePass123');

// Resend OTP
const result = await AuthService.resendOTP('john@example.com');

// Forgot Password
const result = await AuthService.forgotPassword('john@example.com');

// Reset Password
const result = await AuthService.resetPassword('john@example.com', '123456', 'NewPass123');

// Get User Profile
const result = await AuthService.getProfile();

// Update Profile
const result = await AuthService.updateProfile({
  firstName: 'Jane',
  lastName: 'Smith'
});

// Change Password
const result = await AuthService.changePassword('oldPass', 'newPass');

// Logout
await AuthService.logout();

// Check Login Status
const isLoggedIn = await AuthService.isLoggedIn();

// Get Stored User Data
const userData = await AuthService.getStoredUserData();
```

## 🔄 Complete Authentication Flow

### 1. User Registration
```
User fills signup form → API call → Success → Navigate to OTP screen
```

### 2. Email Verification
```
User enters OTP → API verification → Success → Store token → Navigate to Dashboard
```

### 3. User Login
```
User enters credentials → API call → Check email verified → Success → Store token → Dashboard
```

### 4. Password Reset
```
User enters email → Send OTP → User enters OTP → Reset password → Success → Login
```

## 🛠️ Customization

### Adding New API Endpoints
1. Add method to `AuthService` class in `auth.js`
2. Handle response in your screen component
3. Update error handling as needed

### Modifying Base URL
Update the `BASE_URL` constant in `auth.js` for different environments.

### Custom Error Handling
Modify the error handling in each screen to match your app's design.

## 🧪 Testing

### Test User Accounts
Use these credentials for testing:
- Email: `test@example.com`
- Password: `Test123!`
- OTP: `123456` (for demo purposes)

### Backend Health Check
```javascript
const health = await AuthService.healthCheck();
console.log(health.message);
```

## 🚨 Important Notes

1. **Email Configuration**: Make sure Gmail App Password is configured in backend `.env` file
2. **Network Security**: Use HTTPS in production
3. **Token Expiration**: Tokens expire after 7 days by default
4. **Rate Limiting**: Backend has rate limiting enabled
5. **Validation**: All inputs are validated on both frontend and backend

## 📞 Support

If you encounter issues:
1. Check backend server is running
2. Verify network connectivity
3. Check console logs for detailed errors
4. Ensure all dependencies are installed
5. Validate API base URL configuration

## 🎯 Next Steps

1. ✅ Authentication system integrated
2. ⏳ Add biometric authentication (optional)
3. ⏳ Implement social login (optional)
4. ⏳ Add profile management screens
5. ⏳ Implement logout functionality in app header

Your React Native app now has a complete, production-ready authentication system! 🎉 