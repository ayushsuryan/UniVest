import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Configuration
// Use different URLs based on environment
const getBaseURL = () => {
  if (__DEV__) {
    return 'https://jas-technologies.in/api'; // Using domain with proper SSL
  } else {
    return 'https://jas-technologies.in/api'; // Using domain with proper SSL
  }
};

const BASE_URL = getBaseURL();

// Create axios instance
const API = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // Increased timeout for better reliability
  // Ensure HTTPS is enforced
  httpsAgent: undefined, // Let React Native handle HTTPS
});

// Add request logging for debugging
API.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // Log request details for debugging (only in dev mode)
      if (__DEV__) {
        console.log('🌐 API Request:', {
          method: config.method?.toUpperCase(),
          url: config.url,
          baseURL: config.baseURL,
          fullURL: `${config.baseURL}${config.url}`,
          headers: config.headers,
        });
      }
    } catch (error) {
      console.log('Error getting token from storage:', error);
    }
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration and better error logging
API.interceptors.response.use(
  (response) => {
    // Log successful responses in dev mode
    if (__DEV__) {
      console.log('✅ API Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data
      });
    }
    return response;
  },
  async (error) => {
    // Enhanced error logging
    if (error.response) {
      // Server responded with error status
      console.error(`❌ API Error [${error.response.status}]:`, {
        url: error.config?.url,
        method: error.config?.method?.toUpperCase(),
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
    } else if (error.request) {
      // Request was made but no response received
      console.error('❌ Network Error - No response received:', {
        url: error.config?.url,
        method: error.config?.method?.toUpperCase(),
        message: error.message,
        code: error.code
      });
    } else {
      // Something else happened
      console.error('❌ API Setup Error:', error.message);
    }

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
      console.log('🚀 SIGNUP DEBUG - Starting registration process');
      console.log('📝 SIGNUP DEBUG - User data:', {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phone: userData.phone,
        hasPassword: !!userData.password
      });
      
      // Log environment and URL details
      console.log('🌍 SIGNUP DEBUG - Environment details:', {
        isDev: __DEV__,
        baseURL: BASE_URL,
        fullURL: `${BASE_URL}/auth/register`,
        timeout: API.defaults.timeout
      });
      
      // Log request configuration
      console.log('⚙️ SIGNUP DEBUG - Request config:', {
        method: 'POST',
        url: '/auth/register',
        headers: API.defaults.headers,
        timeout: API.defaults.timeout
      });
      
      console.log('📤 SIGNUP DEBUG - Making API call to register endpoint...');
      
      const response = await API.post('/auth/register', {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: userData.password,
        phone: userData.phone || undefined
      });

      console.log('✅ SIGNUP DEBUG - Registration API call successful!');
      console.log('📊 SIGNUP DEBUG - Response status:', response.status);
      console.log('📊 SIGNUP DEBUG - Response headers:', response.headers);
      console.log('📊 SIGNUP DEBUG - Response data:', response.data);
      
      return {
        success: true,
        data: response.data,
        message: response.data.message,
        user: response.data.user
      };
    } catch (error) {
      console.log('❌ SIGNUP DEBUG - Registration failed!');
      console.log('🔍 SIGNUP DEBUG - Error type:', error.constructor.name);
      console.log('🔍 SIGNUP DEBUG - Error message:', error.message);
      
      if (error.response) {
        // Server responded with error status
        console.log('🔍 SIGNUP DEBUG - Server responded with error:');
        console.log('  - Status:', error.response.status);
        console.log('  - Status Text:', error.response.statusText);
        console.log('  - Headers:', error.response.headers);
        console.log('  - Data:', error.response.data);
        console.log('  - Config URL:', error.response.config?.url);
        console.log('  - Config Method:', error.response.config?.method);
        console.log('  - Config BaseURL:', error.response.config?.baseURL);
      } else if (error.request) {
        // Request was made but no response received
        console.log('🔍 SIGNUP DEBUG - No response received:');
        console.log('  - Request:', error.request);
        console.log('  - Request URL:', error.config?.url);
        console.log('  - Request Method:', error.config?.method);
        console.log('  - Request BaseURL:', error.config?.baseURL);
        console.log('  - Request Headers:', error.config?.headers);
        console.log('  - Error Code:', error.code);
        console.log('  - Error Message:', error.message);
      } else {
        // Something else happened
        console.log('🔍 SIGNUP DEBUG - Request setup error:');
        console.log('  - Error Message:', error.message);
        console.log('  - Error Stack:', error.stack);
      }
      
      // Log axios configuration at time of error
      console.log('🔍 SIGNUP DEBUG - Axios config during error:');
      console.log('  - Base URL:', API.defaults.baseURL);
      console.log('  - Headers:', API.defaults.headers);
      console.log('  - Timeout:', API.defaults.timeout);
      
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed. Please try again.',
        errors: error.response?.data?.errors || [],
        debugInfo: {
          errorType: error.constructor.name,
          errorMessage: error.message,
          hasResponse: !!error.response,
          hasRequest: !!error.request,
          status: error.response?.status,
          baseURL: API.defaults.baseURL
        }
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
      console.log('🔍 HEALTH CHECK DEBUG - Starting health check...');
      console.log('🔍 HEALTH CHECK DEBUG - URL:', `${BASE_URL}/health`);
      
      const response = await API.get('/health');
      
      console.log('✅ HEALTH CHECK DEBUG - Success!');
      console.log('📊 HEALTH CHECK DEBUG - Status:', response.status);
      console.log('📊 HEALTH CHECK DEBUG - Data:', response.data);
      
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      console.log('❌ HEALTH CHECK DEBUG - Failed!');
      console.log('🔍 HEALTH CHECK DEBUG - Error:', error.message);
      
      if (error.response) {
        console.log('🔍 HEALTH CHECK DEBUG - Server error:', error.response.status);
      } else if (error.request) {
        console.log('🔍 HEALTH CHECK DEBUG - Network error - no response');
      }
      
      return {
        success: false,
        message: 'Backend server is not reachable'
      };
    }
  }

  // Simple connectivity test
  async testConnectivity() {
    console.log('🧪 CONNECTIVITY TEST - Starting...');
    console.log('🧪 CONNECTIVITY TEST - Base URL:', BASE_URL);
    console.log('🧪 CONNECTIVITY TEST - Environment:', __DEV__ ? 'Development' : 'Production');
    
    try {
      // Try a simple GET request first
      const response = await fetch(`${BASE_URL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('✅ CONNECTIVITY TEST - Fetch successful!');
      console.log('📊 CONNECTIVITY TEST - Status:', response.status);
      console.log('📊 CONNECTIVITY TEST - OK:', response.ok);
      
      const text = await response.text();
      console.log('📊 CONNECTIVITY TEST - Response:', text);
      
      return {
        success: true,
        status: response.status,
        response: text
      };
    } catch (error) {
      console.log('❌ CONNECTIVITY TEST - Failed!');
      console.log('🔍 CONNECTIVITY TEST - Error:', error.message);
      console.log('🔍 CONNECTIVITY TEST - Error type:', error.constructor.name);
      
      return {
        success: false,
        error: error.message,
        errorType: error.constructor.name
      };
    }
  }
}

// Export singleton instance
export default new AuthService(); 