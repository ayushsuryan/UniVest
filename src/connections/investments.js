import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const getBaseURL = () => {
  if (__DEV__) {
    return 'http://157.180.90.43/api'; // Physical Device - Your computer's IP
  } else {
    return 'http://157.180.90.43/api';
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

// Response interceptor
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
    }
    return Promise.reject(error);
  }
);

class InvestmentService {
  // Create new investment
  async createInvestment(assetId, amount) {
    try {
      console.log('💰 Creating investment:', { assetId, amount });
      
      const response = await API.post('/investments', {
        assetId,
        amount,
      });

      console.log('✅ Investment created successfully');
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('❌ Failed to create investment:', error.response?.data || error.message);
      
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create investment. Please try again.',
        data: null
      };
    }
  }

  // Get user investments
  async getUserInvestments(status = null) {
    try {
      console.log('📊 Fetching user investments with status:', status);
      
      const params = new URLSearchParams();
      if (status) {
        params.append('status', status);
      }

      const response = await API.get(`/investments?${params.toString()}`);

      console.log('✅ Investments fetched successfully:', response.data.count);
      
      return {
        success: true,
        data: response.data.data,
        count: response.data.count,
        message: 'Investments fetched successfully'
      };
    } catch (error) {
      console.error('❌ Failed to fetch investments:', error.response?.data || error.message);
      
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch investments. Please try again.',
        data: []
      };
    }
  }

  // Get portfolio statistics
  async getPortfolioStats() {
    try {
      console.log('📈 Fetching portfolio statistics');
      
      const response = await API.get('/investments/portfolio-stats');

      console.log('✅ Portfolio stats fetched successfully');
      
      return {
        success: true,
        data: response.data.data,
        message: 'Portfolio statistics fetched successfully'
      };
    } catch (error) {
      console.error('❌ Failed to fetch portfolio stats:', error.response?.data || error.message);
      
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch portfolio statistics. Please try again.',
        data: null
      };
    }
  }

  // Cash out investment early
  async cashOutInvestment(investmentId) {
    try {
      console.log('💸 Cashing out investment:', investmentId);
      
      const response = await API.post(`/investments/${investmentId}/cash-out`);

      console.log('✅ Investment cashed out successfully');
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('❌ Failed to cash out investment:', error.response?.data || error.message);
      
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to cash out investment. Please try again.',
        data: null
      };
    }
  }

  // Get investment details
  async getInvestmentDetails(investmentId) {
    try {
      console.log('📊 Fetching investment details:', investmentId);
      
      const response = await API.get(`/investments/${investmentId}`);

      console.log('✅ Investment details fetched successfully');
      
      return {
        success: true,
        data: response.data.data,
        message: 'Investment details fetched successfully'
      };
    } catch (error) {
      console.error('❌ Failed to fetch investment details:', error.response?.data || error.message);
      
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch investment details. Please try again.',
        data: null
      };
    }
  }
}

export default new InvestmentService(); 