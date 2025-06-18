import React, {useState} from 'react';
import {View, Text, TouchableOpacity, Alert, Image} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import CustomInput from '../Components/CustomInput';
import CustomButton from '../Components/CustomButton';

interface LoginProps {
  navigation: any;
}

const Login: React.FC<LoginProps> = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{email?: string; password?: string}>({});

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

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      if (email === 'demo@cloudminer.com' && password === 'password') {
        navigation.navigate('Dashboard');
      } else {
        Alert.alert('Error', 'Invalid credentials. Use demo@cloudminer.com / password');
      }
    }, 2000);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-6 py-8">
        {/* Header */}
        <View className="items-center mb-12">
          <Image
            source={require('../../assets/logo.png')}
            className="w-20 h-20 mb-4"
            resizeMode="contain"
          />
          <Text className="text-gray-900 text-2xl font-bold">Welcome Back</Text>
          <Text className="text-gray-600 text-base mt-2">
            Sign in to your CloudMiner account
          </Text>
        </View>

        {/* Demo Credentials */}
        <View className="bg-blue-50 rounded-lg p-4 mb-6">
          <Text className="text-blue-800 font-semibold mb-2">Demo Credentials:</Text>
          <Text className="text-blue-700 text-sm">Email: demo@cloudminer.com</Text>
          <Text className="text-blue-700 text-sm">Password: password</Text>
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

          <TouchableOpacity className="self-end mb-6">
            <Text className="text-blue-600 text-sm">Forgot Password?</Text>
          </TouchableOpacity>

          <CustomButton
            title="Sign In"
            onPress={handleLogin}
            loading={isLoading}
            size="lg"
            className="w-full mb-4"
          />
        </View>

        {/* Footer */}
        <View className="flex-row justify-center items-center">
          <Text className="text-gray-600 text-base">Don't have an account? </Text>
          <TouchableOpacity>
            <Text className="text-blue-600 text-base font-semibold">Sign Up</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          className="mt-6"
          onPress={() => navigation.goBack()}>
          <Text className="text-gray-500 text-center">← Back to Home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Login;