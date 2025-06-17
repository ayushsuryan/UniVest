import React from 'react';
import { View, Text, Image, ImageBackground } from 'react-native';
import CustomButton from '../Components/Button';

const Landing: React.FC = () => {
  const handleGetStarted = (): void => {
    console.log('Get Started pressed');
  };

  return (
    <ImageBackground
      source={require('../../assets/Landing/bg.jpg')} 
      resizeMode="contain"
      className="w-full flex-1"
    >
      <View className="w-full py-10 flex-1 bg-gradient-to-b from-blue-100 to-white px-12">
        <View className="flex-1 justify-center items-center px-2">
          <Image
            source={require('../../assets/Landing/landing.png')}
            className="w-full h-full rounded-xl relative bottom-10"
            resizeMode="contain"
          />
        </View>

        <View className="flex items-center my-6">
          <Text className="text-3xl  text-primary text-center leading-snug">
            Welcome to{'\n'}Shop Turf
          </Text>
        </View>

        <View className="mt-8 mb-8 items-center">
          <View className="w-full max-w-xs">
            <CustomButton title="Get Started" onPress={handleGetStarted} />
          </View>
        </View>
      </View>
    </ImageBackground>
  );
};

export default Landing;
