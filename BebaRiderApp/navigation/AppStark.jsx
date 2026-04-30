import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { Palette, Typography } from '../constants/theme';

// Import Screens
import Home from '../screens/Home';
import ActiveTrip from '../screens/ActiveTrip';
import History from '../screens/History';
import DeliveryTrackingScreen from '../screens/DeliveryTrackingScreen';
import QRScanner from '../screens/QRScanner';

const Stack = createStackNavigator();

/**
 * AppStack: The core delivery workflow
 * Transitions the rider through the lifecycle of a Beba delivery.
 */
const AppStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false, // Set this to false globally for a custom UI look
        headerStyle: {
          backgroundColor: Palette.white,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTitleStyle: {
          ...Typography.h3,
          color: Palette.black,
        },
        headerTintColor: Palette.primary,
        headerBackTitleVisible: false,
        cardStyle: { backgroundColor: Palette.white },
      }}
    >
      {/* 1. The Hub: Map + Order Discovery */}
      <Stack.Screen 
        name="Home" 
        component={Home} 
      />

      {/* 2. The Mission: Navigation & Wait-Fee Timer */}
      <Stack.Screen 
        name="ActiveTrip" 
        component={ActiveTrip} 
        options={{ 
          headerShown: true,
          title: 'Active Delivery',
          headerLeft: () => null,
        }} 
      />

      {/* 2b. QR Scanner for Delivery Verification */}
      <Stack.Screen 
        name="QRScanner" 
        component={QRScanner} 
        options={{ 
          headerShown: false,
        }} 
      />

      {/* 3. Delivery Tracking Screen - Header Hidden for custom UI */}
      <Stack.Screen 
        name="DeliveryTracking" 
        component={DeliveryTrackingScreen} // Added the missing component
        options={{ headerShown: false }}    // Explicitly hide it here
      />

      {/* 4. The Archive: Past Deliveries */}
      <Stack.Screen 
        name="History" 
        component={History} 
        options={{ 
          headerShown: true, 
          title: 'Trip History' 
        }} 
      />
    </Stack.Navigator>
  );
};

export default AppStack;