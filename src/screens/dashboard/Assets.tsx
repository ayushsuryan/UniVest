import React, {useState, useEffect} from 'react';
import {View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, RefreshControl, Modal, TextInput, Alert} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import FeatherIcon from 'react-native-vector-icons/Feather';
import AssetService from '../../connections/assets';
import InvestmentService from '../../connections/investments';

interface Asset {
  _id: string;
  name: string;
  category: string;
  hourlyReturnPercentage: number;
  minInvestment: number;
  currentDemand: string;
  maturityPeriod: string;
  totalInvestors: number;
  image: string;
  price: number;
  hourlyReturnReferralPercentage: number;
}

const Assets: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Investment modal states
  const [investmentModalVisible, setInvestmentModalVisible] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [investmentLoading, setInvestmentLoading] = useState(false);
  const [userBalance, setUserBalance] = useState(1000); // Will be fetched from API

  // Load assets from API
  const loadAssets = async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const filters = {
        category: selectedFilter === 'electronics' ? 'Electronics' : undefined,
        demand: selectedFilter === 'high' ? 'high' : selectedFilter === 'medium' ? 'medium' : undefined
      };

      const response = await AssetService.getAssets(filters);
      
      if (response.success) {
        setAssets(response.data);
      } else {
        setError(response.message);
        // Try to seed test data if no assets found
        if (response.data.length === 0) {
          console.log('No assets found, seeding test data...');
          const seedResponse = await AssetService.seedTestData();
          if (seedResponse.success) {
            const assetsResponse = await AssetService.getAssets(filters);
            if (assetsResponse.success) {
              setAssets(assetsResponse.data);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error loading assets:', error);
      setError('Failed to load assets. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load user balance
  const loadUserBalance = async () => {
    try {
      const response = await InvestmentService.getPortfolioStats();
      if (response.success) {
        setUserBalance(response.data.balance);
      }
    } catch (error) {
      console.error('Error loading user balance:', error);
    }
  };

  // Load assets on component mount and filter change
  useEffect(() => {
    loadAssets();
    loadUserBalance();
  }, [selectedFilter]);

  // Pull to refresh
  const onRefresh = () => {
    loadAssets(true);
    loadUserBalance();
  };

  // Handle invest button press
  const handleInvestPress = (asset: Asset) => {
    setSelectedAsset(asset);
    setInvestmentAmount(asset.minInvestment.toString());
    setInvestmentModalVisible(true);
  };

  // Handle investment submission
  const handleInvestment = async () => {
    if (!selectedAsset || !investmentAmount) {
      Alert.alert('Error', 'Please enter a valid investment amount');
      return;
    }

    const amount = parseFloat(investmentAmount);
    
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid investment amount');
      return;
    }

    if (amount < selectedAsset.minInvestment) {
      Alert.alert('Error', `Minimum investment amount is ₹${selectedAsset.minInvestment}`);
      return;
    }

    if (amount > userBalance) {
      Alert.alert('Error', 'Insufficient balance');
      return;
    }

    try {
      setInvestmentLoading(true);
      
      const response = await InvestmentService.createInvestment(selectedAsset._id, amount);
      
      if (response.success) {
        Alert.alert('Success', 'Investment created successfully!', [
          {
            text: 'OK',
            onPress: () => {
              setInvestmentModalVisible(false);
              setInvestmentAmount('');
              setSelectedAsset(null);
              loadUserBalance(); // Refresh balance
            }
          }
        ]);
      } else {
        Alert.alert('Error', response.message || 'Failed to create investment');
      }
    } catch (error) {
      console.error('Investment error:', error);
      Alert.alert('Error', 'Failed to create investment. Please try again.');
    } finally {
      setInvestmentLoading(false);
    }
  };

  // Filter assets based on selected filter
  const filteredAssets = assets.filter(asset => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'high') return asset.currentDemand === 'High' || asset.currentDemand === 'Very High';
    if (selectedFilter === 'medium') return asset.currentDemand === 'Medium';
    if (selectedFilter === 'electronics') return asset.category === 'Electronics';
    return true;
  });

  const filters = [
    {key: 'all', label: 'All Commodities'},
    {key: 'high', label: 'High Demand'},
    {key: 'medium', label: 'Medium Demand'},
    {key: 'electronics', label: 'Electronics'},
  ];

  const getDemandColor = (demand: string) => {
    switch (demand.toLowerCase()) {
      case 'very high': return '#059669';
      case 'high': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'low': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getDemandBg = (demand: string) => {
    switch (demand.toLowerCase()) {
      case 'very high': return 'rgba(5, 150, 105, 0.1)';
      case 'high': return 'rgba(16, 185, 129, 0.1)';
      case 'medium': return 'rgba(245, 158, 11, 0.1)';
      case 'low': return 'rgba(239, 68, 68, 0.1)';
      default: return 'rgba(107, 114, 128, 0.1)';
    }
  };

  // Calculate market overview from loaded assets
  const marketOverview = {
    totalVolume: assets.reduce((sum, asset) => sum + (asset.price * asset.totalInvestors), 0),
    activeTraders: assets.reduce((sum, asset) => sum + asset.totalInvestors, 0),
    avgHourlyReturn: assets.length > 0 ? (assets.reduce((sum, asset) => sum + asset.hourlyReturnPercentage, 0) / assets.length) : 0
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(1)}Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}K`;
    }
    return `₹${amount}`;
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center" style={{ backgroundColor: '#f8fafc' }}>
        <ActivityIndicator size="large" color="#059669" />
        <Text className="text-gray-600 mt-4">Loading assets...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#f8fafc' }}>
      {/* Decorative Background */}
      <View className="absolute inset-0">
        <View
          className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-5"
          style={{ backgroundColor: '#059669' }}
        />
        <View
          className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-5"
          style={{ backgroundColor: '#10b981' }}
        />
        <View
          className="absolute top-40 left-8 w-32 h-32 rounded-full opacity-5"
          style={{ backgroundColor: '#34d399' }}
        />
      </View>

      {/* Header */}
      <View className="px-6 py-8 mb-6">
        <View className="flex-row items-center justify-between mb-6">
          <View>
            <Text className="text-gray-900 text-3xl font-black">
              Trading Commodities 📦
            </Text>
            <Text className="text-gray-600 text-base mt-1">
              Invest in high-demand products
            </Text>
          </View>
          <View className="flex-row items-center">
            <View className="mr-4">
              <Text className="text-gray-500 text-xs">Balance</Text>
              <Text className="text-green-600 text-lg font-black">₹{userBalance.toLocaleString()}</Text>
            </View>
            <TouchableOpacity
              className="rounded-2xl p-3 bg-white shadow-sm border border-gray-100"
              activeOpacity={0.8}
              onPress={onRefresh}
            >
              <FeatherIcon name="refresh-cw" size={24} color="#059669" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Market Overview Card */}
        <View className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-gray-600 text-base font-medium">Market Overview</Text>
            <View className="flex-row items-center">
              <View className="w-3 h-3 bg-green-500 rounded-full mr-2" />
              <Text className="text-green-600 text-sm font-bold">Live Trading</Text>
            </View>
          </View>
          <View className="flex-row justify-between">
            <View>
              <Text className="text-gray-500 text-sm">Total Volume</Text>
              <Text className="text-gray-900 text-xl font-black">{formatCurrency(marketOverview.totalVolume)}</Text>
            </View>
            <View>
              <Text className="text-gray-500 text-sm">Active Traders</Text>
              <Text className="text-gray-900 text-xl font-black">{marketOverview.activeTraders.toLocaleString()}+</Text>
            </View>
            <View>
              <Text className="text-gray-500 text-sm">Avg. Hourly Return</Text>
              <Text className="text-green-600 text-xl font-black">+{marketOverview.avgHourlyReturn.toFixed(1)}%</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Filters */}
      <View className="px-6 mb-6">
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{paddingRight: 24}}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.key}
              onPress={() => setSelectedFilter(filter.key)}
              className={`mr-3 px-6 py-3 rounded-2xl ${
                selectedFilter === filter.key
                  ? 'bg-green-600'
                  : 'bg-white border border-gray-200'
              }`}
              activeOpacity={0.8}
            >
              <Text className={`font-bold text-sm ${
                selectedFilter === filter.key ? 'text-white' : 'text-gray-700'
              }`}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Error Message */}
      {error && (
        <View className="mx-6 mb-4 p-4 bg-red-50 rounded-2xl border border-red-200">
          <Text className="text-red-600 text-center">{error}</Text>
          <TouchableOpacity 
            onPress={() => loadAssets()}
            className="mt-2 py-2 px-4 bg-red-600 rounded-xl self-center"
          >
            <Text className="text-white font-bold">Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Assets List */}
      <ScrollView 
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredAssets.map((asset) => (
          <TouchableOpacity
            key={asset._id}
            className="bg-white rounded-3xl p-6 mb-6 shadow-lg border border-gray-100"
            activeOpacity={0.95}
          >
            <View className="flex-row items-center mb-4">
              <Image
                source={{ uri: asset.image }}
                className="w-16 h-16 rounded-2xl mr-4"
                style={{ backgroundColor: '#f3f4f6' }}
              />
              <View className="flex-1">
                <Text className="text-gray-900 text-lg font-black">{asset.name}</Text>
                <Text className="text-gray-500 text-sm">{asset.category}</Text>
                <View 
                  className="mt-1 px-3 py-1 rounded-full self-start"
                  style={{ backgroundColor: getDemandBg(asset.currentDemand) }}
                >
                  <Text 
                    className="text-xs font-bold"
                    style={{ color: getDemandColor(asset.currentDemand) }}
                  >
                    {asset.currentDemand} Demand
                  </Text>
                </View>
              </View>
              <View className="items-end">
                <Text className="text-green-600 text-lg font-black">+{asset.hourlyReturnPercentage}%</Text>
                <Text className="text-gray-500 text-xs">Hourly Return</Text>
              </View>
            </View>
            
            <View className="border-t border-gray-100 pt-4">
              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-500 text-sm">Min. Investment</Text>
                <Text className="text-gray-900 font-bold text-sm">₹{asset.minInvestment.toLocaleString()}</Text>
              </View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-500 text-sm">Maturity Period</Text>
                <Text className="text-gray-900 font-bold text-sm">{asset.maturityPeriod}</Text>
              </View>
              <View className="flex-row justify-between mb-4">
                <Text className="text-gray-500 text-sm">Total Investors</Text>
                <Text className="text-gray-900 font-bold text-sm">{asset.totalInvestors.toLocaleString()}</Text>
              </View>
              
              <TouchableOpacity 
                className="bg-green-600 py-4 rounded-2xl"
                activeOpacity={0.8}
                onPress={() => handleInvestPress(asset)}
              >
                <Text className="text-white text-center font-black text-base">
                  Invest Now
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
        
        {filteredAssets.length === 0 && !loading && !error && (
          <View className="items-center py-20">
            <Text className="text-gray-500 text-lg">No assets found</Text>
            <Text className="text-gray-400 text-sm mt-2">Try adjusting your filters</Text>
          </View>
        )}
        
        <View className="h-20" />
      </ScrollView>

      {/* Investment Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={investmentModalVisible}
        onRequestClose={() => setInvestmentModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black bg-opacity-50">
          <View className="bg-white rounded-t-3xl p-6">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-gray-900 text-xl font-black">Invest in {selectedAsset?.name}</Text>
              <TouchableOpacity
                onPress={() => setInvestmentModalVisible(false)}
                className="p-2"
              >
                <FeatherIcon name="x" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {selectedAsset && (
              <View className="mb-6">
                <View className="flex-row items-center mb-4">
                  <Image
                    source={{ uri: selectedAsset.image }}
                    className="w-12 h-12 rounded-xl mr-3"
                  />
                  <View className="flex-1">
                    <Text className="text-gray-900 font-bold">{selectedAsset.name}</Text>
                    <Text className="text-green-600 font-bold">+{selectedAsset.hourlyReturnPercentage}% hourly</Text>
                  </View>
                </View>

                <View className="bg-gray-50 rounded-2xl p-4 mb-4">
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-gray-600">Min. Investment</Text>
                    <Text className="text-gray-900 font-bold">₹{selectedAsset.minInvestment.toLocaleString()}</Text>
                  </View>
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-gray-600">Maturity Period</Text>
                    <Text className="text-gray-900 font-bold">{selectedAsset.maturityPeriod}</Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-gray-600">Your Balance</Text>
                    <Text className="text-green-600 font-bold">₹{userBalance.toLocaleString()}</Text>
                  </View>
                </View>

                <View className="mb-6">
                  <Text className="text-gray-900 font-bold mb-2">Investment Amount</Text>
                  <TextInput
                    className="border border-gray-300 rounded-2xl px-4 py-3 text-lg font-bold"
                    placeholder={`Min. ₹${selectedAsset.minInvestment}`}
                    value={investmentAmount}
                    onChangeText={setInvestmentAmount}
                    keyboardType="numeric"
                    editable={!investmentLoading}
                  />
                </View>

                <TouchableOpacity
                  className={`py-4 rounded-2xl ${investmentLoading ? 'bg-gray-400' : 'bg-green-600'}`}
                  onPress={handleInvestment}
                  disabled={investmentLoading}
                  activeOpacity={0.8}
                >
                  {investmentLoading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-white text-center font-black text-base">
                      Confirm Investment
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Assets;