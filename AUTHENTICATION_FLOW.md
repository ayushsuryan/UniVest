# Authentication Flow & Route Protection Implementation

## Overview
This document outlines the comprehensive authentication flow and route protection system implemented in the Finance React Native application.

## Key Features Implemented

### 1. **Automatic Route Protection**
- **Authenticated users** cannot access auth screens (Landing, Login, Signup)
- **Unauthenticated users** cannot access dashboard and nested routes
- **Email verification required** for accessing main app features

### 2. **Automatic Navigation on Auth State Changes**
- **After Login**: Automatically redirects to Dashboard
- **After Logout**: Automatically redirects to Landing screen
- **After Email Verification**: Automatically redirects to Dashboard (for login flow)

### 3. **Protected Route Structure**

#### Unauthenticated Users Can Access:
- Landing screen
- Login screen
- Signup screen
- OTP Verification screen
- Reset Password screen

#### Authenticated Users Can Access:
- Dashboard (with bottom tabs: Home, Assets, My, Profile)
- Notifications screen
- All nested dashboard routes

## Implementation Details

### App.tsx Changes
```typescript
// Authentication-based routing
{!isAuthenticated ? (
  // Auth screens for unauthenticated users
  <>
    <Stack.Screen name="Landing" component={Landing} />
    <Stack.Screen name="Login">
      {(props) => (
        <GuestGuard>
          <Login {...props} />
        </GuestGuard>
      )}
    </Stack.Screen>
    // ... other auth screens
  </>
) : (
  // Main app screens for authenticated users
  <>
    <Stack.Screen name="Dashboard">
      {() => (
        <AuthGuard requireAuth={true} requireEmailVerified={true}>
          <DashboardTabs />
        </AuthGuard>
      )}
    </Stack.Screen>
    // ... other protected screens
  </>
)}
```

### Navigation State Management
```typescript
// Handle navigation based on authentication state changes
useEffect(() => {
  if (!isInitialized) return;

  // If user logs out, navigate to Landing
  if (!isAuthenticated) {
    navigationRef.current?.reset({
      index: 0,
      routes: [{ name: 'Landing' }],
    });
  }
  // If user logs in, navigate to Dashboard
  else if (isAuthenticated && user?.isEmailVerified) {
    navigationRef.current?.reset({
      index: 0,
      routes: [{ name: 'Dashboard' }],
    });
  }
}, [isAuthenticated, isInitialized, user?.isEmailVerified]);
```

## Guard Components

### AuthGuard
- Protects routes that require authentication
- Can optionally require email verification
- Shows loading screen during initialization
- Shows unauthorized screen for unauthenticated users

### GuestGuard
- Protects routes that should only be accessible to unauthenticated users
- Prevents authenticated users from accessing auth screens
- Shows loading screen during initialization

## Authentication Flow

### Login Flow
1. User enters credentials on Login screen
2. AuthContext handles login API call
3. On success, authentication state changes
4. App component detects state change and redirects to Dashboard
5. If email not verified, user is redirected to OTP Verification
6. After email verification, user is automatically redirected to Dashboard

### Logout Flow
1. User clicks logout in Profile screen
2. AuthContext handles logout (clears token and user data)
3. Authentication state changes to unauthenticated
4. App component detects state change and redirects to Landing
5. All subsequent navigation attempts to protected routes are blocked

### Signup Flow
1. User completes signup
2. Redirected to OTP Verification
3. After email verification, redirected to Login
4. User logs in and is redirected to Dashboard

## Security Features

### Route Protection
- **Authentication required** for all dashboard routes
- **Email verification required** for investment features
- **Automatic logout** on token expiration
- **Navigation reset** prevents back navigation to protected routes after logout

### State Management
- **Persistent authentication** state across app restarts
- **Token validation** on app initialization
- **Graceful error handling** for authentication failures

## Testing the Flow

### Test Scenarios
1. **Fresh Install**: Should show Landing screen
2. **Login with unverified email**: Should redirect to OTP verification
3. **Login with verified email**: Should redirect to Dashboard
4. **Logout**: Should redirect to Landing and block access to protected routes
5. **Direct navigation attempts**: Should be blocked by guards

### Expected Behavior
- ✅ Authenticated users cannot access Landing/Login/Signup
- ✅ Unauthenticated users cannot access Dashboard/nested routes
- ✅ Logout redirects to Landing automatically
- ✅ Login redirects to Dashboard automatically
- ✅ Email verification required for full app access

## Files Modified

### Core Navigation
- `App.tsx` - Main navigation structure with authentication-based routing
- `src/Components/AuthGuard.tsx` - Route protection components

### Authentication
- `src/context/AuthContext.tsx` - Authentication state management
- `src/connections/auth.js` - Authentication API service

### Screens
- `src/screens/Login.tsx` - Removed manual navigation after login
- `src/screens/OTPVerification.tsx` - Added login flow handling
- `src/screens/dashboard/Notifications.tsx` - Updated navigation types
- `src/screens/dashboard/Home.tsx` - Updated navigation types

## Navigation Type Safety
- Centralized `RootStackParamList` in App.tsx
- Updated all screens to use consistent navigation types
- Type-safe navigation with proper parameter validation

This implementation ensures a secure, user-friendly authentication flow with automatic route protection and seamless navigation based on authentication state. 