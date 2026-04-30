import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import MessagesScreen from '../screens/MessagesScreen';
import ChatThreadScreen from '../screens/ChatThreadScreen';
import PODCameraScreen from '../screens/PODCameraScreen';

const Stack = createStackNavigator();

const MessageStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MessagesList" component={MessagesScreen} />
      <Stack.Screen name="ChatThread" component={ChatThreadScreen} />
      <Stack.Screen name="PODCamera" component={PODCameraScreen} />
    </Stack.Navigator>
  );
};

export default MessageStack;