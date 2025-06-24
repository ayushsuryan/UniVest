import React, { ReactNode, useEffect } from 'react';
import { View, Text, ActivityIndicator, Image } from 'react-native';
import { useAuth } from '../context/AuthContext';
import FeatherIcon from 'react-native-vector-icons/Feather';

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  requireAuth?: boolean;
  requireEmailVerified?: boolean;
}

interface GuestGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

// Loading Component
const AuthLoadingScreen: React.FC = () => (
  <View className="flex-1 justify-center items-center" style={{ backgroundColor: '#f8fafc' }}>
    {/* Decorative Background */}
    <View className="absolute inset-0">
      <View
        className="absolute top-20 right-10 w-32 h-32 rounded-full opacity-10"
        style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)' }}
      />
      <View
        className="absolute bottom-32 left-8 w-24 h-24 rounded-full opacity-15"
        style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}
      />
    </View>

    {/* Logo and Loading */}
    <View className="items-center">
      <View
        className="w-20 h-20 rounded-3xl items-center justify-center mb-6 shadow-lg"
        style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}
      >
        <Image
          source={require('../../assets/app_logo_png.png')}
          style={{ width: 40, height: 40 }}
          resizeMode="contain"
        />
      </View>
      
      <Text className="text-gray-900 text-2xl font-black mb-2">
        Byaaj
      </Text>
      
      <Text className="text-gray-600 text-base mb-8">
        Initializing your portfolio...
      </Text>
      
      <ActivityIndicator size="large" color="#059669" />
    </View>
  </View>
);

// Unauthorized Access Component
const UnauthorizedScreen: React.FC<{ message?: string }> = ({ 
  message = "Please log in to access this feature" 
}) => (
  <View className="flex-1 justify-center items-center px-6" style={{ backgroundColor: '#f8fafc' }}>
    {/* Decorative Background */}
    <View className="absolute inset-0">
      <View
        className="absolute top-20 right-10 w-32 h-32 rounded-full opacity-10"
        style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)' }}
      />
      <View
        className="absolute bottom-32 left-8 w-24 h-24 rounded-full opacity-15"
        style={{ backgroundColor: 'rgba(220, 38, 38, 0.1)' }}
      />
    </View>

    {/* Content */}
    <View className="items-center">
      <View
        className="w-20 h-20 rounded-3xl items-center justify-center mb-6 shadow-lg"
        style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
      >
        <FeatherIcon name="lock" size={40} color="#dc2626" />
      </View>
      
      <Text className="text-gray-900 text-2xl font-black mb-2 text-center">
        Access Restricted
      </Text>
      
      <Text className="text-gray-600 text-base text-center leading-6">
        {message}
      </Text>
    </View>
  </View>
);

// Email Verification Required Component
const EmailVerificationRequiredScreen: React.FC = () => (
  <View className="flex-1 justify-center items-center px-6" style={{ backgroundColor: '#f8fafc' }}>
    {/* Decorative Background */}
    <View className="absolute inset-0">
      <View
        className="absolute top-20 right-10 w-32 h-32 rounded-full opacity-10"
        style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)' }}
      />
      <View
        className="absolute bottom-32 left-8 w-24 h-24 rounded-full opacity-15"
        style={{ backgroundColor: 'rgba(37, 99, 235, 0.1)' }}
      />
    </View>

    {/* Content */}
    <View className="items-center">
      <View
        className="w-20 h-20 rounded-3xl items-center justify-center mb-6 shadow-lg"
        style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
      >
        <FeatherIcon name="mail-check" size={40} color="#2563eb" />
      </View>
      
      <Text className="text-gray-900 text-2xl font-black mb-2 text-center">
        Email Verification Required
      </Text>
      
      <Text className="text-gray-600 text-base text-center leading-6 mb-4">
        Please verify your email address to access this feature.
      </Text>
      
      <Text className="text-blue-600 text-sm text-center">
        Check your email for the verification code.
      </Text>
    </View>
  </View>
);

// Main AuthGuard Component
export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  fallback,
  requireAuth = true,
  requireEmailVerified = false,
}) => {
  const { isAuthenticated, isInitialized, isLoading, user } = useAuth();

  // Show loading screen while initializing
  if (!isInitialized || isLoading) {
    return <AuthLoadingScreen />;
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return fallback ? <>{fallback}</> : <UnauthorizedScreen />;
  }

  // If email verification is required but user's email is not verified
  if (requireEmailVerified && user && !user.isEmailVerified) {
    return <EmailVerificationRequiredScreen />;
  }

  // If authenticated or auth not required, show children
  return <>{children}</>;
};

// Guest Guard - Only shows content to unauthenticated users
export const GuestGuard: React.FC<GuestGuardProps> = ({
  children,
  fallback,
}) => {
  const { isAuthenticated, isInitialized, isLoading } = useAuth();

  // Show loading screen while initializing
  if (!isInitialized || isLoading) {
    return <AuthLoadingScreen />;
  }

  // If user is authenticated, show fallback or nothing
  if (isAuthenticated) {
    return fallback ? <>{fallback}</> : null;
  }

  // If not authenticated, show children
  return <>{children}</>;
};

// Higher Order Component for protecting screens
export const withAuthGuard = <P extends object>(
  Component: React.ComponentType<P>,
  options: {
    requireAuth?: boolean;
    requireEmailVerified?: boolean;
    fallback?: ReactNode;
  } = {}
) => {
  const WrappedComponent: React.FC<P> = (props) => (
    <AuthGuard
      requireAuth={options.requireAuth}
      requireEmailVerified={options.requireEmailVerified}
      fallback={options.fallback}
    >
      <Component {...props} />
    </AuthGuard>
  );

  WrappedComponent.displayName = `withAuthGuard(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

// Higher Order Component for guest-only screens
export const withGuestGuard = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) => {
  const WrappedComponent: React.FC<P> = (props) => (
    <GuestGuard fallback={fallback}>
      <Component {...props} />
    </GuestGuard>
  );

  WrappedComponent.displayName = `withGuestGuard(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

export default AuthGuard; 