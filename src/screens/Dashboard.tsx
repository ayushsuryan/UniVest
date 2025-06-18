import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Text} from 'react-native';
import Home from './dashboard/Home';
import Assets from './dashboard/Assets';
import MyAssets from './dashboard/MyAssets';
import Profile from './dashboard/Profile';

const Tab = createBottomTabNavigator();

const Dashboard: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#6b7280',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          paddingTop: 8,
          paddingBottom: 8,
          height: 80,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
      }}>
      <Tab.Screen 
        name="Home" 
        component={Home}
        options={{
          tabBarIcon: ({color}) => (
            <Text style={{color, fontSize: 20}}>🏠</Text>
          ),
        }}
      />
      <Tab.Screen 
        name="Assets" 
        component={Assets}
        options={{
          tabBarIcon: ({color}) => (
            <Text style={{color, fontSize: 20}}>💎</Text>
          ),
        }}
      />
      <Tab.Screen 
        name="MyAssets" 
        component={MyAssets}
        options={{
          tabBarLabel: 'My Assets',
          tabBarIcon: ({color}) => (
            <Text style={{color, fontSize: 20}}>💼</Text>
          ),
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={Profile}
        options={{
          tabBarIcon: ({color}) => (
            <Text style={{color, fontSize: 20}}>👤</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default Dashboard;