import React, {useState} from 'react';
import {View, Text, ScrollView, TouchableOpacity, Image} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import FeatherIcon from 'react-native-vector-icons/Feather';

interface MyInvestment {
  id: string;
  commodity: string;
  category: string;
  invested: number;
  currentValue: number;
  hourlyReturn: number;
  totalReturns: number;
  status: 'active' | 'matured' | 'pending';
  daysLeft: number;
  investedDate: string;
  image: string;
}

const MyAssets: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState('all');
  const [portfolioValue] = useState(187500);
  const [totalInvested] = useState(150000);
  const [totalReturns] = useState(37500);
  const [activeInvestments] = useState(5);
  const [referralBalance] = useState(2500);
  const [referredUsers] = useState(5);

  const myInvestments: MyInvestment[] = [
    {
      id: '1',
      commodity: 'Phone Chargers',
      category: 'Electronics',
      invested: 25000,
      currentValue: 29200,
      hourlyReturn: 0.8,
      totalReturns: 4200,
      status: 'active',
      daysLeft: 18,
      investedDate: '2024-01-15',
      image: 'https://picsum.photos/200/200?random=11',
    },
    {
      id: '2',
      commodity: 'Bluetooth Earbuds',
      category: 'Electronics',
      invested: 35000,
      currentValue: 42800,
      hourlyReturn: 1.2,
      totalReturns: 7800,
      status: 'active',
      daysLeft: 25,
      investedDate: '2024-01-10',
      image: 'https://picsum.photos/200/200?random=12',
    },
    {
      id: '3',
      commodity: 'Smart Watches',
      category: 'Wearables',
      invested: 20000,
      currentValue: 23600,
      hourlyReturn: 0.9,
      totalReturns: 3600,
      status: 'active',
      daysLeft: 12,
      investedDate: '2024-01-20',
      image: 'https://picsum.photos/200/200?random=13',
    },
    {
      id: '4',
      commodity: 'Gaming Laptops',
      category: 'Electronics',
      invested: 45000,
      currentValue: 47800,
      hourlyReturn: 1.5,
      totalReturns: 2800,
      status: 'matured',
      daysLeft: 0,
      investedDate: '2023-12-01',
      image: 'https://picsum.photos/200/200?random=14',
    },
    {
      id: '5',
      commodity: 'Wireless Mice',
      category: 'Accessories',
      invested: 25000,
      currentValue: 25900,
      hourlyReturn: 0.4,
      totalReturns: 900,
      status: 'pending',
      daysLeft: 30,
      investedDate: '2024-01-25',
      image: 'https://picsum.photos/200/200?random=15',
    },
  ];

  const tabs = [
    {key: 'all', label: 'All Investments'},
    {key: 'active', label: 'Active'},
    {key: 'matured', label: 'Matured'},
    {key: 'pending', label: 'Pending'},
  ];

  const filteredInvestments = myInvestments.filter(investment => {
    if (selectedTab === 'all') return true;
    return investment.status === selectedTab;
  });

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

  const getReturnPercentage = (invested: number, returns: number) => {
    return ((returns / invested) * 100).toFixed(1);
  };

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

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-6 py-8 mb-6">
          <View className="flex-row items-center justify-between mb-6">
            <View>
              <Text className="text-gray-900 text-3xl font-black">
                My Investments 💼
              </Text>
              <Text className="text-gray-600 text-base mt-1">
                Track your commodity portfolio
              </Text>
            </View>
            <TouchableOpacity
              className="rounded-2xl p-3 bg-white shadow-sm border border-gray-100"
              activeOpacity={0.8}
            >
              <FeatherIcon name="more-vertical" size={24} color="#059669" />
            </TouchableOpacity>
          </View>

          {/* Portfolio Summary Card */}
          <View className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-gray-600 text-base font-medium">Portfolio Value</Text>
              <View className="flex-row items-center">
                <FeatherIcon name="trending-up" size={16} color="#10b981" />
                <Text className="text-green-600 text-sm font-bold ml-1">
                  +{getReturnPercentage(totalInvested, totalReturns)}%
                </Text>
              </View>
            </View>
            <Text className="text-gray-900 text-4xl font-black mb-4">
              ₹{portfolioValue.toLocaleString()}
            </Text>
            <View className="flex-row justify-between">
              <View>
                <Text className="text-gray-500 text-sm">Invested</Text>
                <Text className="text-gray-900 text-xl font-black">₹{totalInvested.toLocaleString()}</Text>
              </View>
              <View>
                <Text className="text-gray-500 text-sm">Returns</Text>
                <Text className="text-green-600 text-xl font-black">+₹{totalReturns.toLocaleString()}</Text>
              </View>
              <View>
                <Text className="text-gray-500 text-sm">Active</Text>
                <Text className="text-gray-900 text-xl font-black">{activeInvestments}</Text>
              </View>
            </View>
          </View>

          {/* Referral Stats Card */}
          <View className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-3xl p-6 shadow-lg mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-black text-xl font-black">
                Referral Rewards 
              </Text>
              <View 
                className="w-12 h-12 rounded-2xl items-center justify-center"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
              >
                <FeatherIcon name="users" size={24} color="black" />
              </View>
            </View>
            <View className="flex-row justify-between">
              <View>
                <Text className="text-black text-sm">Referral Balance</Text>
                <Text className="text-black text-2xl font-black">₹{referralBalance.toLocaleString()}</Text>
              </View>
              <View>
                <Text className="text-black text-sm">Referred Users</Text>
                <Text className="text-black text-2xl font-black">{referredUsers}</Text>
              </View>
            </View>
            <TouchableOpacity
              className="bg-white rounded-2xl px-6 py-3 mt-4 self-start"
              activeOpacity={0.8}
            >
              <Text className="text-emerald-600 text-base font-black">
                Invite More Friends
              </Text>
            </TouchableOpacity>
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
                    ? 'bg-emerald-600 shadow-lg'
                    : 'bg-white border border-gray-200'
                }`}
                style={{
                  shadowColor: selectedTab === tab.key ? '#059669' : 'transparent',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: selectedTab === tab.key ? 8 : 2,
                }}
              >
                <Text className={`font-bold ${
                  selectedTab === tab.key
                    ? 'text-white'
                    : 'text-gray-700'
                }`}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Investments Content */}
        <View className="px-6 pb-24">
          {filteredInvestments.length > 0 ? (
            <View className="space-y-4">
              {filteredInvestments.map((investment) => (
                <View key={investment.id} className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
                  <View className="flex-row justify-between items-start mb-4">
                    <View className="flex-row items-center flex-1">
                      <View 
                        className="w-16 h-16 rounded-2xl mr-4 shadow-sm overflow-hidden"
                        style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}
                      >
                        <Image
                          source={{ uri: investment.image }}
                          className="w-full h-full"
                          style={{ borderRadius: 16 }}
                        />
                      </View>
                      <View className="flex-1">
                        <Text className="text-gray-900 text-xl font-black">
                          {investment.commodity}
                        </Text>
                        <Text className="text-gray-500 text-base font-medium">
                          {investment.category}
                        </Text>
                        <Text className="text-gray-400 text-sm mt-1">
                          Invested on {new Date(investment.investedDate).toLocaleDateString()}
                        </Text>
                      </View>
                    </View>
                    <View 
                      className="px-4 py-2 rounded-2xl border"
                      style={{ 
                        backgroundColor: getStatusBg(investment.status),
                        borderColor: getStatusColor(investment.status)
                      }}
                    >
                      <Text 
                        className="text-sm font-bold capitalize"
                        style={{ color: getStatusColor(investment.status) }}
                      >
                        {investment.status}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row justify-between items-center mb-4">
                    <View className="flex-1">
                      <Text className="text-gray-500 text-sm font-medium">Invested Amount</Text>
                      <Text className="text-gray-900 text-xl font-black">
                        ₹{investment.invested.toLocaleString()}
                      </Text>
                    </View>
                    <View className="flex-1 items-center">
                      <Text className="text-gray-500 text-sm font-medium">Current Value</Text>
                      <Text className="text-gray-900 text-xl font-black">
                        ₹{investment.currentValue.toLocaleString()}
                      </Text>
                    </View>
                    <View className="flex-1 items-end">
                      <Text className="text-gray-500 text-sm font-medium">Returns</Text>
                      <Text className="text-green-600 text-xl font-black">
                        +₹{investment.totalReturns.toLocaleString()}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row justify-between items-center mb-6">
                    <View className="flex-row items-center">
                      <FeatherIcon name="percent" size={16} color="#10b981" />
                      <Text className="text-green-600 text-sm font-bold ml-2">
                        {investment.hourlyReturn}%/hr
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <FeatherIcon name="calendar" size={16} color="#6b7280" />
                      <Text className="text-gray-500 text-sm ml-2">
                        {investment.status === 'matured' 
                          ? 'Completed' 
                          : `${investment.daysLeft} days left`
                        }
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <Text className="text-green-600 text-sm font-bold">
                        +{getReturnPercentage(investment.invested, investment.totalReturns)}%
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row space-x-3">
                    {investment.status === 'matured' ? (
                      <TouchableOpacity
                        className="flex-1 rounded-2xl p-4 shadow-lg"
                        style={{
                          backgroundColor: '#059669',
                          shadowColor: '#059669',
                          shadowOffset: { width: 0, height: 8 },
                          shadowOpacity: 0.3,
                          shadowRadius: 20,
                          elevation: 12,
                        }}
                        activeOpacity={0.8}
                      >
                        <View className="flex-row items-center justify-center">
                          <FeatherIcon name="download" size={20} color="white" />
                          <Text className="text-white text-lg font-black ml-2">
                            Withdraw
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ) : (
                      <>
                        <TouchableOpacity
                          className="flex-1 rounded-2xl p-4 bg-gray-100 border border-gray-200"
                          activeOpacity={0.8}
                        >
                          <View className="flex-row items-center justify-center">
                            <FeatherIcon name="bar-chart-2" size={20} color="#374151" />
                            <Text className="text-gray-700 text-lg font-black ml-2">
                              Details
                            </Text>
                          </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                          className="flex-1 rounded-2xl p-4 shadow-lg"
                          style={{
                            backgroundColor: '#059669',
                            shadowColor: '#059669',
                            shadowOffset: { width: 0, height: 8 },
                            shadowOpacity: 0.3,
                            shadowRadius: 20,
                            elevation: 12,
                          }}
                          activeOpacity={0.8}
                        >
                          <View className="flex-row items-center justify-center">
                            <FeatherIcon name="plus" size={20} color="white" />
                            <Text className="text-white text-lg font-black ml-2">
                              Add More
                            </Text>
                          </View>
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View className="flex-1 items-center justify-center py-20">
              <View 
                className="w-24 h-24 rounded-3xl items-center justify-center mb-6"
                style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}
              >
                <FeatherIcon name="package" size={48} color="#10b981" />
              </View>
              <Text className="text-gray-900 text-2xl font-black mb-2">
                No Investments Found
              </Text>
              <Text className="text-gray-500 text-base text-center mb-8 px-8">
                You don't have any {selectedTab === 'all' ? '' : selectedTab} investments yet. 
                Start investing in commodities to build your portfolio.
              </Text>
              <TouchableOpacity
                className="rounded-2xl px-8 py-4 shadow-lg"
                style={{
                  backgroundColor: '#059669',
                  shadowColor: '#059669',
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.3,
                  shadowRadius: 20,
                  elevation: 12,
                }}
                activeOpacity={0.8}
              >
                <View className="flex-row items-center">
                  <FeatherIcon name="shopping-cart" size={20} color="white" />
                  <Text className="text-white text-lg font-black ml-2">
                    Browse Commodities
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default MyAssets;