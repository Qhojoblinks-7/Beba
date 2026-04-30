import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ProfileScreen from '../screens/ProfileScreen';
import PersonalInfo from '../screens/PersonalInfo';
import VehicleDetails from '../screens/VehicleDetails';
import SecurityScreen from '../screens/SecurityScreen';
import Support from '../screens/Support';
import Settings from '../screens/Settings';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import LanguageScreen from '../screens/LanguageScreen';
import AddressScreen from '../screens/AddressScreen';
import NotificationScreen from '../screens/NotificationScreen';
import PaymentMethodScreen from '../screens/PaymentMethodScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';

const Stack = createStackNavigator();

const ProfileStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="PersonalInfo" component={PersonalInfo} />
      <Stack.Screen name="VehicleDetails" component={VehicleDetails} />
      <Stack.Screen name="Security" component={SecurityScreen} />
      <Stack.Screen name="Support" component={Support} />
      <Stack.Screen name="Settings" component={Settings} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen name="Language" component={LanguageScreen} />
      <Stack.Screen name="Address" component={AddressScreen} />
      <Stack.Screen name="Notification" component={NotificationScreen} />
      <Stack.Screen name="PaymentMethod" component={PaymentMethodScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
    </Stack.Navigator>
  );
};

export default ProfileStack;