import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { Palette } from '../constants/theme';
import AuthScreen from '../screens/AuthScreen';

const Stack = createStackNavigator();

/**
 * AuthStack: Authentication flow
 * Handles sign in and sign up screens
 */
const AuthStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: Palette.white },
      }}
    >
      <Stack.Screen 
        name="Auth" 
        component={AuthScreen} 
        initialParams={{ type: 'SIGN_IN' }}
      />
    </Stack.Navigator>
  );
};

export default AuthStack;

