import React, {useState} from 'react';
import {View, Text, ScrollView, TouchableOpacity, Switch, Alert} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import CustomButton from '../../Components/CustomButton';

const Profile: React.FC = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoReinvest, setAutoReinvest] = useState(false);
  const [twoFactorAuth, setTwoFactorAuth] = useState(true);

  const userInfo = {
    name: 'John Doe',
    email: 'demo@cloudminer.com',
    joinDate: '2024-01-15',
    totalEarnings: 1234.56,
    referralCode: 'CM123456',
    kyc: 'Verified',
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Logout', style: 'destructive', onPress: () => {}},
      ]
    );
  };

  const menuItems = [
    {
      title: 'Account Settings',
      icon: '⚙️',
      onPress: () => {},
    },
    {
      title: 'Security',
      icon: '🔒',
      onPress: () => {},
    },
    {
      title: 'Payment Methods',
      icon: '💳',
      onPress: () => {},
    },
    {
      title: 'Transaction History',
      icon: '📊',
      onPress: () => {},
    },
    {
      title: 'Referral Program',
      icon: '👥',
      onPress: () => {},
    },
    {
      title: 'Help & Support',
      icon: '❓',
      onPress: () => {},
    },
    {
      title: 'Terms of Service',
      icon: '📋',
      onPress: () => {},
    },
    {
      title: 'Privacy Policy',
      icon: '🔐',
      onPress: () => {},
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="bg-blue-600 px-6 py-8 rounded-b-3xl">
          <View className="items-center">
            <View className="w-20 h-20 bg-white rounded-full items-center justify-center mb-4">
              <Text className="text-blue-600 text-2xl font-bold">
                {userInfo.name.split(' ').map(n => n[0]).join('')}
              </Text>
            </View>
            <Text className="text-white text-2xl font-bold">
              {userInfo.name}
            </Text>
            <Text className="text-blue-200 text-base">
              {userInfo.email}
            </Text>
            <View className="bg-green-500 px-3 py-1 rounded-full mt-2">
              <Text className="text-white text-sm font-medium">
                {userInfo.kyc}
              </Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View className="px-6 py-6">
          <View className="bg-white rounded-xl p-6 shadow-sm mb-6">
            <Text className="text-gray-900 text-xl font-bold mb-4">
              Account Overview
            </Text>
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-gray-600">Member Since</Text>
              <Text className="text-gray-900 font-medium">
                {new Date(userInfo.joinDate).toLocaleDateString()}
              </Text>
            </View>
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-gray-600">Total Earnings</Text>
              <Text className="text-green-600 font-bold text-lg">
                ₹{userInfo.totalEarnings.toFixed(2)}
              </Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-600">Referral Code</Text>
              <TouchableOpacity className="bg-blue-100 px-3 py-1 rounded">
                <Text className="text-blue-600 font-medium">
                  {userInfo.referralCode}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Settings */}
          <View className="bg-white rounded-xl p-6 shadow-sm mb-6">
            <Text className="text-gray-900 text-xl font-bold mb-4">
              Preferences
            </Text>
            
            <View className="flex-row justify-between items-center py-3 border-b border-gray-100">
              <View>
                <Text className="text-gray-900 font-medium">Notifications</Text>
                <Text className="text-gray-500 text-sm">Mining alerts & updates</Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{false: '#e5e7eb', true: '#3b82f6'}}
                thumbColor={notificationsEnabled ? '#ffffff' : '#ffffff'}
              />
            </View>

            <View className="flex-row justify-between items-center py-3 border-b border-gray-100">
              <View>
                <Text className="text-gray-900 font-medium">Auto Reinvest</Text>
                <Text className="text-gray-500 text-sm">Automatically reinvest earnings</Text>
              </View>
              <Switch
                value={autoReinvest}
                onValueChange={setAutoReinvest}
                trackColor={{false: '#e5e7eb', true: '#3b82f6'}}
                thumbColor={autoReinvest ? '#ffffff' : '#ffffff'}
              />
            </View>

            <View className="flex-row justify-between items-center py-3">
              <View>
                <Text className="text-gray-900 font-medium">Two-Factor Auth</Text>
                <Text className="text-gray-500 text-sm">Extra security for your account</Text>
              </View>
              <Switch
                value={twoFactorAuth}
                onValueChange={setTwoFactorAuth}
                trackColor={{false: '#e5e7eb', true: '#3b82f6'}}
                thumbColor={twoFactorAuth ? '#ffffff' : '#ffffff'}
              />
            </View>
          </View>

          {/* Menu Items */}
          <View className="bg-white rounded-xl shadow-sm mb-6">
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                onPress={item.onPress}
                className={`flex-row items-center px-6 py-4 ${
                  index !== menuItems.length - 1 ? 'border-b border-gray-100' : ''
                }`}>
                <Text className="text-xl mr-4">{item.icon}</Text>
                <Text className="text-gray-900 font-medium flex-1">
                  {item.title}
                </Text>
                <Text className="text-gray-400 text-xl">›</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Logout Button */}
          <CustomButton
            title="Logout"
            onPress={handleLogout}
            variant="outline"
            size="lg"
            className="w-full border-red-500"
          />
          
          <Text className="text-gray-500 text-center text-sm mt-6">
            CloudMiner v1.0.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;