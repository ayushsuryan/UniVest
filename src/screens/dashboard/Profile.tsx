import React, {useState} from 'react';
import {View, Text, ScrollView, TouchableOpacity, Switch} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import FeatherIcon from 'react-native-vector-icons/Feather';
import Wallet from '../../Components/Wallet';
import { useAuth } from '../../context/AuthContext';
import { showToast } from '../../utils/toast';

const Profile: React.FC = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [marketAlertsEnabled, setMarketAlertsEnabled] = useState(true);
  const [showWallet, setShowWallet] = useState(false);

  // Get user data and logout function from AuthContext
  const { user, logout, isLoading } = useAuth();

  const userStats = {
    totalInvested: 150000,
    totalReturns: 37500,
    activeInvestments: 5,
    tradingDays: 45,
    successRate: 85,
    portfolioGrowth: 25.0,
  };

  const handleLogout = () => {
    showToast.warning('Tap to confirm logout from your account.', 'Confirm Logout');
    
    // Auto-proceed with logout after showing warning
    setTimeout(async () => {
      try {
        await logout();
        // Navigation will be handled automatically by AuthGuard
        showToast.success('You have been successfully logged out.', 'Logged Out');
      } catch (error) {
        showToast.error('Failed to logout. Please try again.');
        console.error('Logout error:', error);
      }
    }, 2000);
  };

  const handleReferUser = () => {
    showToast.info('Share your referral code: COMM2024\n\nEarn ₹500 for each successful referral!', 'Refer a Friend');
  };

  const menuItems = [
    {
      id: '1',
      title: 'My Wallet',
      subtitle: 'Manage deposits & withdrawals',
      icon: 'credit-card',
      color: '#059669',
      onPress: () => setShowWallet(true),
    },
    {
      id: '2',
      title: 'Refer Friends',
      subtitle: 'Earn ₹500 per successful referral',
      icon: 'users',
      color: '#7c3aed',
      onPress: handleReferUser,
    },
    {
      id: '3',
      title: 'Trading History',
      subtitle: 'View all your commodity trades',
      icon: 'clock',
      color: '#059669',
      onPress: () => console.log('Trading History'),
    },
    {
      id: '4',
      title: 'Investment Analytics',
      subtitle: 'Detailed performance reports',
      icon: 'bar-chart-2',
      color: '#0891b2',
      onPress: () => console.log('Investment Analytics'),
    },
    {
      id: '5',
      title: 'Tax Documents',
      subtitle: 'Download trading statements',
      icon: 'file-text',
      color: '#ea580c',
      onPress: () => console.log('Tax Documents'),
    },
    {
      id: '6',
      title: 'Security Settings',
      subtitle: 'Manage account security',
      icon: 'shield',
      color: '#dc2626',
      onPress: () => console.log('Security Settings'),
    },
    {
      id: '7',
      title: 'Help & Support',
      subtitle: 'Get help with commodity trading',
      icon: 'help-circle',
      color: '#059669',
      onPress: () => console.log('Help & Support'),
    },
  ];

  const settingsItems = [
    {
      id: '1',
      title: 'Push Notifications',
      subtitle: 'Get notified about your investments',
      value: notificationsEnabled,
      onToggle: setNotificationsEnabled,
    },
    {
      id: '2',
      title: 'Biometric Login',
      subtitle: 'Use fingerprint or face ID',
      value: biometricEnabled,
      onToggle: setBiometricEnabled,
    },
    {
      id: '3',
      title: 'Market Alerts',
      subtitle: 'Commodity price & demand updates',
      value: marketAlertsEnabled,
      onToggle: setMarketAlertsEnabled,
    },
  ];

  if (showWallet) {
    return <Wallet />;
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

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-6 pt-8 pb-6">
          <View className="flex-row items-center justify-between mb-8">
            <View>
              <Text className="text-gray-900 text-3xl font-black">
                Profile 👤
              </Text>
              <Text className="text-gray-600 text-base mt-1">
                Manage your trading account
              </Text>
            </View>
            <TouchableOpacity
              className="rounded-2xl p-3 bg-white shadow-sm border border-gray-100"
              activeOpacity={0.8}
            >
              <FeatherIcon name="edit-3" size={24} color="#059669" />
            </TouchableOpacity>
          </View>

          {/* Profile Card */}
          <View className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 mb-6">
            <View className="flex-row items-center mb-6">
              <View 
                className="w-20 h-20 rounded-3xl items-center justify-center mr-4 shadow-sm"
                style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}
              >
                {user?.profilePicture ? (
                  <Text className="text-3xl">👤</Text>
                ) : (
                  <Text className="text-3xl">
                    {user?.firstName ? user.firstName.charAt(0).toUpperCase() : '👤'}
                  </Text>
                )}
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 text-2xl font-black">
                  {user ? `${user.firstName} ${user.lastName}` : 'Commodity Trader'}
                </Text>
                <Text className="text-gray-500 text-base">
                  {user?.email || 'trader@hourlyclub.com'}
                </Text>
                <View className="flex-row items-center mt-2">
                  <View className={`w-3 h-3 ${user?.isEmailVerified ? 'bg-green-500' : 'bg-yellow-500'} rounded-full mr-2`} />
                  <Text className={`text-sm font-bold ${user?.isEmailVerified ? 'text-green-600' : 'text-yellow-600'}`}>
                    {user?.isEmailVerified ? 'Verified Trader' : 'Email Verification Pending'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Trading Stats */}
            <View className="border-t border-gray-100 pt-6">
              <Text className="text-gray-900 text-lg font-black mb-4">Trading Statistics</Text>
              <View className="flex-row flex-wrap justify-between">
                <View className="w-[48%] mb-4">
                  <Text className="text-gray-500 text-sm">Total Invested</Text>
                  <Text className="text-gray-900 text-xl font-black">
                    ₹{userStats.totalInvested.toLocaleString()}
                  </Text>
                </View>
                <View className="w-[48%] mb-4">
                  <Text className="text-gray-500 text-sm">Total Returns</Text>
                  <Text className="text-green-600 text-xl font-black">
                    +₹{userStats.totalReturns.toLocaleString()}
                  </Text>
                </View>
                <View className="w-[48%] mb-4">
                  <Text className="text-gray-500 text-sm">Active Investments</Text>
                  <Text className="text-gray-900 text-xl font-black">
                    {userStats.activeInvestments}
                  </Text>
                </View>
                <View className="w-[48%] mb-4">
                  <Text className="text-gray-500 text-sm">Trading Days</Text>
                  <Text className="text-gray-900 text-xl font-black">
                    {userStats.tradingDays}
                  </Text>
                </View>
                <View className="w-[48%]">
                  <Text className="text-gray-500 text-sm">Success Rate</Text>
                  <Text className="text-green-600 text-xl font-black">
                    {userStats.successRate}%
                  </Text>
                </View>
                <View className="w-[48%]">
                  <Text className="text-gray-500 text-sm">Portfolio Growth</Text>
                  <Text className="text-green-600 text-xl font-black">
                    +{userStats.portfolioGrowth}%
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Referral Program Card */}
          <View className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-3xl p-6 shadow-lg mb-6">
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-emerald-700 text-xl font-black mb-2">
                  Invite Friends to Trade
                </Text>
                <Text className="text-emerald-500 text-base mb-4">
                  Earn ₹500 for each successful referral
                </Text>
                <TouchableOpacity
                  className="bg-white rounded-2xl px-6 py-3 self-start"
                  activeOpacity={0.8}
                >
                  <Text className="text-emerald-600 text-base font-black">
                    Share Invite Code
                  </Text>
                </TouchableOpacity>
              </View>
              <View 
                className="w-16 h-16 rounded-2xl items-center justify-center"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
              >
                <FeatherIcon name="gift" size={32} color="white" />
              </View>
            </View>
          </View>
        </View>

        {/* Menu Items */}
        <View className="px-6 mb-6">
          <Text className="text-gray-900 text-xl font-black mb-4">Account Management</Text>
          <View className="space-y-3">
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={item.onPress}
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex-row items-center"
                activeOpacity={0.8}
              >
                <View 
                  className="w-12 h-12 rounded-2xl items-center justify-center mr-4"
                  style={{ backgroundColor: `${item.color}15` }}
                >
                  <FeatherIcon name={item.icon as any} size={24} color={item.color} />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-900 text-lg font-black">{item.title}</Text>
                  <Text className="text-gray-500 text-sm">{item.subtitle}</Text>
                </View>
                <FeatherIcon name="chevron-right" size={20} color="#9ca3af" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Settings */}
        <View className="px-6 mb-6">
          <Text className="text-gray-900 text-xl font-black mb-4">Preferences</Text>
          <View className="bg-white rounded-2xl shadow-sm border border-gray-100">
            {settingsItems.map((setting, index) => (
              <View key={setting.id}>
                <View className="flex-row items-center justify-between p-4">
                  <View className="flex-1">
                    <Text className="text-gray-900 text-lg font-black">{setting.title}</Text>
                    <Text className="text-gray-500 text-sm">{setting.subtitle}</Text>
                  </View>
                  <Switch
                    value={setting.value}
                    onValueChange={setting.onToggle}
                    trackColor={{ false: '#f3f4f6', true: '#10b981' }}
                    thumbColor={setting.value ? '#ffffff' : '#ffffff'}
                    ios_backgroundColor="#f3f4f6"
                  />
                </View>
                {index < settingsItems.length - 1 && (
                  <View className="mx-4 border-b border-gray-100" />
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Logout Section */}
        <View className="px-6 pb-24">
          <TouchableOpacity
            onPress={handleLogout}
            disabled={isLoading}
            className="bg-white rounded-2xl p-4 shadow-sm border border-red-200 flex-row items-center justify-center"
            activeOpacity={0.8}
            style={{ opacity: isLoading ? 0.7 : 1 }}
          >
            {isLoading ? (
              <>
                <FeatherIcon name="loader" size={24} color="#dc2626" />
                <Text className="text-red-600 text-lg font-black ml-3">
                  Logging Out...
                </Text>
              </>
            ) : (
              <>
                <FeatherIcon name="log-out" size={24} color="#dc2626" />
                <Text className="text-red-600 text-lg font-black ml-3">
                  Logout from Trading Account
                </Text>
              </>
            )}
          </TouchableOpacity>
          
          <View className="mt-6 items-center">
            <Text className="text-gray-400 text-sm text-center">
              Hourly Club v2.1.0
            </Text>
            <Text className="text-gray-400 text-xs text-center mt-1">
              Your investments are secured with bank-level encryption
            </Text>
            {user && (
              <Text className="text-gray-400 text-xs text-center mt-1">
                Last login: {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Today'}
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;