import React, {useState} from 'react';
import {View, Text, ScrollView, TouchableOpacity} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import CustomButton from '../../Components/CustomButton';

interface Asset {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change: number;
  hashRate: string;
  profitability: string;
}

const Assets: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  
  const assets: Asset[] = [
    {
      id: '1',
      name: 'Bitcoin',
      symbol: 'BTC',
      price: 45250.30,
      change: 2.5,
      hashRate: '95.2 TH/s',
      profitability: 'High',
    },
    {
      id: '2',
      name: 'Ethereum',
      symbol: 'ETH',
      price: 3150.75,
      change: -1.2,
      hashRate: '2.5 GH/s',
      profitability: 'Medium',
    },
    {
      id: '3',
      name: 'Litecoin',
      symbol: 'LTC',
      price: 125.40,
      change: 0.8,
      hashRate: '15.2 MH/s',
      profitability: 'Medium',
    },
    {
      id: '4',
      name: 'Dogecoin',
      symbol: 'DOGE',
      price: 0.08,
      change: 5.2,
      hashRate: '125 MH/s',
      profitability: 'Low',
    },
  ];

  const filters = [
    {key: 'all', label: 'All'},
    {key: 'high', label: 'High Profit'},
    {key: 'medium', label: 'Medium Profit'},
    {key: 'low', label: 'Low Profit'},
  ];

  const filteredAssets = assets.filter(asset => {
    if (selectedFilter === 'all') return true;
    return asset.profitability.toLowerCase() === selectedFilter;
  });

  const getProfitabilityColor = (profitability: string) => {
    switch (profitability.toLowerCase()) {
      case 'high': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="bg-white px-6 py-4 border-b border-gray-200">
        <Text className="text-gray-900 text-2xl font-bold">
          Mining Assets
        </Text>
        <Text className="text-gray-600 text-sm mt-1">
          Choose assets to start mining
        </Text>
      </View>

      {/* Filters */}
      <View className="flex-row  px-6 py-4 space-x-3">
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.key}
              onPress={() => setSelectedFilter(filter.key)}
              className={`px-4  h-10  py-2 rounded-full ${
                selectedFilter === filter.key
                  ? 'bg-blue-600'
                  : 'bg-gray-200'
              }`}>
              <Text className={`font-medium ${
                selectedFilter === filter.key
                  ? 'text-white'
                  : 'text-gray-700'
              }`}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

      <ScrollView className="flex-1 px-6 py-4">
        <View className="space-y-4">
          {filteredAssets.map((asset) => (
            <View key={asset.id} className="bg-white rounded-xl p-4 shadow-sm">
              <View className="flex-row justify-between items-start mb-3">
                <View className="flex-row items-center">
                  <View className="w-12 h-12 bg-blue-600 rounded-full items-center justify-center mr-3">
                    <Text className="text-white font-bold text-lg">
                      {asset.symbol[0]}
                    </Text>
                  </View>
                  <View>
                    <Text className="text-gray-900 text-lg font-bold">
                      {asset.name}
                    </Text>
                    <Text className="text-gray-500 text-sm">
                      {asset.symbol}
                    </Text>
                  </View>
                </View>
                <View className={`px-2 py-1 rounded-full ${getProfitabilityColor(asset.profitability)}`}>
                  <Text className="text-white text-xs font-medium">
                    {asset.profitability}
                  </Text>
                </View>
              </View>

              <View className="flex-row justify-between items-center mb-4">
                <View>
                  <Text className="text-gray-500 text-sm">Price</Text>
                  <Text className="text-gray-900 text-lg font-bold">
                    ₹{asset.price.toLocaleString()}
                  </Text>
                </View>
                <View>
                  <Text className="text-gray-500 text-sm">24h Change</Text>
                  <Text className={`text-lg font-bold ${
                    asset.change >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {asset.change >= 0 ? '+' : ''}{asset.change}%
                  </Text>
                </View>
                <View>
                  <Text className="text-gray-500 text-sm">Hash Rate</Text>
                  <Text className="text-gray-900 text-lg font-bold">
                    {asset.hashRate}
                  </Text>
                </View>
              </View>

              <CustomButton
                title="Start Mining"
                onPress={() => {}}
                variant="primary"
                className="w-full"
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Assets;