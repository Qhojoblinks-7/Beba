import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { Palette, Typography } from '../constants/theme';

// Import Screens
import Earnings from '../screens/Earnings';
import DailyEarningsDetail from '../components/organisms/DailyEarningsDetail';
import TripDetails from '../components/organisms/TripDetails';

const Stack = createStackNavigator();

/**
 * Wrapper component that injects onBack prop into DailyEarningsDetail
 */
const DailyEarningsDetailWithNavigation = (props) => {
  const navigation = useNavigation();
  
  return (
    <DailyEarningsDetail 
      {...props}
      onBack={() => navigation.goBack()}
      navigation={navigation}
    />
  );
};

/**
 * EarningsStack: Navigation stack for the Money tab
 * Allows drilling down from the earnings overview to daily details
 */
const EarningsStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
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
      <Stack.Screen 
        name="EarningsOverview" 
        component={Earnings} 
        options={{ 
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="DailyEarningsDetail" 
        component={DailyEarningsDetailWithNavigation} 
        options={({ route }) => ({
          title: route.params?.date || 'Details',
          headerShown: false,
        })} 
      />
      <Stack.Screen 
        name="TripDetails" 
        component={TripDetails} 
        options={{ headerShown: false }} 
      />
    </Stack.Navigator>
  );
};

export default EarningsStack;