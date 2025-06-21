# Authentication Context & Guards Documentation

## Overview
This documentation explains how to use the authentication system with Context API and AuthGuards in your React Native Finance app.

## 🏗️ Architecture

```
AuthProvider (Context)
├── AuthContext (State Management)
├── AuthGuard (Route Protection)
├── GuestGuard (Guest-only Routes)
└── AuthService (API Layer)
```

## 📋 Features

### ✅ Authentication Context
- **Global State Management**: User authentication state across the entire app
- **Automatic Token Management**: JWT tokens stored securely in AsyncStorage
- **Auto-initialization**: Checks authentication status on app start
- **Real-time Updates**: State updates propagate to all components

### ✅ Route Protection
- **AuthGuard**: Protects routes requiring authentication
- **GuestGuard**: Shows content only to unauthenticated users
- **Email Verification**: Optional email verification requirement
- **Loading States**: Beautiful loading screens during auth checks

## 🚀 Quick Start

### 1. Wrap Your App with AuthProvider

```tsx
import React from 'react';
import { AuthProvider } from './context/AuthContext';
import AppNavigator from './navigation/AppNavigator';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
};

export default App;
```

### 2. Use AuthContext in Components

```tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';

const ProfileScreen: React.FC = () => {
  const { user, logout, isLoading } = useAuth();

  const handleLogout = async () => {
    await logout();
    // User will be automatically redirected to login screen
  };

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  return (
    <View>
      <Text>Welcome, {user?.firstName}!</Text>
      <Text>Email: {user?.email}</Text>
      <Text>Verified: {user?.isEmailVerified ? 'Yes' : 'No'}</Text>
      
      <TouchableOpacity onPress={handleLogout}>
        <Text>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};
```

### 3. Protect Routes with AuthGuard

```tsx
import React from 'react';
import { AuthGuard } from '../Components/AuthGuard';
import Dashboard from '../screens/Dashboard';

const ProtectedDashboard: React.FC = () => (
  <AuthGuard requireAuth={true} requireEmailVerified={true}>
    <Dashboard />
  </AuthGuard>
);
```

## 🔐 AuthContext API

### State Properties

```tsx
interface AuthState {
  user: User | null;              // Current user data
  token: string | null;           // JWT token
  isLoading: boolean;             // Loading state
  isAuthenticated: boolean;       // Authentication status
  isInitialized: boolean;         // Initialization status
}
```

### Methods

```tsx
// Authentication
const result = await login(email, password);
const result = await signup(userData);
const result = await verifyOTP(email, otp);
const result = await resendOTP(email);

// Password Management
const result = await forgotPassword(email);
const result = await resetPassword(email, otp, newPassword);
const result = await changePassword(currentPassword, newPassword);

// Profile Management
const result = await updateProfile(profileData);
await refreshUserData();

// Session Management
await logout();
```

## 🛡️ AuthGuard Components

### AuthGuard Props

```tsx
interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;           // Custom unauthorized screen
  requireAuth?: boolean;          // Require authentication (default: true)
  requireEmailVerified?: boolean; // Require email verification
}
```

### Usage Examples

```tsx
// Basic protection
<AuthGuard>
  <ProtectedScreen />
</AuthGuard>

// With email verification requirement
<AuthGuard requireAuth={true} requireEmailVerified={true}>
  <PremiumFeatures />
</AuthGuard>

// With custom fallback
<AuthGuard fallback={<CustomLoginScreen />}>
  <SecureArea />
</AuthGuard>

// Guest-only content
<GuestGuard>
  <WelcomeScreen />
</GuestGuard>
```

## 🎯 Higher Order Components

### withAuthGuard

```tsx
import { withAuthGuard } from '../Components/AuthGuard';

const ProtectedComponent = withAuthGuard(MyComponent, {
  requireAuth: true,
  requireEmailVerified: true,
  fallback: <CustomFallback />
});
```

### withGuestGuard

```tsx
import { withGuestGuard } from '../Components/AuthGuard';

const GuestOnlyComponent = withGuestGuard(LoginForm);
```

## 📱 Screen Integration Examples

### Login Screen

```tsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const LoginScreen: React.FC = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading } = useAuth();

  const handleLogin = async () => {
    const result = await login(email, password);
    
    if (result.success) {
      // Navigation handled automatically by AuthGuard
      console.log('Login successful');
    } else if (result.isEmailNotVerified) {
      navigation.navigate('OTPVerification', { email });
    } else {
      Alert.alert('Login Failed', result.message);
    }
  };

  return (
    // Your login UI here
  );
};
```

### Dashboard Screen (Protected)

```tsx
import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { AuthGuard } from '../Components/AuthGuard';

const DashboardScreen: React.FC = () => {
  const { user, refreshUserData } = useAuth();

  useEffect(() => {
    refreshUserData(); // Refresh user data on screen load
  }, []);

  return (
    <AuthGuard requireAuth={true} requireEmailVerified={true}>
      <View>
        <Text>Welcome to Dashboard, {user?.firstName}!</Text>
        {/* Dashboard content */}
      </View>
    </AuthGuard>
  );
};
```

## 🔄 Navigation Integration

### Stack Navigator with Guards

```tsx
import { createStackNavigator } from '@react-navigation/stack';
import { AuthGuard, GuestGuard } from '../Components/AuthGuard';

const Stack = createStackNavigator();

const AppNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen name="Login">
      {(props) => (
        <GuestGuard>
          <LoginScreen {...props} />
        </GuestGuard>
      )}
    </Stack.Screen>
    
    <Stack.Screen name="Dashboard">
      {(props) => (
        <AuthGuard requireAuth={true}>
          <DashboardScreen {...props} />
        </AuthGuard>
      )}
    </Stack.Screen>
  </Stack.Navigator>
);
```

## 🎨 Loading States

The system provides beautiful loading screens:

- **AuthLoadingScreen**: Shown during app initialization
- **UnauthorizedScreen**: Shown when access is denied
- **EmailVerificationRequiredScreen**: Shown when email verification is needed

## 🔧 Customization

### Custom Loading Screen

```tsx
const CustomLoadingScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <ActivityIndicator size="large" color="#your-color" />
    <Text>Loading your portfolio...</Text>
  </View>
);

<AuthGuard fallback={<CustomLoadingScreen />}>
  <YourComponent />
</AuthGuard>
```

### Custom Error Handling

```tsx
const { login } = useAuth();

const handleLogin = async () => {
  try {
    const result = await login(email, password);
    
    if (!result.success) {
      // Handle specific error cases
      switch (true) {
        case result.isEmailNotVerified:
          // Handle email verification
          break;
        case result.isInvalidCredentials:
          // Handle invalid credentials
          break;
        default:
          // Handle general error
          break;
      }
    }
  } catch (error) {
    // Handle network errors
  }
};
```

## 🚨 Best Practices

### 1. Always Check Loading States
```tsx
const { isLoading, isInitialized } = useAuth();

if (!isInitialized) {
  return <SplashScreen />;
}
```

### 2. Handle Authentication Errors Gracefully
```tsx
const result = await login(email, password);
if (!result.success) {
  showUserFriendlyError(result.message);
}
```

### 3. Use Appropriate Guards
```tsx
// For public content
<GuestGuard>
  <PublicContent />
</GuestGuard>

// For authenticated users
<AuthGuard requireAuth={true}>
  <PrivateContent />
</AuthGuard>

// For verified users only
<AuthGuard requireAuth={true} requireEmailVerified={true}>
  <PremiumContent />
</AuthGuard>
```

### 4. Refresh User Data When Needed
```tsx
const { refreshUserData } = useAuth();

useEffect(() => {
  // Refresh user data when screen focuses
  const unsubscribe = navigation.addListener('focus', () => {
    refreshUserData();
  });

  return unsubscribe;
}, [navigation, refreshUserData]);
```

## 🔍 Debugging

### Check Authentication State
```tsx
const { user, isAuthenticated, isInitialized } = useAuth();

console.log('Auth State:', {
  user,
  isAuthenticated,
  isInitialized
});
```

### Monitor Auth Changes
```tsx
useEffect(() => {
  console.log('Auth state changed:', { isAuthenticated, user });
}, [isAuthenticated, user]);
```

## 🎯 Common Use Cases

### 1. Conditional Rendering Based on Auth
```tsx
const { isAuthenticated, user } = useAuth();

return (
  <View>
    {isAuthenticated ? (
      <Text>Welcome back, {user?.firstName}!</Text>
    ) : (
      <Text>Please log in to continue</Text>
    )}
  </View>
);
```

### 2. Profile Update
```tsx
const { updateProfile, user } = useAuth();

const handleUpdateProfile = async (newData) => {
  const result = await updateProfile(newData);
  
  if (result.success) {
    Alert.alert('Success', 'Profile updated successfully');
  } else {
    Alert.alert('Error', result.message);
  }
};
```

### 3. Password Change
```tsx
const { changePassword } = useAuth();

const handleChangePassword = async (current, newPassword) => {
  const result = await changePassword(current, newPassword);
  
  if (result.success) {
    Alert.alert('Success', 'Password changed successfully');
  } else {
    Alert.alert('Error', result.message);
  }
};
```

## 📞 Support

If you encounter issues:
1. Check console logs for detailed error messages
2. Verify AuthProvider wraps your entire app
3. Ensure proper navigation setup
4. Check network connectivity
5. Validate backend API responses

Your React Native app now has a complete, production-ready authentication system with Context API and route protection! 🎉 