import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, BarChart2, MessageCircle, User } from 'lucide-react-native';
import { Palette, Typography } from '../constants/theme';

// Import Stacks/Screens
import AppStack from '../navigation/AppStark';
import EarningsStack from '../navigation/EarningsStack';
import MessageStack from '../navigation/MessageStack';
import ProfileStack from '../navigation/ProfileStack';

const Tab = createBottomTabNavigator();

/**
 * TabStack: The Main Application Shell
 * Provides quick access to Orders, Earnings, Messages, and Profile.
 */
const TabStack = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          if (route.name === 'Orders') return <Home size={size} color={color} />;
          if (route.name === 'Money') return <BarChart2 size={size} color={color} />;
          if (route.name === 'Messages') return <MessageCircle size={size} color={color} />;
          if (route.name === 'Profile') return <User size={size} color={color} />;
        },
        tabBarActiveTintColor: Palette.primary,
        tabBarInactiveTintColor: Palette.gray400,
        tabBarStyle: {
          backgroundColor: Palette.white,
          borderTopWidth: 1,
          borderTopColor: Palette.gray200,
          height: 70,
          paddingBottom: 12,
          paddingTop: 8,
          elevation: 0,
        },
        tabBarLabelStyle: {
          ...Typography.body3,
          marginTop: -4,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Orders" 
        component={AppStack} 
        options={{ title: 'Orders' }} 
      />
      <Tab.Screen 
        name="Money" 
        component={EarningsStack} 
        options={{ title: 'Money' }} 
      />
       <Tab.Screen 
         name="Messages" 
         component={MessageStack} 
         options={{ title: 'Messages' }} 
       />
      <Tab.Screen 
        name="Profile" 
        component={ProfileStack} 
        options={{ title: 'Profile' }} 
      />
    </Tab.Navigator>
  );
};

export default TabStack;
