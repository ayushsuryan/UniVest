import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

class AssetService {
  // Get all assets with optional filters
  async getAssets(filters = {}) {
    try {
      console.log('📦 Fetching assets with filters:', filters);
      
      const params = new URLSearchParams();
      if (filters.category && filters.category !== 'all') {
        params.append('category', filters.category);
      }
      if (filters.demand && filters.demand !== 'all') {
        params.append('demand', filters.demand);
      }

      const response = await API.get(`/assets?${params.toString()}`);

      console.log('✅ Assets fetched successfully:', response.data.count);
      
      return {
        success: true,
        data: response.data.data,
        count: response.data.count,
        message: 'Assets fetched successfully'
      };
    } catch (error) {
      console.error('❌ Failed to fetch assets:', error.response?.data || error.message);
      
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch assets. Please try again.',
        data: []
      };
    }
  }

  // Get single asset by ID
  async getAssetById(assetId) {
    try {
      console.log('📦 Fetching asset by ID:', assetId);
      
      const response = await API.get(`/assets/${assetId}`);

      console.log('✅ Asset fetched successfully');
      
      return {
        success: true,
        data: response.data.data,
        message: 'Asset fetched successfully'
      };
    } catch (error) {
      console.error('❌ Failed to fetch asset:', error.response?.data || error.message);
      
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch asset. Please try again.',
        data: null
      };
    }
  }

  // Get asset categories
  async getCategories() {
    try {
      console.log('📂 Fetching asset categories');
      
      const response = await API.get('/assets/meta/categories');

      console.log('✅ Categories fetched successfully');
      
      return {
        success: true,
        data: response.data.data,
        message: 'Categories fetched successfully'
      };
    } catch (error) {
      console.error('❌ Failed to fetch categories:', error.response?.data || error.message);
      
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch categories. Please try again.',
        data: []
      };
    }
  }

  // Seed test data (for development)
  async seedTestData() {
    try {
      console.log('🌱 Seeding test data');
      
      const response = await API.post('/assets/seed/test-data');

      console.log('✅ Test data seeded successfully');
      
      return {
        success: true,
        data: response.data.data,
        count: response.data.count,
        message: response.data.message
      };
    } catch (error) {
      console.error('❌ Failed to seed test data:', error.response?.data || error.message);
      
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to seed test data. Please try again.',
        data: []
      };
    }
  }

  // Create new asset (Admin only)
  async createAsset(assetData) {
    try {
      console.log('📦 Creating new asset:', assetData.name);
      
      const response = await API.post('/assets', assetData);

      console.log('✅ Asset created successfully');
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('❌ Failed to create asset:', error.response?.data || error.message);
      
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create asset. Please try again.',
        errors: error.response?.data?.errors || []
      };
    }
  }

  // Update asset (Admin only)
  async updateAsset(assetId, assetData) {
    try {
      console.log('📦 Updating asset:', assetId);
      
      const response = await API.put(`/assets/${assetId}`, assetData);

      console.log('✅ Asset updated successfully');
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('❌ Failed to update asset:', error.response?.data || error.message);
      
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update asset. Please try again.',
        errors: error.response?.data?.errors || []
      };
    }
  }

  // Delete asset (Admin only)
  async deleteAsset(assetId) {
    try {
      console.log('🗑️ Deleting asset:', assetId);
      
      const response = await API.delete(`/assets/${assetId}`);

      console.log('✅ Asset deleted successfully');
      
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      console.error('❌ Failed to delete asset:', error.response?.data || error.message);
      
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete asset. Please try again.'
      };
    }
  }
}

// Export singleton instance
export default new AssetService(); 