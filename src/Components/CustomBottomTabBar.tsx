import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';


interface CustomBottomTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}


const CustomBottomTabBar: React.FC<CustomBottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const animatedValues = useRef(
    state.routes.map(() => new Animated.Value(0))
  ).current;

  const scaleValues = useRef(
    state.routes.map(() => new Animated.Value(1))
  ).current;

  const translateValues = useRef(
    state.routes.map(() => new Animated.Value(0))
  ).current;

  useEffect(() => {
    animatedValues.forEach((animatedValue: any, index: any) => {
      if (index === state.index) {
        Animated.parallel([
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 300,
            useNativeDriver: false,
          }),
          Animated.spring(scaleValues[index], {
            toValue: 1.1,
            useNativeDriver: true,
          }),
          Animated.spring(translateValues[index], {
            toValue: -8,
            useNativeDriver: true,
          }),
        ]).start();
      } else {
        Animated.parallel([
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 300,
            useNativeDriver: false,
          }),
          Animated.spring(scaleValues[index], {
            toValue: 1,
            useNativeDriver: true,
          }),
          Animated.spring(translateValues[index], {
            toValue: 0,
            useNativeDriver: true,
          }),
        ]).start();
      }
    });
  }, [state.index]);

  const getTabIcon = (routeName: string) => {
    switch (routeName) {
      case 'Home':
        return 'home';
      case 'Assets':
        return 'trending-up';
      case 'My':
        return 'bar-chart-2';
      case 'Team':
        return 'users';
      case 'Profile':
        return 'user';
      case 'Portfolio':
        return 'pie-chart';
      case 'Markets':
        return 'trending-up';
      case 'Investments':
        return 'bar-chart-2';
      default:
        return 'circle';
    }
  };

  return (
    <View style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'transparent',
    }}>
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 16,
          right: 16,
          height: 88,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: 28,
          borderWidth: 1,
          borderColor: 'rgba(16, 185, 129, 0.1)',
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 8,
          },
          shadowOpacity: 0.1,
          shadowRadius: 24,
          elevation: 12,
        }}
      />

      <View
        style={{
          flexDirection: 'row',
          paddingHorizontal: 32,
          paddingVertical: 16,
          paddingBottom: Platform.OS === 'ios' ? 28 : 16,
          justifyContent: 'space-around',
          alignItems: 'center',
        }}
      >
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          // Animated background color
          const backgroundColor = animatedValues[index].interpolate({
            inputRange: [0, 1],
            outputRange: ['rgba(16, 185, 129, 0)', 'rgba(16, 185, 129, 0.12)'],
          });

          // Animated border color
          const borderColor = animatedValues[index].interpolate({
            inputRange: [0, 1],
            outputRange: ['rgba(16, 185, 129, 0)', 'rgba(16, 185, 129, 0.3)'],
          });

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              activeOpacity={0.7}
              style={{
                width: `${100 / state.routes.length}%`,
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 8,
              }}
            >
              <Animated.View
                style={{
                  transform: [
                    { scale: scaleValues[index] },
                    { translateY: translateValues[index] },
                  ],
                }}
              >
                <Animated.View
                  style={{
                    backgroundColor,
                    borderWidth: 1,
                    borderColor,
                    borderRadius: 20,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: 56,
                  }}
                >
                  <FeatherIcon
                    name={getTabIcon(route.name)}
                    size={isFocused ? 20 : 18}
                    color={isFocused ? '#059669' : '#6B7280'}
                    style={{
                      marginBottom: isFocused ? 4 : 2,
                    }}
                  />

                  {isFocused && (
                    <Animated.View
                      style={{
                        opacity: animatedValues[index],
                        transform: [
                          {
                            translateY: animatedValues[index].interpolate({
                              inputRange: [0, 1],
                              outputRange: [10, 0],
                            }),
                          },
                        ],
                      }}
                    >
                      <Text
                        style={{
                          color: '#059669',
                          fontSize: 12,
                          fontWeight: '700',
                          textAlign: 'center',
                        }}
                      >
                        {route.name}
                      </Text>
                    </Animated.View>
                  )}

                  {!isFocused && (
                    <Text
                      style={{
                        color: '#9CA3AF',
                        fontSize: 11,
                        fontWeight: '600',
                        textAlign: 'center',
                        marginTop: 2,
                      }}
                    >
                      {route.name}''
                    </Text>
                  )}
                </Animated.View>
              </Animated.View>

              {/* Active Tab Indicator */}
              {isFocused && (
                <Animated.View
                  style={{
                    position: 'absolute',
                    bottom: -8,
                    width: animatedValues[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 32],
                    }),
                    height: 4,
                    backgroundColor: '#059669',
                    borderRadius: 2,
                    opacity: animatedValues[index],
                  }}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>


    </View>
  );
};

export default CustomBottomTabBar;