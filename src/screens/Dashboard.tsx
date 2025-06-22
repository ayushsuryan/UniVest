import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from './dashboard/Home';
import Assets from './dashboard/Assets';
import MyAssets from './dashboard/MyAssets';
import Team from './dashboard/Team';
import Profile from './dashboard/Profile';
import CustomBottomTabBar from '../Components/CustomBottomTabBar';
import { AuthGuard } from '../Components/AuthGuard';

const Tab = createBottomTabNavigator();

const Dashboard: React.FC = () => {
  return (
    <AuthGuard requireAuth={true} requireEmailVerified={true}>
      <Tab.Navigator
        tabBar={(props) => <CustomBottomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
        }}>
        <Tab.Screen name="Home" component={Home} />
        <Tab.Screen name="Assets" component={Assets} />
        <Tab.Screen name="My" component={MyAssets} />
        <Tab.Screen name="Team" component={Team} />
        <Tab.Screen name="Profile" component={Profile} />
      </Tab.Navigator>
    </AuthGuard>
  );
};

export default Dashboard;