import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Home from './dashboard/Home';
import Assets from './dashboard/Assets';
import MyAssets from './dashboard/MyAssets';
import Profile from './dashboard/Profile';
import CustomBottomTabBar from '../Components/CustomBottomTabBar';

const Tab = createBottomTabNavigator();

const Dashboard: React.FC = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomBottomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}>
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Assets" component={Assets} />
      <Tab.Screen name="My" component={MyAssets} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
};

export default Dashboard;