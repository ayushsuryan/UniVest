import React from 'react';
import { Text, TouchableOpacity } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
}

const CustomButton: React.FC<ButtonProps> = ({ title, onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-secondary py-4 rounded-full items-center"
      activeOpacity={0.8}
    >
      <Text className="text-white text-base font-semibold">{title}</Text>
    </TouchableOpacity>
  );
};

export default CustomButton;
