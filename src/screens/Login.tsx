import React, {useState} from 'react';
import {View, Text, TouchableOpacity, ScrollView} from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import CustomInput from '../Components/CustomInput';
import { useAuth } from '../context/AuthContext';
import { showToast } from '../utils/toast';

interface LoginProps {
  navigation: any;
}

const Login: React.FC<LoginProps> = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{email?: string; password?: string}>({});

  const { login, isLoading } = useAuth();

  const setTestCredentials = () => {
    setEmail('investor@wealthbuilder.com');
    setPassword('invest123');
  };

  const validateForm = () => {
    const newErrors: {email?: string; password?: string} = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      const result = await login(email, password);

      if (result.success) {
        showToast.success(`Welcome back, ${result.user?.firstName}!`, 'Login Successful');
        // Navigation will be handled automatically by App component
      } else {
        if (result.isEmailNotVerified) {
          showToast.warning('Please verify your email address first.', 'Email Not Verified');
          // Small delay to show toast before navigation
          setTimeout(() => {
            navigation.navigate('OTPVerification', {
              email: email,
              fromScreen: 'login'
            });
          }, 1000);
        } else {
          showToast.error(result.message, 'Login Failed');
        }
      }
    } catch (error) {
      showToast.error('Something went wrong. Please try again.');
      console.error('Login error:', error);
    }
  };

  return (
    <ScrollView className="flex-1" style={{ backgroundColor: '#f8fafc' }}>
      {/* Decorative Background Elements */}
      <View className="absolute inset-0">
        <View
          className="absolute top-20 right-10 w-32 h-32 rounded-full opacity-10"
          style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)' }}
        />
        <View
          className="absolute top-80 left-8 w-24 h-24 rounded-full opacity-15"
          style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}
        />
        <View
          className="absolute bottom-40 right-16 w-20 h-20 rounded-full opacity-20"
          style={{ backgroundColor: 'rgba(5, 150, 105, 0.1)' }}
        />
      </View>

      <View className="flex-1 px-6 py-8">
        {/* Header */}
        <View className="items-center mb-12">
          <View className="mb-6">
            <View
              className="w-24 h-24 rounded-3xl items-center justify-center shadow-lg"
              style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}
            >
              <FeatherIcon name="trending-up" size={48} color="#059669" />
            </View>
          </View>
          
          <Text className="text-gray-900 text-3xl font-black mb-2">
            Welcome Back
          </Text>
          <Text className="text-gray-600 text-base text-center leading-6">
            Sign in to your WealthBuilder account and
          </Text>
          <Text className="text-gray-600 text-base text-center">
            continue building your wealth
          </Text>
        </View>

    

        {/* Form */}
        <View className="mb-8">
          <CustomInput
            label="Email Address"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            error={errors.email}
          />

          <CustomInput
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            error={errors.password}
          />

          <TouchableOpacity 
            onPress={() => navigation.navigate('ResetPassword')}
            className="self-end mb-8"
          >
            <View className="flex-row items-center">
              <FeatherIcon name="help-circle" size={16} color="#059669" />
              <Text className="text-emerald-600 text-sm font-medium ml-2">
                Forgot Password?
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.8}
            className="rounded-2xl p-5 mb-4"
            style={{
              backgroundColor: '#059669',
              shadowColor: '#059669',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3,
              shadowRadius: 20,
              elevation: 12,
              opacity: isLoading ? 0.7 : 1,
            }}
          >
            <View className="flex-row items-center justify-center">
              {isLoading ? (
                <>
                  <FeatherIcon name="loader" size={22} color="white" />
                  <Text className="text-white text-lg font-bold ml-3">
                    Signing In...
                  </Text>
                </>
              ) : (
                <>
                  <FeatherIcon name="log-in" size={22} color="white" />
                  <Text className="text-white text-lg font-bold ml-3">
                    Sign In to Portfolio
                  </Text>
                </>
              )}
            </View>
          </TouchableOpacity>

      
        </View>

        {/* Footer */}
        <View className="flex-row justify-center items-center mb-6">
          <Text className="text-gray-600 text-base">New to investing? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
            <Text className="text-emerald-600 text-base font-bold">
              Create Account
            </Text>
          </TouchableOpacity>
        </View>

        {/* Security Notice */}
        <View 
          className="rounded-xl p-4 mb-6 border border-gray-200 bg-white"
        >
          <View className="flex-row items-center">
            <FeatherIcon name="shield" size={16} color="#059669" />
            <Text className="text-gray-700 text-xs font-medium ml-2 flex-1">
              Your investments are protected by bank-grade security and SEBI regulations
            </Text>
          </View>
        </View>

        <TouchableOpacity 
          className="items-center"
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <View className="flex-row items-center">
            <FeatherIcon name="arrow-left" size={18} color="#6b7280" />
            <Text className="text-gray-500 text-base font-medium ml-2">
              Back to Home
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default Login;