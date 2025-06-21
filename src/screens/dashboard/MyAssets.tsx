import React, {useState, useEffect} from 'react';
import {View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, RefreshControl} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import FeatherIcon from 'react-native-vector-icons/Feather';
import InvestmentService from '../../connections/investments';
import { showToast } from '../../utils/toast';

interface MyInvestment {
  _id: string;
  asset: {
    _id: string;
    name: string;
    category: string;
    image: string;
    price: number;
    hourlyReturnPercentage: number;
    maturityPeriod: string;
  };
  investedAmount: number;
  currentValue: number;
  totalReturns: number;
  status: 'active' | 'matured' | 'cashed_out';
  investmentDate: string;
  maturityDate: string;
  daysLeft: number;
  returnPercentage: string;
}

interface PortfolioStats {
  totalInvested: number;
  totalCurrentValue: number;
  totalReturns: number;
  activeInvestments: number;
  totalInvestments: number;
  balance: number;
  referralBalance: number;
  referredUsers: number;
}

const MyAssets: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState('all');
  const [investments, setInvestments] = useState<MyInvestment[]>([]);
  const [portfolioStats, setPortfolioStats] = useState<PortfolioStats>({
    totalInvested: 0,
    totalCurrentValue: 0,
    totalReturns: 0,
    activeInvestments: 0,
    totalInvestments: 0,
    balance: 0,
    referralBalance: 750, // Mock referral balance
    referredUsers: 3 // Mock referred users count
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load investments and portfolio stats
  const loadData = async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Load investments and portfolio stats in parallel
      const [investmentsResponse, portfolioResponse] = await Promise.all([
        InvestmentService.getUserInvestments(),
        InvestmentService.getPortfolioStats()
      ]);

      if (investmentsResponse.success) {
        setInvestments(investmentsResponse.data);
      } else {
        setError(investmentsResponse.message);
      }

      if (portfolioResponse.success) {
        setPortfolioStats(portfolioResponse.data);
      }

    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load data on component mount and tab change
  useEffect(() => {
    loadData();
  }, []);

  // Pull to refresh
  const onRefresh = () => {
    loadData(true);
  };

  // Handle cash out
  const handleCashOut = (investment: MyInvestment) => {
    if (investment.status !== 'active') {
      showToast.error('This investment is not active');
      return;
    }

    // Calculate penalty
    const penaltyAmount = investment.currentValue * 0.38;
    const finalAmount = investment.currentValue - penaltyAmount;

    showToast.warning(
      `You will receive ₹${finalAmount.toLocaleString()} after 38% penalty (₹${penaltyAmount.toLocaleString()}). Tap to confirm cash out.`,
      'Cash Out Early?'
    );
    
    // For demo purposes, auto-proceed after showing warning
    setTimeout(() => {
      performCashOut(investment._id);
    }, 3000);
  };

  const performCashOut = async (investmentId: string) => {
    try {
      const response = await InvestmentService.cashOutInvestment(investmentId);
      
      if (response.success) {
        showToast.success('Investment cashed out successfully!', 'Success');
        loadData(); // Refresh data
      } else {
        showToast.error(response.message || 'Failed to cash out investment');
      }
    } catch (error) {
      console.error('Cash out error:', error);
      showToast.error('Failed to cash out investment. Please try again.');
    }
  };

  const tabs = [
    {key: 'all', label: 'All Investments'},
    {key: 'active', label: 'Active'},
    {key: 'matured', label: 'Matured'},
    {key: 'cashed_out', label: 'Cashed Out'},
  ];

  const filteredInvestments = investments.filter(investment => {
    if (selectedTab === 'all') return true;
    return investment.status === selectedTab;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'matured': return '#059669';
      case 'cashed_out': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'active': return 'rgba(16, 185, 129, 0.1)';
      case 'matured': return 'rgba(5, 150, 105, 0.1)';
      case 'cashed_out': return 'rgba(245, 158, 11, 0.1)';
      default: return 'rgba(107, 114, 128, 0.1)';
    }
  };

  const getReturnPercentage = (invested: number, returns: number) => {
    if (invested === 0) return '0.0';
    return ((returns / invested) * 100).toFixed(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center" style={{ backgroundColor: '#f8fafc' }}>
        <ActivityIndicator size="large" color="#059669" />
        <Text className="text-gray-600 mt-4">Loading investments...</Text>
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

      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View className="px-6 py-8 mb-6">
          <View className="flex-row items-center justify-between mb-6">
            <View>
              <Text className="text-gray-900 text-3xl font-black">
                My Assets
              </Text>
              <Text className="text-gray-600 text-base mt-1">
                Track your portfolio
              </Text>
            </View>
            <TouchableOpacity
              className="rounded-2xl p-3 bg-white shadow-sm border border-gray-100"
              activeOpacity={0.8}
              onPress={onRefresh}
            >
              <FeatherIcon name="refresh-cw" size={24} color="#059669" />
            </TouchableOpacity>
          </View>

          {/* Portfolio Summary Card */}
          <View className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-gray-600 text-base font-medium">Portfolio Value</Text>
              <View className="flex-row items-center">
                <FeatherIcon name={portfolioStats.totalReturns >= 0 ? "trending-up" : "trending-down"} size={16} color={portfolioStats.totalReturns >= 0 ? "#10b981" : "#ef4444"} />
                <Text className={`text-sm font-bold ml-1 ${
                  portfolioStats.totalReturns >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {portfolioStats.totalReturns >= 0 ? '+' : ''}{getReturnPercentage(portfolioStats.totalInvested, portfolioStats.totalReturns)}%
                </Text>
              </View>
            </View>
            <Text className="text-gray-900 text-4xl font-black mb-4">
              ₹{portfolioStats.totalCurrentValue.toLocaleString()}
            </Text>
            <View className="flex-row justify-between">
              <View>
                <Text className="text-gray-500 text-sm">Invested</Text>
                <Text className="text-gray-900 text-xl font-black">₹{portfolioStats.totalInvested.toLocaleString()}</Text>
              </View>
              <View>
                <Text className="text-gray-500 text-sm">Returns</Text>
                <Text className={`text-xl font-black ${
                  portfolioStats.totalReturns >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {portfolioStats.totalReturns >= 0 ? '+' : ''}₹{Math.abs(portfolioStats.totalReturns).toLocaleString()}
                </Text>
              </View>
              <View>
                <Text className="text-gray-500 text-sm">Active</Text>
                <Text className="text-gray-900 text-xl font-black">{portfolioStats.activeInvestments}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View className="px-6 mb-6">
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{paddingRight: 24}}
          >
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setSelectedTab(tab.key)}
                className={`mr-3 px-6 py-3 rounded-2xl ${
                  selectedTab === tab.key
                    ? 'bg-green-600 shadow-lg'
                    : 'bg-white border border-gray-200'
                }`}
                style={{
                  shadowColor: selectedTab === tab.key ? '#059669' : 'transparent',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                }}
                activeOpacity={0.8}
              >
                <Text className={`font-bold text-sm ${
                  selectedTab === tab.key ? 'text-white' : 'text-gray-700'
                }`}>
                  {tab.label}
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
              onPress={() => loadData()}
              className="mt-2 py-2 px-4 bg-red-600 rounded-xl self-center"
            >
              <Text className="text-white font-bold">Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Investments List */}
        <View className="px-6">
          {filteredInvestments.map((investment) => (
            <TouchableOpacity
              key={investment._id}
              className="bg-white rounded-3xl p-6 mb-6 shadow-lg border border-gray-100"
              activeOpacity={0.95}
            >
              <View className="flex-row items-center mb-4">
                <Image
                  source={{ uri: investment.asset.image }}
                  className="w-16 h-16 rounded-2xl mr-4"
                  style={{ backgroundColor: '#f3f4f6' }}
                />
                <View className="flex-1">
                  <Text className="text-gray-900 text-lg font-black">{investment.asset.name}</Text>
                  <Text className="text-gray-500 text-sm">{investment.asset.category}</Text>
                  <View 
                    className="mt-1 px-3 py-1 rounded-full self-start"
                    style={{ backgroundColor: getStatusBg(investment.status) }}
                  >
                    <Text 
                      className="text-xs font-bold capitalize"
                      style={{ color: getStatusColor(investment.status) }}
                    >
                      {investment.status.replace('_', ' ')}
                    </Text>
                  </View>
                </View>
                <View className="items-end">
                  <Text className={`text-lg font-black ${
                    investment.totalReturns >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {investment.totalReturns >= 0 ? '+' : ''}{investment.returnPercentage}%
                  </Text>
                  <Text className="text-gray-500 text-xs">Total Return</Text>
                </View>
              </View>
              
              <View className="border-t border-gray-100 pt-4">
                <View className="flex-row justify-between mb-2">
                  <Text className="text-gray-500 text-sm">Invested</Text>
                  <Text className="text-gray-900 font-bold text-sm">₹{investment.investedAmount.toLocaleString()}</Text>
                </View>
                <View className="flex-row justify-between mb-2">
                  <Text className="text-gray-500 text-sm">Current Value</Text>
                  <Text className="text-gray-900 font-bold text-sm">₹{investment.currentValue.toLocaleString()}</Text>
                </View>
                <View className="flex-row justify-between mb-2">
                  <Text className="text-gray-500 text-sm">Returns</Text>
                  <Text className={`font-bold text-sm ${
                    investment.totalReturns >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {investment.totalReturns >= 0 ? '+' : ''}₹{Math.abs(investment.totalReturns).toLocaleString()}
                  </Text>
                </View>
                <View className="flex-row justify-between mb-4">
                  <Text className="text-gray-500 text-sm">
                    {investment.status === 'active' ? 'Days Left' : 'Invested On'}
                  </Text>
                  <Text className="text-gray-900 font-bold text-sm">
                    {investment.status === 'active' ? `${investment.daysLeft} days` : formatDate(investment.investmentDate)}
                  </Text>
                </View>
                
                {investment.status === 'active' && (
                  <TouchableOpacity 
                    className="bg-red-600 py-3 rounded-2xl"
                    activeOpacity={0.8}
                    onPress={() => handleCashOut(investment)}
                  >
                    <Text className="text-white text-center font-black text-sm">
                      Cash Out Early (38% penalty)
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </TouchableOpacity>
          ))}
          
          {filteredInvestments.length === 0 && !loading && !error && (
            <View className="items-center py-20">
              <Text className="text-gray-500 text-lg">No investments found</Text>
              <Text className="text-gray-400 text-sm mt-2">
                {selectedTab === 'all' ? 'Start investing to see your portfolio here' : `No ${selectedTab} investments`}
              </Text>
            </View>
          )}
        </View>
        
        {/* Referral Summary Card */}
        <View className="bg-gradient-to-r from-green-50 to-green-50 rounded-3xl p-6 shadow-lg border border-green-100 mb-40">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-gray-900 text-xl font-black">
              Referrals
            </Text>
            <View 
              className="w-12 h-12 rounded-2xl items-center justify-center"
              style={{ backgroundColor: 'rgba(5, 150, 105, 0.15)' }}
            >
              <FeatherIcon name="users" size={24} color="#059669" />
            </View>
          </View>
          <View className="flex-row justify-between mb-4">
            <View>
              <Text className="text-gray-600 text-sm">Referral Rewards</Text>
              <Text className="text-gray-900 text-2xl font-black">₹{portfolioStats.referralBalance.toLocaleString()}</Text>
            </View>
            <View>
              <Text className="text-gray-600 text-sm">Referred Users</Text>
              <Text className="text-gray-900 text-2xl font-black">{portfolioStats.referredUsers}</Text>
            </View>
          </View>

          {/* Mock Referred Users List */}
          <View className="mb-4">
            <Text className="text-gray-900 font-bold mb-3">Recent Referrals</Text>
            {[
              { name: 'Rahul Sharma', joinDate: '2024-01-15', reward: 250 },
              { name: 'Priya Patel', joinDate: '2024-01-12', reward: 250 },
              { name: 'Amit Kumar', joinDate: '2024-01-08', reward: 250 },
            ].map((referral, index) => (
              <View key={index} className="flex-row items-center justify-between py-3 px-3 mb-2 bg-white rounded-2xl shadow-sm border border-green-50">
                <View className="flex-row items-center flex-1">
                  <View 
                    className="w-10 h-10 bg-green-600 rounded-2xl items-center justify-center mr-3 shadow-sm"
                    
                  >
                    <Text className="text-white text-sm font-black">
                      {referral.name.split(' ').map(n => n[0]).join('')}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-900 font-black text-sm">{referral.name}</Text>
                    <Text className="text-gray-500 text-xs font-medium">Joined {new Date(referral.joinDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</Text>
                  </View>
                </View>
                <View 
                  className="px-3 py-1 rounded-xl"
                  style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}
                >
                  <Text className="text-green-600 font-black text-sm">+₹{referral.reward}</Text>
                </View>
              </View>
            ))}
          </View>
          
          <TouchableOpacity
            className="rounded-2xl bg-green-600 px-6 py-4 shadow-lg"
            style={{
              shadowColor: '#059669',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3,
              shadowRadius: 20,
            }}
            activeOpacity={0.8}
          >
            <View className="flex-row items-center justify-center">
              <FeatherIcon name="share-2" size={20} color="white" />
              <Text className="text-white  text-base font-black ml-2">
                Invite More Friends
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default MyAssets;