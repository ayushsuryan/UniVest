import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { showToast } from '../utils/toast';

// API Configuration
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
  timeout: 10000,
});

// Request interceptor to add auth token
API.interceptors.request.use(
  async config => {
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
  error => {
    return Promise.reject(error);
  },
);

// Response interceptor
API.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
    }
    return Promise.reject(error);
  },
);

class ReferralService {
  // Get team data and analytics
  async getTeamData() {
    try {
      console.log('👥 Fetching team data...');
      const response = await API.get('/referrals/team');

      console.log('✅ Team data fetched successfully');
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      console.error(
        '❌ Failed to fetch team data:',
        error.response?.data || error.message,
      );
      return {
        success: false,
        message:
          error.response?.data?.message ||
          'Failed to fetch team data. Please try again.',
      };
    }
  }

  // Get referral statistics
  async getReferralStats() {
    try {
      console.log('📊 Fetching referral statistics...');
      const response = await API.get('/referrals/stats');

      console.log('✅ Referral stats fetched successfully');
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      console.error(
        '❌ Failed to fetch referral stats:',
        error.response?.data || error.message,
      );
      return {
        success: false,
        message:
          error.response?.data?.message ||
          'Failed to fetch referral statistics. Please try again.',
      };
    }
  }

  // Get referral earnings history
  async getEarningsHistory(page = 1, limit = 20) {
    try {
      console.log('💰 Fetching earnings history...');
      const response = await API.get('/referrals/earnings', {
        params: { page, limit },
      });

      console.log('✅ Earnings history fetched successfully');
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      console.error(
        '❌ Failed to fetch earnings history:',
        error.response?.data || error.message,
      );
      return {
        success: false,
        message:
          error.response?.data?.message ||
          'Failed to fetch earnings history. Please try again.',
      };
    }
  }

  // Withdraw referral balance to main balance
  async withdrawReferralBalance(amount) {
    try {
      console.log('💸 Withdrawing referral balance:', amount);
      const response = await API.post('/referrals/withdraw', { amount });

      if (response.data.success) {
        showToast.success(response.data.message, 'Success');
        console.log('✅ Referral balance withdrawn successfully');
      }

      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      console.error(
        '❌ Failed to withdraw referral balance:',
        error.response?.data || error.message,
      );
      const message =
        error.response?.data?.message ||
        'Failed to withdraw referral balance. Please try again.';
      showToast.error(message);

      return {
        success: false,
        message,
      };
    }
  }

  // Apply referral code (for new users during signup)
  async applyReferralCode(referralCode) {
    try {
      console.log('🎯 Applying referral code:', referralCode);
      const response = await API.post('/referrals/apply-code', {
        referralCode,
      });

      if (response.data.success) {
        showToast.success('Referral code applied successfully!', 'Success');
        console.log('✅ Referral code applied successfully');
      }

      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      console.error(
        '❌ Failed to apply referral code:',
        error.response?.data || error.message,
      );
      const message =
        error.response?.data?.message ||
        'Failed to apply referral code. Please check the code and try again.';

      return {
        success: false,
        message,
      };
    }
  }
}

// Export singleton instance
export default new ReferralService();
