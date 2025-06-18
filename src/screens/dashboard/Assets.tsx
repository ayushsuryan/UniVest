import React, {useState} from 'react';
import {View, Text, ScrollView, TouchableOpacity, Image} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import FeatherIcon from 'react-native-vector-icons/Feather';

interface Commodity {
  id: string;
  name: string;
  category: string;
  hourlyReturn: number;
  minInvestment: number;
  currentDemand: string;
  maturityPeriod: string;
  totalInvestors: number;
  image: string;
}

const Assets: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  
  const commodities: Commodity[] = [
    {
      id: '1',
      name: 'Phone Chargers',
      category: 'Electronics',
      hourlyReturn: 0.8,
      minInvestment: 500,
      currentDemand: 'High',
      maturityPeriod: '30 days',
      totalInvestors: 1245,
      image: 'https://picsum.photos/200/200?random=1',
    },
    {
      id: '2',
      name: 'Bluetooth Earbuds',
      category: 'Electronics',
      hourlyReturn: 1.2,
      minInvestment: 1000,
      currentDemand: 'Very High',
      maturityPeriod: '45 days',
      totalInvestors: 892,
      image: 'https://picsum.photos/200/200?random=2',
    },
    {
      id: '3',
      name: 'LED Monitors',
      category: 'Electronics',
      hourlyReturn: 0.6,
      minInvestment: 2000,
      currentDemand: 'Medium',
      maturityPeriod: '60 days',
      totalInvestors: 567,
      image: 'https://picsum.photos/200/200?random=3',
    },
    {
      id: '4',
      name: 'Gaming Laptops',
      category: 'Electronics',
      hourlyReturn: 1.5,
      minInvestment: 5000,
      currentDemand: 'High',
      maturityPeriod: '90 days',
      totalInvestors: 234,
      image: 'https://picsum.photos/200/200?random=4',
    },
    {
      id: '5',
      name: 'Smart Watches',
      category: 'Wearables',
      hourlyReturn: 0.9,
      minInvestment: 1500,
      currentDemand: 'High',
      maturityPeriod: '45 days',
      totalInvestors: 678,
      image: 'https://picsum.photos/200/200?random=5',
    },
    {
      id: '6',
      name: 'Wireless Mice',
      category: 'Accessories',
      hourlyReturn: 0.4,
      minInvestment: 300,
      currentDemand: 'Medium',
      maturityPeriod: '30 days',
      totalInvestors: 456,
      image: 'https://picsum.photos/200/200?random=6',
    },
  ];

  const filters = [
    {key: 'all', label: 'All Commodities'},
    {key: 'high', label: 'High Demand'},
    {key: 'medium', label: 'Medium Demand'},
    {key: 'electronics', label: 'Electronics'},
  ];

  const filteredCommodities = commodities.filter(commodity => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'high') return commodity.currentDemand === 'High' || commodity.currentDemand === 'Very High';
    if (selectedFilter === 'medium') return commodity.currentDemand === 'Medium';
    if (selectedFilter === 'electronics') return commodity.category === 'Electronics';
    return true;
  });

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
          <TouchableOpacity
            className="rounded-2xl p-3 bg-white shadow-sm border border-gray-100"
            activeOpacity={0.8}
          >
            <FeatherIcon name="filter" size={24} color="#059669" />
          </TouchableOpacity>
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
              <Text className="text-gray-900 text-xl font-black">₹2.4Cr</Text>
            </View>
            <View>
              <Text className="text-gray-500 text-sm">Active Traders</Text>
              <Text className="text-gray-900 text-xl font-black">15K+</Text>
            </View>
            <View>
              <Text className="text-gray-500 text-sm">Avg. Hourly Return</Text>
              <Text className="text-green-600 text-xl font-black">+0.8%</Text>
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
                  ? 'bg-emerald-600 shadow-lg'
                  : 'bg-white border border-gray-200'
              }`}
              style={{
                shadowColor: selectedFilter === filter.key ? '#059669' : 'transparent',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: selectedFilter === filter.key ? 8 : 2,
              }}
            >
              <Text className={`font-bold ${
                selectedFilter === filter.key
                  ? 'text-white'
                  : 'text-gray-700'
              }`}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <View className="space-y-4 pb-24">
          {filteredCommodities.map((commodity) => (
            <View key={commodity.id} className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
              <View className="flex-row justify-between items-start mb-4">
                <View className="flex-row items-center flex-1">
                  <View 
                    className="w-16 h-16 rounded-2xl mr-4 shadow-sm overflow-hidden"
                    style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}
                  >
                    <Image
                      source={{ uri: commodity.image }}
                      className="w-full h-full"
                      style={{ borderRadius: 16 }}
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-900 text-xl font-black">
                      {commodity.name}
                    </Text>
                    <Text className="text-gray-500 text-base font-medium">
                      {commodity.category}
                    </Text>
                  </View>
                </View>
                <View 
                  className="px-4 py-2 rounded-2xl border"
                  style={{ 
                    backgroundColor: getDemandBg(commodity.currentDemand),
                    borderColor: getDemandColor(commodity.currentDemand)
                  }}
                >
                  <Text 
                    className="text-sm font-bold"
                    style={{ color: getDemandColor(commodity.currentDemand) }}
                  >
                    {commodity.currentDemand}
                  </Text>
                </View>
              </View>

              <View className="flex-row justify-between items-center mb-4">
                <View className="flex-1">
                  <Text className="text-gray-500 text-sm font-medium">Hourly Return</Text>
                  <Text className="text-green-600 text-2xl font-black">
                    {commodity.hourlyReturn}%/hr
                  </Text>
                </View>
                <View className="flex-1 items-center">
                  <Text className="text-gray-500 text-sm font-medium">Min Investment</Text>
                  <Text className="text-gray-900 text-xl font-black">
                    ₹{commodity.minInvestment.toLocaleString()}
                  </Text>
                </View>
                <View className="flex-1 items-end">
                  <Text className="text-gray-500 text-sm font-medium">Maturity</Text>
                  <Text className="text-gray-900 text-lg font-black">
                    {commodity.maturityPeriod}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center justify-between mb-6">
                <View className="flex-row items-center">
                  <FeatherIcon name="users" size={16} color="#6b7280" />
                  <Text className="text-gray-500 text-sm ml-2">
                    {commodity.totalInvestors} investors
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <FeatherIcon name="clock" size={16} color="#10b981" />
                  <Text className="text-green-600 text-sm font-bold ml-2">
                    Live Returns
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                className="rounded-2xl p-4 shadow-lg"
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
                  <FeatherIcon name="shopping-cart" size={20} color="white" />
                  <Text className="text-white text-lg font-black ml-2">
                    Invest Now
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Assets;