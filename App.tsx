import React, { useEffect, useRef } from 'react';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Toast from 'react-native-toast-message';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { AuthGuard, GuestGuard } from './src/Components/AuthGuard';
import Landing from './src/screens/Landing';
import Login from './src/screens/Login';
import Signup from './src/screens/Signup';
import OTPVerification from './src/screens/OTPVerification';
import ResetPassword from './src/screens/ResetPassword';
import Dashboard from './src/screens/Dashboard';
import Home from './src/screens/dashboard/Home';
import Assets from './src/screens/dashboard/Assets';
import Profile from './src/screens/dashboard/Profile';
import MyAssets from './src/screens/dashboard/MyAssets';
import Team from './src/screens/dashboard/Team';
import Notifications from './src/screens/dashboard/Notifications';

import './global.css';
import CustomBottomTabBar from './src/Components/CustomBottomTabBar';

// Define navigation types
export type RootStackParamList = {
  Landing: undefined;
  Login: undefined;
  Signup: undefined;
  OTPVerification: {
    email: string;
    phoneNumber?: string;
    fromScreen: string;
  };
  ResetPassword: {
    email?: string;
    phoneNumber?: string;
    verified?: boolean;
  };
  Dashboard: undefined;
  Notifications: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

// Bottom Tabs used inside Dashboard (Protected)
const DashboardTabs = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomBottomTabBar {...props} />}
      screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Assets" component={Assets} />
      <Tab.Screen name="My" component={MyAssets} />
      <Tab.Screen name="Team" component={Team} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
};

// Auth Stack (for unauthenticated users)
const AuthStack = () => {
  return (
    <GuestGuard>
      <Stack.Navigator
        initialRouteName="Landing"
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen name="Landing" component={Landing} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Signup" component={Signup} />
        <Stack.Screen name="OTPVerification" component={OTPVerification} />
        <Stack.Screen name="ResetPassword" component={ResetPassword} />
      </Stack.Navigator>
    </GuestGuard>
  );
};

// Main App Stack (for authenticated users)
const MainStack = () => {
  return (
    <AuthGuard requireAuth={true} requireEmailVerified={true}>
      <Stack.Navigator
        initialRouteName="Dashboard"
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen name="Dashboard" component={DashboardTabs} />
        <Stack.Screen name="Notifications" component={Notifications} />
      </Stack.Navigator>
    </AuthGuard>
  );
};

// App Navigator with authentication-based routing
const AppNavigator: React.FC = () => {
  const { isAuthenticated, isInitialized, user } = useAuth();
  const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);

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

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}>
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
            <Stack.Screen name="Signup">
              {(props) => (
                <GuestGuard>
                  <Signup {...props} />
                </GuestGuard>
              )}
            </Stack.Screen>
            <Stack.Screen name="OTPVerification" component={OTPVerification} />
            <Stack.Screen name="ResetPassword" component={ResetPassword} />
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
            <Stack.Screen name="Notifications">
              {() => (
                <AuthGuard requireAuth={true} requireEmailVerified={true}>
                  <Notifications />
                </AuthGuard>
              )}
            </Stack.Screen>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppNavigator />
      <Toast />
    </AuthProvider>
  );
};

export default App;
