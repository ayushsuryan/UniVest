import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, RefreshControl, Modal, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { StackNavigationProp } from '@react-navigation/stack';
import { CompositeNavigationProp } from '@react-navigation/native';
import InvestmentService from '../../connections/investments';
import { RootStackParamList } from '../../../App';
import { showToast } from '../../utils/toast';

// Define tab navigator param list
type TabParamList = {
  Home: undefined;
  Assets: undefined;
  My: undefined;
  Profile: undefined;
};

// Composite navigation type for accessing both tab and stack navigators
type HomeNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'Home'>,
  StackNavigationProp<RootStackParamList>
>;

interface Investment {
  id: string;
  commodity: string;
  amount: number;
  hourlyReturn: number;
  totalReturns: number;
  category: string;
  status: 'active' | 'matured' | 'pending';
  daysLeft: number;
  image: string;
}

interface PortfolioStats {
  totalInvested: number;
  totalCurrentValue: number;
  totalReturns: number;
  activeInvestments: number;
  totalInvestments: number;
  balance: number;
}

const Home: React.FC = () => {
  const [portfolioStats, setPortfolioStats] = useState<PortfolioStats>({
    totalInvested: 0,
    totalCurrentValue: 0,
    totalReturns: 0,
    activeInvestments: 0,
    totalInvestments: 0,
    balance: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [depositModalVisible, setDepositModalVisible] = useState(false);
  const [withdrawModalVisible, setWithdrawModalVisible] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [transactionLoading, setTransactionLoading] = useState(false);

  // Get user data from AuthContext
  const { user } = useAuth();
  const navigation = useNavigation<HomeNavigationProp>();

  // Mock recent investments data (keeping as requested)
  const recentInvestments: Investment[] = [
    {
      id: '1',
      commodity: 'Phone Chargers',
      amount: 25000,
      hourlyReturn: 0.8,
      totalReturns: 4200,
      category: 'Electronics',
      status: 'active',
      daysLeft: 18,
      image: 'https://picsum.photos/200/200?random=7',
    },
    {
      id: '2',
      commodity: 'Bluetooth Earbuds',
      amount: 35000,
      hourlyReturn: 1.2,
      totalReturns: 7800,
      category: 'Electronics',
      status: 'active',
      daysLeft: 25,
      image: 'https://picsum.photos/200/200?random=8',
    },
    {
      id: '3',
      commodity: 'Smart Watches',
      amount: 20000,
      hourlyReturn: 0.9,
      totalReturns: 3600,
      category: 'Wearables',
      status: 'active',
      daysLeft: 12,
      image: 'https://picsum.photos/200/200?random=9',
    },
    {
      id: '4',
      commodity: 'Gaming Laptops',
      amount: 45000,
      hourlyReturn: 1.5,
      totalReturns: 2800,
      category: 'Electronics',
      status: 'matured',
      daysLeft: 0,
      image: 'https://picsum.photos/200/200?random=10',
    },
  ];

  // Load portfolio stats from API
  const loadPortfolioStats = async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const response = await InvestmentService.getPortfolioStats();

      if (response.success) {
        setPortfolioStats(response.data);
      } else {
        setError(response.message);
      }
    } catch (error) {
      console.error('Error loading portfolio stats:', error);
      setError('Failed to load portfolio data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadPortfolioStats();
  }, []);

  // Pull to refresh
  const onRefresh = () => {
    loadPortfolioStats(true);
  };

  // Handle quick action press
  const handleQuickAction = (actionId: string) => {
    switch (actionId) {
      case '1': // Deposit
        setDepositModalVisible(true);
        break;
      case '2': // Withdraw
        setWithdrawModalVisible(true);
        break;
      case '3': // Invest
        navigation.navigate('Assets');
        break;
      case '4': // History
        navigation.navigate('My');
        break;
      default:
        break;
    }
  };

  // Handle deposit
  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      showToast.error('Please enter a valid deposit amount');
      return;
    }

    try {
      setTransactionLoading(true);
      // Mock deposit API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 2000));

      showToast.success(`₹${parseFloat(depositAmount).toLocaleString()} deposited successfully!`, 'Success');
      setDepositModalVisible(false);
      setDepositAmount('');
      loadPortfolioStats(); // Refresh data
    } catch (error) {
      showToast.error('Failed to process deposit. Please try again.');
    } finally {
      setTransactionLoading(false);
    }
  };

  // Handle withdrawal
  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);

    if (!withdrawAmount || amount <= 0) {
      showToast.error('Please enter a valid withdrawal amount');
      return;
    }

    if (amount > portfolioStats.balance) {
      showToast.error('Insufficient balance');
      return;
    }

    try {
      setTransactionLoading(true);
      // Mock withdrawal API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 2000));

      showToast.success(`₹${amount.toLocaleString()} withdrawal initiated!`, 'Success');
      setWithdrawModalVisible(false);
      setWithdrawAmount('');
      loadPortfolioStats(); // Refresh data
    } catch (error) {
      showToast.error('Failed to process withdrawal. Please try again.');
    } finally {
      setTransactionLoading(false);
    }
  };

  // Handle notifications navigation
  const handleNotificationsPress = () => {
    navigation.navigate('Notifications');
  };

  const quickActions = [
    {
      id: '1',
      title: 'Deposit',
      subtitle: 'Add funds to wallet',
      icon: 'plus-circle',
      color: '#059669',
      bg: 'rgba(5, 150, 105, 0.1)',
    },
    {
      id: '2',
      title: 'Withdraw',
      subtitle: 'Transfer to bank',
      icon: 'arrow-up-circle',
      color: '#dc2626',
      bg: 'rgba(220, 38, 38, 0.1)',
    },
    {
      id: '3',
      title: 'Invest',
      subtitle: 'Browse commodities',
      icon: 'shopping-cart',
      color: '#7c3aed',
      bg: 'rgba(124, 58, 237, 0.1)',
    },
    {
      id: '4',
      title: 'History',
      subtitle: 'View transactions',
      icon: 'clock',
      color: '#ea580c',
      bg: 'rgba(234, 88, 12, 0.1)',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'matured': return '#059669';
      case 'pending': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'active': return 'rgba(16, 185, 129, 0.1)';
      case 'matured': return 'rgba(5, 150, 105, 0.1)';
      case 'pending': return 'rgba(245, 158, 11, 0.1)';
      default: return 'rgba(107, 114, 128, 0.1)';
    }
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView className="flex-1  justify-center items-center" style={{ backgroundColor: '#f8fafc' }}>
        <ActivityIndicator size="large" color="#059669" />
        <Text className="text-gray-600 mt-4">Loading portfolio...</Text>
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
        <View className="px-6 pt-8 pb-6">
          <View className="flex-row items-center justify-between mb-8">
            <View>
              <Text className="text-gray-500 text-base">Welcome back,</Text>
              <Text className="text-gray-900 text-2xl font-black">
                {user ? `${user.firstName} ${user.lastName}` : 'Commodity Trader'} 👋
              </Text>
            </View>
            <TouchableOpacity
              className="rounded-2xl p-3 bg-white shadow-sm border border-gray-100"
              activeOpacity={0.8}
              onPress={handleNotificationsPress}
            >
              <FeatherIcon name="bell" size={24} color="#059669" />
            </TouchableOpacity>
          </View>

          {/* Error Message */}
          {error && (
            <View className="mb-4 p-4 bg-red-50 rounded-2xl border border-red-200">
              <Text className="text-red-600 text-center">{error}</Text>
              <TouchableOpacity
                onPress={() => loadPortfolioStats()}
                className="mt-2 py-2 px-4 bg-red-600 rounded-xl self-center"
              >
                <Text className="text-white font-bold">Retry</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Wallet Balance Card */}
          <View className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-gray-600 text-base font-medium">Wallet Balance</Text>
              <View className="flex-row items-center">
                <View className="w-3 h-3 bg-green-500 rounded-full mr-2" />
                <Text className="text-green-600 text-sm font-bold">Available</Text>
              </View>
            </View>
            <Text className="text-gray-900 text-4xl font-black mb-6">
              ₹{portfolioStats.balance.toLocaleString()}
            </Text>
            <View className="flex-row space-x-4">
              <TouchableOpacity
                className="flex-1 bg-green-600 rounded-2xl p-3 mx-2 shadow-lg"
                style={{

                  shadowColor: '#059669',
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.3,
                  shadowRadius: 20,
                  elevation: 12,
                }}
                activeOpacity={0.8}
                onPress={() => setDepositModalVisible(true)}
              >
                <View className="flex-row items-center justify-center">
                  <FeatherIcon name="plus" size={20} color="white" />
                  <Text className="text-white text-lg font-black ml-2">Deposit</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 rounded-2xl p-3 m bg-gray-100 border border-gray-200"
                activeOpacity={0.8}
                onPress={() => setWithdrawModalVisible(true)}
              >
                <View className="flex-row items-center justify-center">
                  <FeatherIcon name="arrow-up" size={20} color="#374151" />
                  <Text className="text-gray-700 text-lg font-black ml-2">Withdraw</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Portfolio Stats */}
          <View className="flex-row gap-4 space-x-4 mb-6">
            <View className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <Text className="text-gray-500 text-sm  font-medium">Total Invested</Text>
              <Text className="text-gray-900 text-xl font-black">
                ₹{portfolioStats.totalInvested.toLocaleString()}
              </Text>
            </View>
            <View className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <Text className="text-gray-500 text-sm font-medium">Total Returns</Text>
              <Text className={`text-xl font-black ${portfolioStats.totalReturns >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                {portfolioStats.totalReturns >= 0 ? '+' : ''}₹{Math.abs(portfolioStats.totalReturns).toLocaleString()}
              </Text>
            </View>
            <View className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <Text className="text-gray-500 text-sm font-medium">Active</Text>
              <Text className="text-gray-900 text-xl font-black">
                {portfolioStats.activeInvestments}
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="px-6 mb-6">
          <Text className="text-gray-900 text-xl font-black mb-4">Quick Actions</Text>
          <View className="flex-row flex-wrap justify-between">
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                className="w-[48%] bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4"
                activeOpacity={0.8}
                onPress={() => handleQuickAction(action.id)}
              >
                <View
                  className="w-12 h-12 rounded-2xl items-center justify-center mb-3"
                  style={{ backgroundColor: action.bg }}
                >
                  <FeatherIcon name={action.icon as any} size={24} color={action.color} />
                </View>
                <Text className="text-gray-900 text-lg font-black">{action.title}</Text>
                <Text className="text-gray-500 text-sm">{action.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Investments */}
        <View className="px-6 pb-24">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-gray-900 text-xl font-black">Recent Investments</Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate('My')}
            >
              <Text className="text-green-600 text-base font-bold">View All</Text>
            </TouchableOpacity>
          </View>

          <View className="space-y-4">
            {recentInvestments.map((investment) => (
              <View key={investment.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center flex-1">
                    <View
                      className="w-12 h-12 rounded-2xl mr-3 overflow-hidden"
                      style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}
                    >
                      <Image
                        source={{ uri: investment.image }}
                        className="w-full h-full"
                        style={{ borderRadius: 16 }}
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-gray-900 text-lg font-black">
                        {investment.commodity}
                      </Text>
                      <Text className="text-gray-500 text-sm">
                        {investment.category}
                      </Text>
                    </View>
                  </View>
                  <View
                    className="px-3 py-1 rounded-full"
                    style={{
                      backgroundColor: getStatusBg(investment.status),
                    }}
                  >
                    <Text
                      className="text-xs font-bold capitalize"
                      style={{ color: getStatusColor(investment.status) }}
                    >
                      {investment.status}
                    </Text>
                  </View>
                </View>

                <View className="flex-row justify-between items-center">
                  <View>
                    <Text className="text-gray-500 text-sm">Investment</Text>
                    <Text className="text-gray-900 text-lg font-black">
                      ₹{investment.amount.toLocaleString()}
                    </Text>
                  </View>
                  <View className="items-center">
                    <Text className="text-gray-500 text-sm">Hourly Return</Text>
                    <Text className="text-green-600 text-lg font-black">
                      {investment.hourlyReturn}%/hr
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-gray-500 text-sm">
                      {investment.status === 'matured' ? 'Total Earned' : 'Days Left'}
                    </Text>
                    <Text className="text-gray-900 text-lg font-black">
                      {investment.status === 'matured'
                        ? `+₹${investment.totalReturns.toLocaleString()}`
                        : `${investment.daysLeft} days`
                      }
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Deposit Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={depositModalVisible}
        onRequestClose={() => setDepositModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black bg-opacity-50">
          <View className="bg-white rounded-t-3xl p-6">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-gray-900 text-xl font-black">Deposit Funds</Text>
              <TouchableOpacity
                onPress={() => setDepositModalVisible(false)}
                className="p-2"
              >
                <FeatherIcon name="x" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <View className="mb-6">
              <View className="bg-gray-50 rounded-2xl p-4 mb-4">
                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Current Balance</Text>
                  <Text className="text-gray-900 font-bold">₹{portfolioStats.balance.toLocaleString()}</Text>
                </View>
              </View>

              <Text className="text-gray-900 font-bold mb-2">Deposit Amount</Text>
              <TextInput
                className="border border-gray-300 rounded-2xl px-4 py-3 text-lg font-bold"
                placeholder="Enter amount"
                value={depositAmount}
                onChangeText={setDepositAmount}
                keyboardType="numeric"
                editable={!transactionLoading}
              />
            </View>

            <TouchableOpacity
              className={`py-4 rounded-2xl ${transactionLoading ? 'bg-gray-400' : 'bg-green-600'}`}
              onPress={handleDeposit}
              disabled={transactionLoading}
              activeOpacity={0.8}
            >
              {transactionLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white text-center font-black text-base">
                  Confirm Deposit
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Withdraw Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={withdrawModalVisible}
        onRequestClose={() => setWithdrawModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black bg-opacity-50">
          <View className="bg-white rounded-t-3xl p-6">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-gray-900 text-xl font-black">Withdraw Funds</Text>
              <TouchableOpacity
                onPress={() => setWithdrawModalVisible(false)}
                className="p-2"
              >
                <FeatherIcon name="x" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <View className="mb-6">
              <View className="bg-gray-50 rounded-2xl p-4 mb-4">
                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Available Balance</Text>
                  <Text className="text-green-600 font-bold">₹{portfolioStats.balance.toLocaleString()}</Text>
                </View>
              </View>

              <Text className="text-gray-900 font-bold mb-2">Withdrawal Amount</Text>
              <TextInput
                className="border border-gray-300 rounded-2xl px-4 py-3 text-lg font-bold"
                placeholder="Enter amount"
                value={withdrawAmount}
                onChangeText={setWithdrawAmount}
                keyboardType="numeric"
                editable={!transactionLoading}
              />
            </View>

            <TouchableOpacity
              className={`py-4 rounded-2xl ${transactionLoading ? 'bg-gray-400' : 'bg-red-600'}`}
              onPress={handleWithdraw}
              disabled={transactionLoading}
              activeOpacity={0.8}
            >
              {transactionLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white text-center font-black text-base">
                  Confirm Withdrawal
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Home;