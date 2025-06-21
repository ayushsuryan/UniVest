import React, {useState} from 'react';
import {View, Text, TouchableOpacity, Alert, ScrollView} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import FeatherIcon from 'react-native-vector-icons/Feather';
import CustomInput from '../Components/CustomInput';
import { useAuth } from '../context/AuthContext';

interface ResetPasswordProps {
  navigation: any;
  route?: any;
}

const ResetPassword: React.FC<ResetPasswordProps> = ({navigation, route}) => {
  const {email: verifiedEmail, phoneNumber: verifiedPhone, verified} = route?.params || {};
  const [step, setStep] = useState(verified ? 'resetPassword' : 'requestReset');
  const { forgotPassword, resetPassword, isLoading } = useAuth();
  
  // For requesting reset
  const [email, setEmail] = useState(verifiedEmail || '');
  const [emailError, setEmailError] = useState('');
  
  // For setting new password
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{newPassword?: string; confirmPassword?: string}>({});

  const validateEmail = () => {
    if (!email) {
      setEmailError('Email is required');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Email is invalid');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePasswordForm = () => {
    const newErrors: {newPassword?: string; confirmPassword?: string} = {};

    if (!newPassword) {
      newErrors.newPassword = 'Password is required';
    } else if (newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      newErrors.newPassword = 'Password must contain uppercase, lowercase, and number';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRequestReset = async () => {
    if (!validateEmail()) return;

    try {
      const result = await forgotPassword(email);

      if (result.success) {
        Alert.alert(
          'Reset Code Sent',
          result.message,
          [{
            text: 'Continue',
            onPress: () => navigation.navigate('OTPVerification', {
              email: email,
              phoneNumber: '98765 43210', // You might want to get this from user input
              fromScreen: 'resetPassword'
            })
          }]
        );
      } else {
        Alert.alert('Failed to Send Code', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
      console.error('Forgot password error:', error);
    }
  };

  const handleResetPassword = async () => {
    if (!validatePasswordForm()) return;

    try {
      // In the real implementation, the OTP should come from the OTPVerification screen
      // For now, we'll need to modify the flow to properly pass the OTP
      // This is a limitation of the current flow - we need the OTP from verification
      
      // Check if we have the OTP from the verification process
      // In a real app, this would be passed from the OTPVerification screen
      const otp = route?.params?.otp || ''; // This should be passed from OTP verification
      
      if (!otp) {
        Alert.alert(
          'Verification Required',
          'Please complete the OTP verification first.',
          [{
            text: 'Go Back',
            onPress: () => setStep('requestReset')
          }]
        );
        return;
      }
      
      const result = await resetPassword(verifiedEmail || email, otp, newPassword);

      if (result.success) {
        Alert.alert(
          'Password Reset Successful!',
          result.message,
          [{
            text: 'Go to Login',
            onPress: () => navigation.navigate('Login')
          }]
        );
      } else {
        if (result.isInvalidOTP) {
          Alert.alert(
            'Invalid Code',
            'The verification code is invalid or expired. Please request a new one.',
            [{
              text: 'Request New Code',
              onPress: () => setStep('requestReset')
            }]
          );
        } else {
          Alert.alert('Reset Failed', result.message);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
      console.error('Reset password error:', error);
    }
  };

  if (step === 'resetPassword' || verified) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: '#f8fafc' }}>
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

        <ScrollView className="flex-1 px-6 py-8" showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View className="items-center mb-12">
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              className="absolute left-0 top-0 p-2"
            >
              <FeatherIcon name="arrow-left" size={24} color="#059669" />
            </TouchableOpacity>
            
            <View className="mb-6">
              <View
                className="w-24 h-24 rounded-3xl items-center justify-center shadow-lg"
                style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}
              >
                <FeatherIcon name="key" size={48} color="#059669" />
              </View>
            </View>
            
            <Text className="text-gray-900 text-3xl font-black mb-2">
              Set New Password
            </Text>
            <Text className="text-gray-600 text-base text-center leading-6">
              Create a strong password for your account
            </Text>
          </View>

          {/* Verified Account Info */}
          {verifiedEmail && (
            <View 
              className="rounded-2xl p-6 mb-8 border border-emerald-100 shadow-sm"
              style={{ backgroundColor: 'rgba(16, 185, 129, 0.05)' }}
            >
              <View className="flex-row items-center mb-3">
                <View
                  className="rounded-xl p-2 mr-3"
                  style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}
                >
                  <FeatherIcon name="check-circle" size={16} color="#059669" />
                </View>
                <Text className="text-emerald-800 font-bold text-base">Account Verified</Text>
              </View>
              <View className="flex-row items-center">
                <FeatherIcon name="mail" size={14} color="#065f46" />
                <Text className="text-emerald-700 text-sm font-medium ml-2">
                  {verifiedEmail}
                </Text>
              </View>
            </View>
          )}

          {/* Form */}
          <View className="mb-8">
            <CustomInput
              label="New Password"
              placeholder="Enter your new password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              error={errors.newPassword}
            />

            <CustomInput
              label="Confirm New Password"
              placeholder="Re-enter your new password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              error={errors.confirmPassword}
            />

            {/* Password Requirements */}
            <View className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'rgba(16, 185, 129, 0.05)' }}>
              <Text className="text-emerald-700 text-sm font-medium mb-3">Password Requirements:</Text>
              <View className="space-y-2">
                <View className="flex-row items-center">
                  <FeatherIcon 
                    name={newPassword.length >= 8 ? "check-circle" : "circle"} 
                    size={14} 
                    color={newPassword.length >= 8 ? "#059669" : "#9ca3af"} 
                  />
                  <Text className={`text-xs ml-2 ${newPassword.length >= 8 ? 'text-emerald-600' : 'text-gray-500'}`}>
                    At least 8 characters
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <FeatherIcon 
                    name={/(?=.*[a-z])(?=.*[A-Z])/.test(newPassword) ? "check-circle" : "circle"} 
                    size={14} 
                    color={/(?=.*[a-z])(?=.*[A-Z])/.test(newPassword) ? "#059669" : "#9ca3af"} 
                  />
                  <Text className={`text-xs ml-2 ${/(?=.*[a-z])(?=.*[A-Z])/.test(newPassword) ? 'text-emerald-600' : 'text-gray-500'}`}>
                    Uppercase and lowercase letters
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <FeatherIcon 
                    name={/(?=.*\d)/.test(newPassword) ? "check-circle" : "circle"} 
                    size={14} 
                    color={/(?=.*\d)/.test(newPassword) ? "#059669" : "#9ca3af"} 
                  />
                  <Text className={`text-xs ml-2 ${/(?=.*\d)/.test(newPassword) ? 'text-emerald-600' : 'text-gray-500'}`}>
                    At least one number
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              onPress={handleResetPassword}
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
                      Updating Password...
                    </Text>
                  </>
                ) : (
                  <>
                    <FeatherIcon name="check" size={22} color="white" />
                    <Text className="text-white text-lg font-bold ml-3">
                      Update Password
                    </Text>
                  </>
                )}
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#f8fafc' }}>
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
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            className="absolute left-0 top-0 p-2"
          >
            <FeatherIcon name="arrow-left" size={24} color="#059669" />
          </TouchableOpacity>
          
          <View className="mb-6">
            <View
              className="w-24 h-24 rounded-3xl items-center justify-center shadow-lg"
              style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}
            >
              <FeatherIcon name="lock" size={48} color="#059669" />
            </View>
          </View>
          
          <Text className="text-gray-900 text-3xl font-black mb-2">
            Reset Password
          </Text>
          <Text className="text-gray-600 text-base text-center leading-6">
            Enter your email address and we'll send you
          </Text>
          <Text className="text-gray-600 text-base text-center">
            a verification code to reset your password
          </Text>
        </View>

        {/* Help Info */}
        <View 
          className="rounded-2xl p-6 mb-8 border border-blue-100 shadow-sm"
          style={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
        >
          <View className="flex-row items-center mb-3">
            <View
              className="rounded-xl p-2 mr-3"
              style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
            >
              <FeatherIcon name="info" size={18} color="#2563eb" />
            </View>
            <Text className="text-blue-800 font-bold text-base">How it works</Text>
          </View>
          <View className="space-y-2">
            <Text className="text-blue-700 text-sm">
              1. Enter your registered email address
            </Text>
            <Text className="text-blue-700 text-sm">
              2. We'll send you a verification code
            </Text>
            <Text className="text-blue-700 text-sm">
              3. Verify the code and set a new password
            </Text>
          </View>
        </View>

        {/* Form */}
        <View className="mb-8">
          <CustomInput
            label="Email Address"
            placeholder="Enter your registered email"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (emailError) setEmailError('');
            }}
            keyboardType="email-address"
            error={emailError}
          />

          <TouchableOpacity
            onPress={handleRequestReset}
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
                    Sending Code...
                  </Text>
                </>
              ) : (
                <>
                  <FeatherIcon name="send" size={22} color="white" />
                  <Text className="text-white text-lg font-bold ml-3">
                    Send Reset Code
                  </Text>
                </>
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Back to Login */}
        <TouchableOpacity 
          onPress={() => navigation.navigate('Login')}
          className="items-center py-4"
        >
          <View className="flex-row items-center">
            <FeatherIcon name="arrow-left" size={16} color="#059669" />
            <Text className="text-emerald-600 text-sm font-medium ml-2">
              Back to Login
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ResetPassword; 