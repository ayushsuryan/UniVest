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
        <View className="rounded-3xl p-6 border border-emerald-200 bg-white shadow-sm">
          <View className="flex-row items-center mb-4">
            <View
              className="rounded-2xl p-4 mr-4"
              style={{ backgroundColor: 'rgba(16, 185, 129, 0.08)' }}
            >
              <FeatherIcon name={icon} size={28} color="#059669" />
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
          style={{ backgroundColor: 'rgba(16, 185, 129, 0.08)' }}
        >
          <FeatherIcon name={icon} size={24} color="#059669" />
        </View>
        <Text className="text-gray-800 text-2xl font-black mb-1">{value}</Text>
        <Text className="text-gray-500 text-sm text-center font-medium">
          {label}
        </Text>
      </Animated.View>
    );
  };

  const AssetCard = ({ icon, title, return_rate, risk_level, index }: any) => {
    const assetAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.timing(assetAnim, {
        toValue: 1,
        duration: 600,
        delay: index * 150,
        useNativeDriver: true,
      }).start();
    }, []);

    return (
      <Animated.View
        style={{
          opacity: assetAnim,
          transform: [
            {
              translateX: assetAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
          ],
        }}
        className="mr-4 w-48"
      >
        <View className="rounded-2xl p-5 bg-white border border-emerald-100 shadow-sm">
          <View
            className="rounded-xl p-3 mb-4 self-start"
            style={{ backgroundColor: 'rgba(16, 185, 129, 0.08)' }}
          >
            <FeatherIcon name={icon} size={24} color="#059669" />
          </View>
          <Text className="text-gray-800 text-lg font-bold mb-2">{title}</Text>
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-emerald-600 text-xl font-black">{return_rate}</Text>
            <View className="rounded-full px-3 py-1 bg-gray-100">
              <Text className="text-gray-600 text-xs font-medium">{risk_level}</Text>
            </View>
          </View>
          <TouchableOpacity
            className="rounded-xl py-3 px-4 bg-emerald-50 border border-emerald-200"
            activeOpacity={0.8}
          >
            <Text className="text-emerald-700 text-sm font-bold text-center">
              Invest Now
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  return (
    <View className="flex-1">
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

      {/* Light Background with emerald Accents */}
      <View
        className="absolute inset-0"
        style={{ backgroundColor: '#f8fafc' }}
      />

      {/* Decorative Elements */}
      <View className="absolute inset-0">
        <View
          className="absolute top-20 right-10 w-32 h-32 rounded-full opacity-20"
          style={{ backgroundColor: 'rgba(16, 185, 129, 0.08)' }}
        />
        <View
          className="absolute top-60 left-8 w-20 h-20 rounded-full opacity-30"
          style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}
        />
        <View
          className="absolute bottom-80 right-16 w-24 h-24 rounded-full opacity-25"
          style={{ backgroundColor: 'rgba(5, 150, 105, 0.1)' }}
        />
        <View
          className="absolute bottom-40 left-12 w-16 h-16 rounded-full opacity-35"
          style={{ backgroundColor: 'rgba(110, 231, 183, 0.2)' }}
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
                <View
                  className="w-20 h-20 rounded-2xl items-center justify-center"
                  style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}
                >
                  <FeatherIcon name="trending-up" size={40} color="#059669" />
                </View>
              </View>
            </Animated.View>

            <View className="items-center mb-10">
              <Text className="text-gray-800 text-4xl font-black text-center mb-3">
                Wealth<Text className="text-emerald-600">Builder</Text>
              </Text>
              <View
                className="rounded-full px-6 py-3 border border-emerald-200"
                style={{ backgroundColor: 'rgba(16, 185, 129, 0.08)' }}
              >
                <Text className="text-emerald-700 text-lg font-bold text-center">
                  💰 Smart Investment Platform 💰
                </Text>
              </View>
            </View>

            {/* Live Status Bar */}
            <View
              className="rounded-full px-8 py-4 border border-emerald-100"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
            >
              <View className="flex-row items-center justify-center">
                <View className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse" />
                <Text className="text-green-600 text-sm font-bold mr-4">
                  Markets Open
                </Text>
                <Text className="text-gray-400 text-sm mr-4">•</Text>
                <Text className="text-gray-700 text-sm font-semibold mr-4">
                  25K+ Investors
                </Text>
                <Text className="text-gray-400 text-sm mr-4">•</Text>
                <Text className="text-emerald-600 text-sm font-bold">
                  ₹500Cr+ AUM
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
                backgroundColor: '#059669',
                shadowColor: '#059669',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 20,
                elevation: 12,
              }}
            >
              <View className="flex-row items-center justify-center">
                <FeatherIcon name="arrow-right" size={22} color="white" />
                <Text className="text-white text-lg font-bold ml-3">
                  Start Investing Today
                </Text>
              </View>
            </TouchableOpacity>

     
          </View>

          {/* Featured Assets Section */}
          <View className="mb-12">
            <View className="px-6 mb-6">
              <Text className="text-gray-800 text-2xl font-black mb-2">
                Featured Investment Assets
              </Text>
              <Text className="text-gray-600 text-base">
                Diversified portfolio of high-performing assets
              </Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 24 }}
            >
              <AssetCard
                icon="bar-chart-2"
                title="Growth Stocks"
                return_rate="12.5%"
                risk_level="Medium"
                index={0}
              />
              <AssetCard
                icon="home"
                title="Real Estate"
                return_rate="8.7%"
                risk_level="Low"
                index={1}
              />
              <AssetCard
                icon="dollar-sign"
                title="Bonds & FD"
                return_rate="6.2%"
                risk_level="Very Low"
                index={2}
              />
              <AssetCard
                icon="zap"
                title="Crypto Assets"
                return_rate="18.3%"
                risk_level="High"
                index={3}
              />
            </ScrollView>
          </View>

          {/* Features Section */}
          <View className="px-6 mb-12">
            <View className="items-center mb-12">
              <Text className="text-gray-800 text-3xl font-black text-center mb-3">
                Why Invest with <Text className="text-emerald-600">Us?</Text>
              </Text>
              <View className="w-20 h-1 bg-emerald-500 rounded-full" />
            </View>

            <FeatureCard
              icon="target"
              title="Expert Asset Management"
              description="Our team of certified financial experts curate and manage a diversified portfolio of high-growth assets across multiple sectors."
              index={0}
            />

            <FeatureCard
              icon="trending-up"
              title="Consistent Returns"
              description="Track record of delivering superior returns with our data-driven investment strategies and risk management protocols."
              index={1}
            />

            <FeatureCard
              icon="shield"
              title="Regulated & Secure"
              description="SEBI registered platform with insurance protection, transparent reporting, and bank-grade security for your investments."
              index={2}
            />
          </View>

          {/* Enhanced Stats Section */}
          <View className="mx-6 mb-12">
            <View className="rounded-3xl p-8 border border-emerald-100 bg-white">
              <View className="items-center mb-8">
                <View
                  className="rounded-2xl px-6 py-3 border border-emerald-200 mb-4"
                  style={{ backgroundColor: 'rgba(16, 185, 129, 0.08)' }}
                >
                  <Text className="text-emerald-700 text-lg font-bold">
                    📈 Platform Performance
                  </Text>
                </View>
              </View>

              <View className="flex-row justify-around">
                <StatCard
                  icon="users"
                  value="25K+"
                  label="Active Investors"
                  index={0}
                />
                <StatCard
                  icon="dollar-sign"
                  value="₹500Cr+"
                  label="Assets Under Management"
                  index={1}
                />
                <StatCard
                  icon="award"
                  value="11.2%"
                  label="Average Returns"
                  index={2}
                />
              </View>
            </View>
          </View>

          {/* Trust Indicators */}
          <View className="px-6">
            <View className="rounded-2xl p-6 bg-white border border-emerald-100">
              <View className="flex-row justify-center items-center flex-wrap">
                <Text className="text-gray-600 text-sm font-medium mr-6 mb-2">
                  SEBI Registered
                </Text>
                <Text className="text-gray-600 text-sm font-medium mr-6 mb-2">
                  ISO 27001 Certified
                </Text>
                
              </View>
              <View className="items-center mt-4">
                <Text className="text-gray-500 text-xs text-center">
                  Investments are subject to market risks. Please read all documents carefully.
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