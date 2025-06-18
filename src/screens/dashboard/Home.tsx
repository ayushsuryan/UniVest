import React, {useState, useEffect} from 'react';
import {View, Text, ScrollView, RefreshControl, TouchableOpacity, Animated} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import FeatherIcon from 'react-native-vector-icons/Feather';
import CustomButton from '../../Components/CustomButton';

const Home: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    portfolioValue: 1245000,
    todayGains: 18500,
    totalReturns: 245000,
    returnPercentage: 18.5,
    activeInvestments: 8,
  });

  const [marketData, setMarketData] = useState([
    { name: 'NIFTY 50', value: '22,147.90', change: '+1.2%', isPositive: true },
    { name: 'SENSEX', value: '72,943.68', change: '+0.8%', isPositive: true },
    { name: 'Gold', value: '₹6,247/10g', change: '-0.3%', isPositive: false },
    { name: 'NIFTY 50', value: '22,147.90', change: '+1.2%', isPositive: true },
    { name: 'SENSEX', value: '72,943.68', change: '+0.8%', isPositive: true },
    { name: 'Gold', value: '₹6,247/10g', change: '-0.3%', isPositive: false },
  ]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setStats(prev => ({
        ...prev,
        portfolioValue: prev.portfolioValue + Math.random() * 5000,
        todayGains: prev.todayGains + Math.random() * 1000,
      }));
      setRefreshing(false);
    }, 2000);
  };

  const StatCard = ({ icon, title, value, subtitle, color, index }: any) => {
    return (
      <View 
        className="rounded-2xl p-5 w-[48%] mb-4 shadow-sm"
        style={{ backgroundColor: color }}
      >
        <View className="flex-row items-center justify-between mb-3">
          <View
            className="rounded-xl p-2"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
          >
            <FeatherIcon name={icon} size={20} color="white" />
          </View>
          <Text className="text-white text-xs opacity-90 font-medium">
            {subtitle}
          </Text>
        </View>
        <Text className="text-white text-sm opacity-80 mb-1">{title}</Text>
        <Text className="text-white text-xl font-black">{value}</Text>
      </View>
    );
  };

  const MarketTicker = ({ data }: any) => {
    return (
      <View className="bg-white rounded-2xl p-4 mr-4 shadow-sm border border-gray-100">
        <Text className="text-gray-800 font-bold text-base mb-1">{data.name}</Text>
        <Text className="text-gray-600 text-sm mb-2">{data.value}</Text>
        <View className="flex-row items-center">
          <FeatherIcon 
            name={data.isPositive ? "trending-up" : "trending-down"} 
            size={14} 
            color={data.isPositive ? "#10b981" : "#ef4444"} 
          />
          <Text 
            className={`text-sm font-bold ml-1 ${data.isPositive ? 'text-green-600' : 'text-red-500'}`}
          >
            {data.change}
          </Text>
        </View>
      </View>
    );
  };

  const QuickActionCard = ({ icon, title, subtitle, onPress, color }: any) => {
    return (
      <TouchableOpacity 
        onPress={onPress}
        activeOpacity={0.8}
        className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex-1 mx-1"
      >
        <View
          className="rounded-2xl p-4 mb-3 self-start"
          style={{ backgroundColor: `${color}15` }}
        >
          <FeatherIcon name={icon} size={24} color={color} />
        </View>
        <Text className="text-gray-800 font-bold text-base mb-1">{title}</Text>
        <Text className="text-gray-500 text-sm">{subtitle}</Text>
      </TouchableOpacity>
    );
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
      </View>

      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor="#059669"
            colors={['#059669']}
          />
        }>
        
        {/* Header */}
        <View className="px-6 py-8 mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <View>
              <Text className="text-gray-800 text-3xl font-black">
                Good Morning! 👋
              </Text>
              <Text className="text-gray-600 text-base mt-1">
                Your portfolio is performing well today
              </Text>
            </View>
            <TouchableOpacity
              className="rounded-2xl p-3 bg-white shadow-sm border border-gray-100"
              activeOpacity={0.8}
            >
              <FeatherIcon name="bell" size={24} color="#059669" />
            </TouchableOpacity>
          </View>

          {/* Portfolio Summary Card */}
          <View className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-gray-600 text-base font-medium">Total Portfolio Value</Text>
              <View className="flex-row items-center">
                <FeatherIcon name="trending-up" size={16} color="#10b981" />
                <Text className="text-green-600 text-sm font-bold ml-1">
                  +{stats.returnPercentage}%
                </Text>
              </View>
            </View>
            <Text className="text-gray-900 text-4xl font-black mb-3">
              ₹{(stats.portfolioValue / 100000).toFixed(2)}L
            </Text>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Text className="text-green-600 text-lg font-bold">
                  +₹{(stats.todayGains / 1000).toFixed(1)}K
                </Text>
                <Text className="text-gray-500 text-sm ml-2">today</Text>
              </View>
              <View className="flex-row items-center">
                <Text className="text-gray-500 text-sm mr-2">Total Returns:</Text>
                <Text className="text-emerald-600 text-base font-bold">
                  ₹{(stats.totalReturns / 1000).toFixed(0)}K
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Market Overview */}
        <View className="mb-6">
          <View className="px-6 mb-4">
            <Text className="text-gray-800 text-xl font-bold">Market Overview</Text>
            <Text className="text-gray-600 text-sm">Live market data</Text>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24 }}
          >
            {marketData.map((item, index) => (
              <MarketTicker key={index} data={item} />
            ))}
          </ScrollView>
        </View>

        {/* Stats Cards */}
        <View className="px-6 mb-6">
          <View className="flex-row flex-wrap justify-between">
            <StatCard
              icon="bar-chart-2"
              title="Active Investments"
              value={`${stats.activeInvestments} Assets`}
              subtitle="Diversified"
              color="#059669"
              index={0}
            />
            <StatCard
              icon="trending-up"
              title="Monthly Returns"
              value="12.3%"
              subtitle="This Month"
              color="#0891b2"
              index={1}
            />
            <StatCard
              icon="target"
              title="Goal Progress"
              value="68%"
              subtitle="₹50L Target"
              color="#7c3aed"
              index={2}
            />
            <StatCard
              icon="award"
              title="Risk Score"
              value="Medium"
              subtitle="Balanced"
              color="#ea580c"
              index={3}
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View className="px-6 mb-6">
          <Text className="text-gray-800 text-xl font-bold mb-4">Quick Actions</Text>
          <View className="flex-row">
            <QuickActionCard
              icon="plus-circle"
              title="Invest More"
              subtitle="Add to portfolio"
              color="#059669"
              onPress={() => {}}
            />
            <QuickActionCard
              icon="repeat"
              title="Rebalance"
              subtitle="Optimize allocation"
              color="#0891b2"
              onPress={() => {}}
            />
          </View>
          <View className="flex-row mt-4">
            <QuickActionCard
              icon="download"
              title="Withdraw"
              subtitle="Cash out profits"
              color="#dc2626"
              onPress={() => {}}
            />
            <QuickActionCard
              icon="pie-chart"
              title="Analytics"
              subtitle="View detailed reports"
              color="#7c3aed"
              onPress={() => {}}
            />
          </View>
        </View>

        {/* Recent Transactions */}
        <View className="px-6 mb-8">
          <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-gray-900 text-xl font-bold">
                Recent Activity
              </Text>
              <TouchableOpacity>
                <Text className="text-emerald-600 text-sm font-bold">View All</Text>
              </TouchableOpacity>
            </View>
            <View className="space-y-4">
              {[
                {type: 'buy', title: 'Bought Growth Stocks', amount: '+₹25,000', time: '2 hours ago', icon: 'trending-up', color: '#10b981'},
                {type: 'dividend', title: 'Dividend Received', amount: '+₹1,250', time: '1 day ago', icon: 'dollar-sign', color: '#059669'},
                {type: 'sell', title: 'Sold Real Estate Fund', amount: '+₹45,000', time: '2 days ago', icon: 'home', color: '#0891b2'},
                {type: 'withdraw', title: 'Withdrawal', amount: '-₹10,000', time: '3 days ago', icon: 'arrow-down', color: '#dc2626'},
              ].map((activity, index) => (
                <View key={index} className="flex-row items-center justify-between py-3 border-b border-gray-50 last:border-b-0">
                  <View className="flex-row items-center flex-1">
                    <View
                      className="rounded-xl p-3 mr-4"
                      style={{ backgroundColor: `${activity.color}15` }}
                    >
                      <FeatherIcon name={activity.icon} size={18} color={activity.color} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-gray-900 font-bold text-base">
                        {activity.title}
                      </Text>
                      <Text className="text-gray-500 text-sm">
                        {activity.time}
                      </Text>
                    </View>
                  </View>
                  <Text 
                    className={`font-bold text-base ${
                      activity.type === 'withdraw' ? 'text-red-600' : 'text-green-600'
                    }`}
                  >
                    {activity.amount}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Investment Tip */}
        <View className="px-6 mb-8">
          <View 
            className="rounded-2xl p-6 border border-emerald-100"
            style={{ backgroundColor: 'rgba(16, 185, 129, 0.05)' }}
          >
            <View className="flex-row items-center mb-3">
              <View
                className="rounded-xl p-2 mr-3"
                style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}
              >
                <FeatherIcon name="lightbulb" size={20} color="#059669" />
              </View>
              <Text className="text-emerald-800 font-bold text-lg">Investment Tip</Text>
            </View>
            <Text className="text-emerald-700 text-base leading-6">
              Consider diversifying your portfolio with some defensive assets like bonds or gold to reduce volatility during market fluctuations.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;