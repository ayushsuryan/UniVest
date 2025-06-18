import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StatusBar,
  Animated,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FeatherIcon from 'react-native-vector-icons/Feather';
import CustomButton from '../Components/CustomButton';

interface LandingProps {
  navigation: any;
}

const { width, height } = Dimensions.get('window');

const Landing: React.FC<LandingProps> = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const FeatureCard = ({ icon, title, description, index }: any) => {
    const cardAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.timing(cardAnim, {
        toValue: 1,
        duration: 600,
        delay: index * 200,
        useNativeDriver: true,
      }).start();
    }, []);

    return (
      <Animated.View
        style={{
          opacity: cardAnim,
          transform: [
            {
              translateY: cardAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0],
              }),
            },
          ],
        }}
        className="mb-6"
      >
        <View className="rounded-3xl p-6 border border-blue-200">
          <View className="flex-row items-center mb-4">
            <View
              className="rounded-2xl p-4 mr-4"
              style={{ backgroundColor: 'rgba(69, 155, 254, 0.08)' }}
            >
              <FeatherIcon name={icon} size={28} color="#1D4ED8" />
            </View>
            <Text className="text-gray-800 text-xl font-bold flex-1">
              {title}
            </Text>
          </View>
          <Text className="text-gray-600 leading-6 text-base">
            {description}
          </Text>
        </View>
      </Animated.View>
    );
  };

  const StatCard = ({ icon, value, label, index }: any) => {
    const statAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.timing(statAnim, {
        toValue: 1,
        duration: 800,
        delay: index * 150,
        useNativeDriver: true,
      }).start();
    }, []);

    return (
      <Animated.View
        style={{
          opacity: statAnim,
          transform: [
            {
              scale: statAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1],
              }),
            },
          ],
        }}
        className="items-center flex-1"
      >
        <View
          className="rounded-full p-4 mb-3"
          style={{ backgroundColor: 'rgba(69, 155, 254, 0.08)' }}
        >
          <FeatherIcon name={icon} size={24} color="#1D4ED8" />
        </View>
        <Text className="text-gray-800 text-2xl font-black mb-1">{value}</Text>
        <Text className="text-gray-500 text-sm text-center font-medium">
          {label}
        </Text>
      </Animated.View>
    );
  };

  return (
    <View className="flex-1">
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

      {/* Light Background with blue Accents */}
      <View
        className="absolute inset-0"
        style={{ backgroundColor: '#f8fafc' }}
      />

      {/* Decorative Elements */}
      <View className="absolute inset-0">
        <View
          className="absolute top-20 right-10 w-32 h-32 rounded-full opacity-20"
          style={{ backgroundColor: 'rgba(69, 155, 254, 0.08)' }}
        />
        <View
          className="absolute top-60 left-8 w-20 h-20 rounded-full opacity-30"
          style={{ backgroundColor: 'rgba(168, 85, 247, 0.1)' }}
        />
        <View
          className="absolute bottom-80 right-16 w-24 h-24 rounded-full opacity-25"
          style={{ backgroundColor: 'rgba(147, 51, 234, 0.1)' }}
        />
        <View
          className="absolute bottom-40 left-12 w-16 h-16 rounded-full opacity-35"
          style={{ backgroundColor: 'rgba(196, 181, 253, 0.2)' }}
        />
      </View>

      <SafeAreaView className="flex-1">
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {/* Hero Section */}
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
            }}
            className="items-center px-6 pt-16 pb-12"
          >
            <Animated.View className="mb-8">
              <View className="relative">
                <Image
                  source={require('../../assets/logo.png')}
                  className="w-20 h-20"
                  resizeMode="contain"
                />
              </View>
            </Animated.View>

            <View className="items-center mb-10">
              <Text className="text-gray-800 text-4xl font-black text-center mb-3">
                Cloud<Text className="text-blue-600">Miner</Text>
              </Text>
              <View
                className="rounded-full px-6 py-3 border border-blue-200"
                style={{ backgroundColor: 'rgba(69, 155, 254, 0.08)' }}
              >
                <Text className="text-blue-700 text-lg font-bold text-center">
                  ⚡ The Future of Mining ⚡
                </Text>
              </View>
            </View>

            {/* Live Status Bar */}
            <View
              className="rounded-full px-8 py-4 border border-blue-100"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
            >
              <View className="flex-row items-center justify-center">
                <View className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse" />
                <Text className="text-green-600 text-sm font-bold mr-4">
                  Live Network
                </Text>
                <Text className="text-gray-400 text-sm mr-4">•</Text>
                <Text className="text-gray-700 text-sm font-semibold mr-4">
                  50K+ Active
                </Text>
                <Text className="text-gray-400 text-sm mr-4">•</Text>
                <Text className="text-blue-600 text-sm font-bold">
                  ₹2M+ Earned
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* Call to Action */}
          <View className="px-6 space-y-4 mb-8">
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.8}
              className="rounded-2xl p-5"
              style={{
                backgroundColor: '#1D4ED8',
                shadowColor: '#1D4ED8',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 20,
                elevation: 12,
              }}
            >
              <View className="flex-row items-center justify-center">
                <FeatherIcon name="arrow-right" size={22} color="white" />
                <Text className="text-white text-lg font-bold ml-3">
                  Start Mining Now
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Features Section */}
          <View className="px-6 mb-12">
            <View className="items-center mb-12">
              <Text className="text-gray-800 text-3xl font-black text-center mb-3">
                Why Choose <Text className="text-blue-600">CloudMiner?</Text>
              </Text>
              <View className="w-20 h-1 bg-blue-500 rounded-full" />
            </View>

            <FeatureCard
              icon="zap"
              title="Lightning Fast Mining"
              description="Powered by cutting-edge AI algorithms and quantum-optimized hardware for maximum hash rates and mining efficiency."
              index={0}
            />

            <FeatureCard
              icon="trending-up"
              title="Smart Profit Optimization"
              description="Our intelligent system automatically switches between the most profitable cryptocurrencies in real-time for maximum returns."
              index={1}
            />

            <FeatureCard
              icon="shield"
              title="Military-Grade Security"
              description="Multi-layer encryption, cold storage, and 24/7 monitoring ensure your investments are always protected and secure."
              index={2}
            />
          </View>

          {/* Enhanced Stats Section */}
          <View className="mx-6 mb-12">
            <View className="rounded-3xl p-8 border border-blue-100">
              <View className="items-center mb-8">
                <View
                  className="rounded-2xl px-6 py-3 border border-blue-200 mb-4"
                  style={{ backgroundColor: 'rgba(69, 155, 254, 0.08)' }}
                >
                  <Text className="text-blue-700 text-lg font-bold">
                    📊 Live Platform Stats
                  </Text>
                </View>
              </View>

              <View className="flex-row justify-around">
                <StatCard
                  icon="users"
                  value="50K+"
                  label="Active Miners"
                  index={0}
                />
                <StatCard
                  icon="dollar-sign"
                  value="₹2M+"
                  label="Total Earned"
                  index={1}
                />
                <StatCard
                  icon="activity"
                  value="99.9%"
                  label="Uptime"
                  index={2}
                />
              </View>
            </View>
          </View>

          {/* Trust Indicators */}
          <View className="px-6">
            <View className="rounded-2xl p-6">
              <View className="flex-row justify-center items-center">
                <Text className="text-gray-600 text-sm font-medium mr-6">
                  ISO 27001 Certified
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default Landing;
