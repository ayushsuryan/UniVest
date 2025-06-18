import React, {useState} from 'react';
import {View, Text, ScrollView, TouchableOpacity} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import CustomButton from '../../Components/CustomButton';

interface MiningAsset {
  id: string;
  name: string;
  symbol: string;
  status: 'active' | 'paused' | 'stopped';
  dailyEarnings: number;
  totalEarnings: number;
  hashRate: string;
  startDate: string;
}

const MyAssets: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState('active');
  
  const myAssets: MiningAsset[] = [
    {
      id: '1',
      name: 'Bitcoin Mining',
      symbol: 'BTC',
      status: 'active',
      dailyEarnings: 25.67,
      totalEarnings: 567.89,
      hashRate: '95.2 TH/s',
      startDate: '2024-01-15',
    },
    {
      id: '2',
      name: 'Ethereum Mining',
      symbol: 'ETH',
      status: 'active',
      dailyEarnings: 18.45,
      totalEarnings: 234.56,
      hashRate: '2.5 GH/s',
      startDate: '2024-02-01',
    },
    {
      id: '3',
      name: 'Litecoin Mining',
      symbol: 'LTC',
      status: 'paused',
      dailyEarnings: 0,
      totalEarnings: 89.32,
      hashRate: '15.2 MH/s',
      startDate: '2024-01-20',
    },
  ];

  const tabs = [
    {key: 'active', label: 'Active', count: myAssets.filter(a => a.status === 'active').length},
    {key: 'paused', label: 'Paused', count: myAssets.filter(a => a.status === 'paused').length},
    {key: 'all', label: 'All', count: myAssets.length},
  ];

  const filteredAssets = myAssets.filter(asset => {
    if (selectedTab === 'all') return true;
    return asset.status === selectedTab;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'paused': return 'bg-yellow-500';
      case 'stopped': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600';
      case 'paused': return 'text-yellow-600';
      case 'stopped': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const totalDailyEarnings = myAssets
    .filter(asset => asset.status === 'active')
    .reduce((sum, asset) => sum + asset.dailyEarnings, 0);

  const totalEarnings = myAssets.reduce((sum, asset) => sum + asset.totalEarnings, 0);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="bg-white px-6 py-4 border-b border-gray-200">
        <Text className="text-gray-900 text-2xl font-bold">
          My Assets
        </Text>
        <Text className="text-gray-600 text-sm mt-1">
          Manage your mining operations
        </Text>
      </View>

      {/* Summary Cards */}
      <View className="bg-white px-6 py-4 border-b border-gray-200">
        <View className="flex-row justify-between">
          <View className="flex-1 mr-2">
            <Text className="text-gray-500 text-sm">Daily Earnings</Text>
            <Text className="text-green-600 text-xl font-bold">
              ₹{totalDailyEarnings.toFixed(2)}
            </Text>
          </View>
          <View className="flex-1 ml-2">
            <Text className="text-gray-500 text-sm">Total Earnings</Text>
            <Text className="text-blue-600 text-xl font-bold">
              ₹{totalEarnings.toFixed(2)}
            </Text>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View className="bg-white border-b border-gray-200">
        <View className="flex-row px-6 py-4">
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setSelectedTab(tab.key)}
              className={`flex-1 py-2 mx-1 rounded-lg ${
                selectedTab === tab.key ? 'bg-blue-600' : 'bg-transparent'
              }`}>
              <Text className={`text-center font-medium ${
                selectedTab === tab.key ? 'text-white' : 'text-gray-600'
              }`}>
                {tab.label} ({tab.count})
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView className="flex-1 px-6 py-4">
        {filteredAssets.length === 0 ? (
          <View className="bg-white rounded-xl p-8 items-center">
            <Text className="text-6xl mb-4">⛏️</Text>
            <Text className="text-gray-900 text-xl font-bold mb-2">
              No {selectedTab === 'all' ? '' : selectedTab} assets
            </Text>
            <Text className="text-gray-600 text-center mb-6">
              Start mining to see your assets here
            </Text>
            <CustomButton
              title="Browse Assets"
              onPress={() => {}}
              variant="primary"
            />
          </View>
        ) : (
          <View className="space-y-4">
            {filteredAssets.map((asset) => (
              <View key={asset.id} className="bg-white rounded-xl p-4 shadow-sm">
                <View className="flex-row justify-between items-start mb-3">
                  <View className="flex-row items-center flex-1">
                    <View className="w-12 h-12 bg-blue-600 rounded-full items-center justify-center mr-3">
                      <Text className="text-white font-bold text-lg">
                        {asset.symbol[0]}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-gray-900 text-lg font-bold">
                        {asset.name}
                      </Text>
                      <Text className="text-gray-500 text-sm">
                        Started: {new Date(asset.startDate).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                  <View className={`px-2 py-1 rounded-full ${getStatusColor(asset.status)}`}>
                    <Text className="text-white text-xs font-medium capitalize">
                      {asset.status}
                    </Text>
                  </View>
                </View>

                <View className="grid grid-cols-3 gap-4 mb-4">
                  <View>
                    <Text className="text-gray-500 text-sm">Daily Earnings</Text>
                    <Text className="text-green-600 text-lg font-bold">
                      ₹{asset.dailyEarnings.toFixed(2)}
                    </Text>
                  </View>
                  <View>
                    <Text className="text-gray-500 text-sm">Total Earned</Text>
                    <Text className="text-blue-600 text-lg font-bold">
                      ₹{asset.totalEarnings.toFixed(2)}
                    </Text>
                  </View>
                  <View>
                    <Text className="text-gray-500 text-sm">Hash Rate</Text>
                    <Text className="text-gray-900 text-lg font-bold">
                      {asset.hashRate}
                    </Text>
                  </View>
                </View>

                <View className="flex-row space-x-2">
                  {asset.status === 'active' ? (
                    <>
                      <CustomButton
                        title="Pause"
                        onPress={() => {}}
                        variant="secondary"
                        size="sm"
                        className="flex-1"
                      />
                      <CustomButton
                        title="Details"
                        onPress={() => {}}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      />
                    </>
                  ) : (
                    <>
                      <CustomButton
                        title="Resume"
                        onPress={() => {}}
                        variant="primary"
                        size="sm"
                        className="flex-1"
                      />
                      <CustomButton
                        title="Stop"
                        onPress={() => {}}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      />
                    </>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default MyAssets;