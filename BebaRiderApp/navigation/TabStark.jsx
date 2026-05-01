import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Home, BarChart2, MessageCircle, User } from 'lucide-react-native';
import { Palette, Typography } from '../constants/theme';

// Import Screens
import AppStack from './AppStark';
import EarningsStack from './EarningsStack';
import MessageStack from './MessageStack';
import ProfileStack from './ProfileStack';
import ActiveTrip from '../screens/ActiveTrip';
import QRScanner from '../screens/QRScanner';
import { useActiveOrder } from '../query/hooks';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

/**
 * ActiveTripStack: Screen stack shown exclusively during an active delivery.
 * Contains ActiveTrip and QRScanner (for verification).
 */
const ActiveTripStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ActiveTrip" component={ActiveTrip} />
      <Stack.Screen name="QRScanner" component={QRScanner} />
    </Stack.Navigator>
  );
};

/**
 * OrdersTabContent: Conditional wrapper for the Orders tab.
 * If rider has an active order, shows ActiveTripStack instead of the regular AppStack.
 * This makes ActiveTrip the effective home screen during a trip.
 */
const OrdersTabContent = () => {
  const { data: activeOrder } = useActiveOrder();
  // Show ActiveTripStack while a trip is in progress; otherwise normal app flow
  return activeOrder ? <ActiveTripStack /> : <AppStack />;
};

/**
 * TabStack: The Main Application Shell
 * Provides quick access to Orders, Earnings, Messages, and Profile.
 *
 * The Orders tab dynamically switches between the regular app flow (AppStack)
 * and the ActiveTripStack when a delivery is in progress.
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
        component={OrdersTabContent}
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
