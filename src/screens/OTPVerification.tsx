import React, {useState, useEffect, useRef} from 'react';
import {View, Text, TouchableOpacity, TextInput, Alert} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { useAuth } from '../context/AuthContext';

interface OTPVerificationProps {
  navigation: any;
  route: any;
}

const OTPVerification: React.FC<OTPVerificationProps> = ({navigation, route}) => {
  const {email, phoneNumber, fromScreen} = route.params || {};
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const { verifyOTP, resendOTP, isLoading } = useAuth();

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter the complete 6-digit code.');
      return;
    }

    try {
      const result = await verifyOTP(email, otpString);

      if (result.success) {
        Alert.alert(
          'Verification Successful!',
          result.message,
          [{
            text: 'Continue',
            onPress: () => {
              if (fromScreen === 'signup') {
                // For signup, navigate to login after successful verification
                navigation.navigate('Login');
              } else if (fromScreen === 'resetPassword') {
                // For password reset, pass the OTP to the reset password screen
                navigation.navigate('ResetPassword', { 
                  email: email,
                  otp: otpString,
                  step: 'resetPassword' 
                });
              } else {
                // Default navigation
                navigation.goBack();
              }
            }
          }]
        );
      } else {
        if (result.isInvalidOTP) {
          Alert.alert(
            'Invalid Code',
            'The verification code is incorrect. Please check and try again.',
            [{
              text: 'Try Again',
              onPress: () => setOtp(['', '', '', '', '', ''])
            }]
          );
        } else {
          Alert.alert('Verification Failed', result.message);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
      console.error('OTP verification error:', error);
    }
  };

  const handleResendOTP = async () => {
    try {
      const result = await resendOTP(email);
      
      if (result.success) {
        setTimeLeft(60);
        setCanResend(false);
        setOtp(['', '', '', '', '', '']);
        Alert.alert('OTP Sent', result.message);
      } else {
        Alert.alert('Resend Failed', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to resend OTP. Please try again.');
      console.error('Resend OTP error:', error);
    }
  };

  const maskedEmail = email ? email.replace(/(.{2})(.*)(@.*)/, '$1***$3') : '';
  const maskedPhone = phoneNumber ? phoneNumber.replace(/(\d{2})(\d{6})(\d{2})/, '$1******$3') : '';

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
              <FeatherIcon name="shield-check" size={48} color="#059669" />
            </View>
          </View>
          
          <Text className="text-gray-900 text-3xl font-black mb-2">
            Verify Your Identity
          </Text>
          <Text className="text-gray-600 text-base text-center leading-6 px-4">
            We've sent a 6-digit verification code to
          </Text>
        </View>

        {/* Contact Info */}
        <View 
          className="rounded-2xl p-6 mb-8 border border-emerald-100 shadow-sm"
          style={{ backgroundColor: 'rgba(16, 185, 129, 0.05)' }}
        >
          <View className="space-y-3">
            {email && (
              <View className="flex-row items-center">
                <View
                  className="rounded-xl p-2 mr-3"
                  style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}
                >
                  <FeatherIcon name="mail" size={16} color="#059669" />
                </View>
                <Text className="text-emerald-700 font-medium">{maskedEmail}</Text>
              </View>
            )}
            {phoneNumber && (
              <View className="flex-row items-center">
                <View
                  className="rounded-xl p-2 mr-3"
                  style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}
                >
                  <FeatherIcon name="smartphone" size={16} color="#059669" />
                </View>
                <Text className="text-emerald-700 font-medium">{maskedPhone}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Demo OTP Info */}
        <View 
          className="rounded-2xl p-4 mb-8 border border-blue-100 shadow-sm"
          style={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
        >
          <View className="flex-row items-center mb-2">
            <View
              className="rounded-xl p-2 mr-3"
              style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
            >
              <FeatherIcon name="info" size={16} color="#2563eb" />
            </View>
            <Text className="text-blue-800 font-bold text-sm">Demo Mode</Text>
          </View>
          <Text className="text-blue-700 text-xs">
            For testing purposes, use OTP: <Text className="font-bold">123456</Text>
          </Text>
        </View>

        {/* OTP Input */}
        <View className="mb-8">
          <Text className="text-gray-700 text-base font-medium mb-4 text-center">
            Enter 6-digit code
          </Text>
          <View className="flex-row justify-center space-x-3 mb-6">
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  inputRefs.current[index] = ref;
                }}
                className="w-12 h-14 text-center text-xl font-bold rounded-xl border-2 border-gray-300 bg-white"
                style={{
                  borderColor: digit ? '#059669' : '#d1d5db',
                  backgroundColor: digit ? 'rgba(16, 185, 129, 0.05)' : 'white',
                }}
                value={digit}
                onChangeText={(value) => handleOtpChange(index, value)}
                onKeyPress={({nativeEvent}) => handleKeyPress(index, nativeEvent.key)}
                keyboardType="numeric"
                maxLength={1}
                selectTextOnFocus
              />
            ))}
          </View>
        </View>

        {/* Timer and Resend */}
        <View className="items-center mb-8">
          {!canResend ? (
            <View className="flex-row items-center">
              <FeatherIcon name="clock" size={16} color="#6b7280" />
              <Text className="text-gray-500 text-sm ml-2">
                Resend code in {timeLeft}s
              </Text>
            </View>
          ) : (
            <TouchableOpacity 
              onPress={handleResendOTP}
              className="flex-row items-center"
            >
              <FeatherIcon name="refresh-cw" size={16} color="#059669" />
              <Text className="text-emerald-600 text-sm font-medium ml-2">
                Resend OTP
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Verify Button */}
        <TouchableOpacity
          onPress={handleVerifyOTP}
          disabled={isLoading || otp.join('').length !== 6}
          activeOpacity={0.8}
          className="rounded-2xl p-5 mb-4"
          style={{
            backgroundColor: otp.join('').length === 6 ? '#059669' : '#9ca3af',
            shadowColor: '#059669',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: otp.join('').length === 6 ? 0.3 : 0,
            shadowRadius: 20,
            elevation: otp.join('').length === 6 ? 12 : 0,
            opacity: isLoading ? 0.7 : 1,
          }}
        >
          <View className="flex-row items-center justify-center">
            {isLoading ? (
              <>
                <FeatherIcon name="loader" size={22} color="white" />
                <Text className="text-white text-lg font-bold ml-3">
                  Verifying...
                </Text>
              </>
            ) : (
              <>
                <FeatherIcon name="check-circle" size={22} color="white" />
                <Text className="text-white text-lg font-bold ml-3">
                  Verify & Continue
                </Text>
              </>
            )}
          </View>
        </TouchableOpacity>

        {/* Help */}
        <TouchableOpacity className="items-center py-4">
          <View className="flex-row items-center">
            <FeatherIcon name="help-circle" size={16} color="#6b7280" />
            <Text className="text-gray-500 text-sm ml-2">
              Didn't receive the code? Check spam folder
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default OTPVerification; 