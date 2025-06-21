import React from 'react';
import {View, Text, ScrollView, TouchableOpacity} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// Define navigation types
type StackParamList = {
  Landing: undefined;
  Login: undefined;
  Signup: undefined;
  OTPVerification: {
    email: string;
    phoneNumber?: string;
    fromScreen: string;
  };
  ResetPassword: {
    email?: string;
    phoneNumber?: string;
    verified?: boolean;
  };
  Dashboard: undefined;
  Notifications: undefined;
};

type NotificationsNavigationProp = StackNavigationProp<StackParamList, 'Notifications'>;

const Notifications: React.FC = () => {
  const navigation = useNavigation<NotificationsNavigationProp>();

  const handleBackPress = () => {
    navigation.navigate('Dashboard');
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
        <View className="px-6 pt-8 pb-6">
          <View className="flex-row items-center justify-between mb-8">
            <View className="flex-1">
              <Text className="text-gray-900 text-3xl font-black">
                Notifications 🔔
              </Text>
              <Text className="text-gray-600 text-base mt-1">
                Stay updated with your investments
              </Text>
            </View>
            <TouchableOpacity
              className="rounded-2xl p-3 bg-white shadow-sm border border-gray-100"
              activeOpacity={0.8}
              onPress={handleBackPress}
            >
              <FeatherIcon name="arrow-left" size={24} color="#059669" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Empty State */}
        <View className="flex-1 items-center justify-center px-6 py-20">
          <View 
            className="w-24 h-24 rounded-3xl items-center justify-center mb-6"
            style={{ backgroundColor: 'rgba(5, 150, 105, 0.1)' }}
          >
            <FeatherIcon name="bell-off" size={48} color="#059669" />
          </View>
          
          <Text className="text-gray-900 text-2xl font-black text-center mb-4">
            No Notifications Yet
          </Text>
          
          <Text className="text-gray-500 text-base text-center mb-8 leading-6">
            You'll receive notifications about your investments, market updates, and important account activities here.
          </Text>
          
          <TouchableOpacity
            className="rounded-2xl px-8 py-4 shadow-lg"
            style={{
              backgroundColor: '#059669',
              shadowColor: '#059669',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3,
              shadowRadius: 20,
            }}
            activeOpacity={0.8}
          >
            <View className="flex-row items-center">
              <FeatherIcon name="bell" size={20} color="white" />
              <Text className="text-white text-base font-black ml-2">
                Enable Notifications
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Notifications; 