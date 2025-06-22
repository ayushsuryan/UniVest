import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Configuration
// Use different URLs based on environment
const getBaseURL = () => {
  if (__DEV__) {
    return 'https://157.180.90.43/api'; // Physical Device - Your computer's IP
  } else {
    return 'https://157.180.90.43/api';
  }
};

const BASE_URL = getBaseURL();

// Create axios instance
const API = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor to add auth token
API.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.log('Error getting token from storage:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      // You might want to navigate to login screen here
    }
    return Promise.reject(error);
  }
);

class AuthService {
  // User Registration
  async signup(userData) {
    try {
      console.log('📝 Registering user:', userData.email);
      
      const response = await API.post('/auth/register', {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: userData.password,
        phone: userData.phone || undefined
      });

      console.log('✅ Registration successful');
      
      return {
        success: true,
        data: response.data,
        message: response.data.message,
        user: response.data.user
      };
    } catch (error) {
      console.error('❌ Registration failed:', error.response?.data || error.message);
      
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed. Please try again.',
        errors: error.response?.data?.errors || []
      };
    }
  }

  // Email Verification with OTP
  async verifyOTP(email, otp) {
    try {
      console.log('🔐 Verifying OTP for:', email);
      
      const response = await API.post('/auth/verify-email', {
        email: email,
        otp: otp
      });

      // Store token and user data after successful verification
      if (response.data.token) {
        await AsyncStorage.setItem('userToken', response.data.token);
        await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));
        
        // Set default authorization header
        API.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      }

      console.log('✅ Email verification successful');
      
      return {
        success: true,
        data: response.data,
        message: response.data.message,
        token: response.data.token,
        user: response.data.user
      };
    } catch (error) {
      console.error('❌ OTP verification failed:', error.response?.data || error.message);
      
      return {
        success: false,
        message: error.response?.data?.message || 'Invalid or expired OTP. Please try again.',
        remainingAttempts: error.response?.data?.remainingAttempts
      };
    }
  }

  // Resend Verification OTP
  async resendOTP(email) {
    try {
      console.log('🔄 Resending OTP to:', email);
      
      const response = await API.post('/auth/resend-verification-otp', {
        email: email
      });

      console.log('✅ OTP resent successfully');
      
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      console.error('❌ Resend OTP failed:', error.response?.data || error.message);
      
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to resend OTP. Please try again.'
      };
    }
  }

  // User Login
  async login(email, password) {
    try {
      console.log('🔑 Logging in user:', email);
      
      const response = await API.post('/auth/login', {
        email: email,
        password: password
      });

      // Store token and user data
      await AsyncStorage.setItem('userToken', response.data.token);
      await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));
      
      // Set default authorization header
      API.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;

      console.log('✅ Login successful');
      
      return {
        success: true,
        data: response.data,
        message: response.data.message,
        token: response.data.token,
        user: response.data.user
      };
    } catch (error) {
      console.error('❌ Login failed:', error.response?.data || error.message);
      
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
      
      return {
        success: false,
        message: errorMessage,
        isEmailNotVerified: errorMessage.includes('verify your email'),
        isInvalidCredentials: errorMessage.includes('Invalid email or password')
      };
    }
  }

  // Forgot Password - Send Reset OTP
  async forgotPassword(email) {
    try {
      console.log('📧 Sending password reset OTP to:', email);
      
      const response = await API.post('/auth/forgot-password', {
        email: email
      });

      console.log('✅ Password reset OTP sent');
      
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      console.error('❌ Forgot password failed:', error.response?.data || error.message);
      
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to send reset code. Please try again.'
      };
    }
  }

  // Reset Password with OTP
  async resetPassword(email, otp, newPassword) {
    try {
      console.log('🔒 Resetting password for:', email);
      
      const response = await API.post('/auth/reset-password', {
        email: email,
        otp: otp,
        newPassword: newPassword
      });

      console.log('✅ Password reset successful');
      
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      console.error('❌ Password reset failed:', error.response?.data || error.message);
      
      return {
        success: false,
        message: error.response?.data?.message || 'Password reset failed. Please try again.',
        isInvalidOTP: error.response?.data?.message?.includes('Invalid or expired OTP')
      };
    }
  }

  // Get User Profile
  async getProfile() {
    try {
      const response = await API.get('/auth/profile');
      
      return {
        success: true,
        user: response.data.user
      };
    } catch (error) {
      console.error('❌ Get profile failed:', error.response?.data || error.message);
      
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get profile'
      };
    }
  }

  // Update User Profile
  async updateProfile(profileData) {
    try {
      const response = await API.put('/auth/profile', profileData);
      
      // Update stored user data
      await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));
      
      return {
        success: true,
        user: response.data.user,
        message: response.data.message
      };
    } catch (error) {
      console.error('❌ Update profile failed:', error.response?.data || error.message);
      
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update profile'
      };
    }
  }

  // Change Password
  async changePassword(currentPassword, newPassword) {
    try {
      const response = await API.put('/auth/change-password', {
        currentPassword: currentPassword,
        newPassword: newPassword,
        confirmPassword: newPassword
      });
      
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      console.error('❌ Change password failed:', error.response?.data || error.message);
      
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to change password'
      };
    }
  }

  // Logout
  async logout() {
    try {
      // Call logout endpoint
      await API.post('/auth/logout');
    } catch (error) {
      console.log('Logout API call failed:', error);
      // Continue with local logout even if API call fails
    } finally {
      // Clear local storage
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      delete API.defaults.headers.common['Authorization'];
      
      console.log('✅ Logged out successfully');
    }
  }

  // Check if user is logged in
  async isLoggedIn() {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        // Set authorization header
        API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error checking login status:', error);
      return false;
    }
  }

  // Get stored user data
  async getStoredUserData() {
    try {
      const userData = await AsyncStorage.getItem('userData');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting stored user data:', error);
      return null;
    }
  }

  // Delete Account
  async deleteAccount() {
    try {
      const response = await API.delete('/auth/account');
      
      // Clear local storage after account deletion
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      delete API.defaults.headers.common['Authorization'];
      
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      console.error('❌ Delete account failed:', error.response?.data || error.message);
      
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete account'
      };
    }
  }

  // Health Check
  async healthCheck() {
    try {
      const response = await API.get('/health');
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        message: 'Backend server is not reachable'
      };
    }
  }
}

// Export singleton instance
export default new AuthService(); 