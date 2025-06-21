import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider } from './context/AuthContext';

// Import your screens
import Landing from './screens/Landing';
import Login from './screens/Login';
import Signup from './screens/Signup';
import OTPVerification from './screens/OTPVerification';
import ResetPassword from './screens/ResetPassword';
import Dashboard from './screens/Dashboard';

// Define navigation types
type RootStackParamList = {
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
};

const Stack = createStackNavigator<RootStackParamList>();

// Main Navigation Component (inside AuthProvider)
const AppNavigation = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        screenOptions={{ headerShown: false }}
        initialRouteName="Landing"
      >
        <Stack.Screen name="Landing" component={Landing} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Signup" component={Signup} />
        <Stack.Screen name="OTPVerification" component={OTPVerification} />
        <Stack.Screen name="ResetPassword" component={ResetPassword} />
        <Stack.Screen name="Dashboard" component={Dashboard} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// Main App Component
const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppNavigation />
    </AuthProvider>
  );
};

export default App; 