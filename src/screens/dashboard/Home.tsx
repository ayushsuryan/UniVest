import React, {useState, useEffect} from 'react';
import {View, Text, ScrollView, RefreshControl} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import CustomButton from '../../Components/CustomButton';

const Home: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalEarnings: 1234.56,
    dailyEarnings: 45.23,
    activeMining: 3,
    hashRate: '125.5 TH/s', 
  });

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setStats(prev => ({
        ...prev,
        totalEarnings: prev.totalEarnings + Math.random() * 10,
        dailyEarnings: prev.dailyEarnings + Math.random() * 2,
      }));
      setRefreshing(false);
    }, 2000);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView 
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        
        {/* Header */}
        <View className="bg-blue-600 px-6 py-8 rounded-b-3xl">
          <Text className="text-white text-2xl font-bold mb-2">
            Welcome Back!
          </Text>
          <Text className="text-blue-200 text-base">
            Your mining operations are running smoothly
          </Text>
        </View>

        {/* Stats Cards */}
        <View className="px-6 py-6">
          <View className="flex-row flex-wrap justify-between mb-6">
            <View className="bg-green-500 rounded-xl p-4 w-[48%] mb-4">
              <Text className="text-white text-sm opacity-80">Total Earnings</Text>
              <Text className="text-white text-2xl font-bold">
                ₹{stats.totalEarnings.toFixed(2)}
              </Text>
            </View>

            <View className="bg-orange-500 rounded-xl p-4 w-[48%] mb-4">
              <Text className="text-white text-sm opacity-80">Daily Earnings</Text>
              <Text className="text-white text-2xl font-bold">
                ₹{stats.dailyEarnings.toFixed(2)}
              </Text>
            </View>

            <View className="bg-purple-500 rounded-xl p-4 w-[48%] mb-4">
              <Text className="text-white text-sm opacity-80">Active Mining</Text>
              <Text className="text-white text-2xl font-bold">
                {stats.activeMining} Rigs
              </Text>
            </View>

            <View className="bg-blue-500 rounded-xl p-4 w-[48%] mb-4">
              <Text className="text-white text-sm opacity-80">Hash Rate</Text>
              <Text className="text-white text-2xl font-bold">
                {stats.hashRate}
              </Text>
            </View>
          </View>

          {/* Quick Actions */}
          <View className="bg-white rounded-xl p-6 mb-6 shadow-sm">
            <Text className="text-gray-900 text-xl font-bold mb-4">
              Quick Actions
            </Text>
            <View className="space-y-4 flex-col justify-between items-center gap-4">
              <CustomButton
                title="Start New Mining"
                onPress={() => {}}
                variant="primary"
                className="w-full"
              />
              <CustomButton
                title="View Mining History"
                onPress={() => {}}
                variant="outline"
                className="w-full"
              />
            </View>
          </View>

          {/* Recent Activity */}
          <View className="bg-white rounded-xl p-6 shadow-sm">
            <Text className="text-gray-900 text-xl font-bold mb-4">
              Recent Activity
            </Text>
            <View className="space-y-4">
              {[
                {type: 'earning', amount: '+₹12.34', time: '2 hours ago'},
                {type: 'mining', amount: 'Mining Started', time: '5 hours ago'},
                {type: 'earning', amount: '+₹8.76', time: '8 hours ago'},
                {type: 'withdrawal', amount: '-₹50.00', time: '1 day ago'},
              ].map((activity, index) => (
                <View key={index} className="flex-row justify-between items-center py-2">
                  <View className="flex-row items-center">
                    <View className={`w-3 h-3 rounded-full mr-3 ${
                      activity.type === 'earning' ? 'bg-green-500' :
                      activity.type === 'mining' ? 'bg-blue-500' : 'bg-red-500'
                    }`} />
                    <View>
                      <Text className="text-gray-900 font-medium">
                        {activity.amount}
                      </Text>
                      <Text className="text-gray-500 text-sm">
                        {activity.time}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;