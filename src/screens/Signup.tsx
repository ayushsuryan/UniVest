import React, {useState} from 'react';
import {View, Text, TouchableOpacity, Alert, ScrollView} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import FeatherIcon from 'react-native-vector-icons/Feather';
import CustomInput from '../Components/CustomInput';
import CustomButton from '../Components/CustomButton';

interface SignupProps {
  navigation: any;
}

const Signup: React.FC<SignupProps> = ({navigation}) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({...prev, [field]: value}));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({...prev, [field]: ''}));
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.phoneNumber) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phoneNumber.replace(/\D/g, ''))) {
      newErrors.phoneNumber = 'Phone number must be 10 digits';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // Navigate to OTP verification screen
      navigation.navigate('OTPVerification', {
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        fromScreen: 'signup'
      });
    }, 2000);
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#f8fafc' }}>
      {/* Decorative Background Elements */}
      <View className="absolute inset-0">
        <View
          className="absolute top-10 right-8 w-28 h-28 rounded-full opacity-10"
          style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)' }}
        />
        <View
          className="absolute top-96 left-6 w-20 h-20 rounded-full opacity-15"
          style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}
        />
        <View
          className="absolute bottom-32 right-12 w-16 h-16 rounded-full opacity-20"
          style={{ backgroundColor: 'rgba(5, 150, 105, 0.1)' }}
        />
      </View>

      <ScrollView className="flex-1 px-6 py-4" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="items-center mb-8">
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            className="absolute left-0 top-0 p-2"
          >
            <FeatherIcon name="arrow-left" size={24} color="#059669" />
          </TouchableOpacity>
          
          <View className="mb-4">
            <View
              className="w-20 h-20 rounded-3xl items-center justify-center shadow-lg"
              style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}
            >
              <FeatherIcon name="user-plus" size={40} color="#059669" />
            </View>
          </View>
          
          <Text className="text-gray-900 text-2xl font-black mb-2">
            Create Account
          </Text>
          <Text className="text-gray-600 text-sm text-center leading-5">
            Join WealthBuilder and start your
          </Text>
          <Text className="text-gray-600 text-sm text-center">
            journey to financial freedom
          </Text>
        </View>

        {/* Welcome Benefits */}
        <View 
          className="rounded-2xl p-4 mb-6 border border-emerald-100 shadow-sm"
          style={{ backgroundColor: 'rgba(16, 185, 129, 0.05)' }}
        >
          <View className="flex-row items-center mb-3">
            <View
              className="rounded-xl p-2 mr-3"
              style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}
            >
              <FeatherIcon name="gift" size={16} color="#059669" />
            </View>
            <Text className="text-emerald-800 font-bold text-base">Welcome Bonus</Text>
          </View>
          <View className="space-y-1">
            <Text className="text-emerald-700 text-xs">
              🎯 Free portfolio analysis worth ₹2,500
            </Text>
            <Text className="text-emerald-700 text-xs">
              📈 Zero brokerage for first 30 days
            </Text>
            <Text className="text-emerald-700 text-xs">
              💰 ₹500 signup bonus on first investment
            </Text>
          </View>
        </View>

        {/* Form */}
        <View className="mb-6">
          <View className="flex-row space-x-3 mb-4">
            <View className="flex-1">
              <CustomInput
                label="First Name"
                placeholder="John"
                value={formData.firstName}
                onChangeText={(text) => updateFormData('firstName', text)}
                error={errors.firstName}
              />
            </View>
            <View className="flex-1">
              <CustomInput
                label="Last Name"
                placeholder="Doe"
                value={formData.lastName}
                onChangeText={(text) => updateFormData('lastName', text)}
                error={errors.lastName}
              />
            </View>
          </View>

          <CustomInput
            label="Email Address"
            placeholder="john.doe@example.com"
            value={formData.email}
            onChangeText={(text) => updateFormData('email', text)}
            keyboardType="email-address"
            error={errors.email}
          />

          <CustomInput
            label="Phone Number"
            placeholder="+91 98765 43210"
            value={formData.phoneNumber}
            onChangeText={(text) => updateFormData('phoneNumber', text)}
            keyboardType="phone-pad"
            error={errors.phoneNumber}
          />

          <CustomInput
            label="Password"
            placeholder="Create a strong password"
            value={formData.password}
            onChangeText={(text) => updateFormData('password', text)}
            secureTextEntry
            error={errors.password}
          />

          <CustomInput
            label="Confirm Password"
            placeholder="Re-enter your password"
            value={formData.confirmPassword}
            onChangeText={(text) => updateFormData('confirmPassword', text)}
            secureTextEntry
            error={errors.confirmPassword}
          />

          {/* Password Requirements */}
          <View className="mb-6 p-3 rounded-lg" style={{ backgroundColor: 'rgba(16, 185, 129, 0.05)' }}>
            <Text className="text-emerald-700 text-xs font-medium mb-2">Password Requirements:</Text>
            <View className="space-y-1">
              <Text className="text-emerald-600 text-xs">• At least 8 characters</Text>
              <Text className="text-emerald-600 text-xs">• One uppercase and lowercase letter</Text>
              <Text className="text-emerald-600 text-xs">• At least one number</Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleSignup}
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
                  <FeatherIcon name="loader" size={20} color="white" />
                  <Text className="text-white text-lg font-bold ml-3">
                    Creating Account...
                  </Text>
                </>
              ) : (
                <>
                  <FeatherIcon name="user-check" size={20} color="white" />
                  <Text className="text-white text-lg font-bold ml-3">
                    Create Account
                  </Text>
                </>
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Terms and Conditions */}
        <View className="mb-6">
          <Text className="text-gray-500 text-xs text-center leading-4">
            By creating an account, you agree to our{' '}
            <Text className="text-emerald-600 font-medium">Terms of Service</Text>
            {' '}and{' '}
            <Text className="text-emerald-600 font-medium">Privacy Policy</Text>
          </Text>
        </View>

        {/* Login Link */}
        <TouchableOpacity 
          onPress={() => navigation.navigate('Login')}
          className="items-center py-4"
        >
          <View className="flex-row items-center">
            <Text className="text-gray-600 text-sm">Already have an account? </Text>
            <Text className="text-emerald-600 text-sm font-bold">Sign In</Text>
            <FeatherIcon name="arrow-right" size={16} color="#059669" className="ml-1" />
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Signup; 