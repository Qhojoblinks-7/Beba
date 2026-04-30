import React, { useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './query/client';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Internal Navigation & Theme
import TabStack from './navigation/TabStark';
import { Palette } from './constants/theme';
import { OrderProvider } from './context/OrderContext';
// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
  /**
   * Load Custom Fonts
   * Since your Typography uses Medium (500) and Semibold (600), 
   * ensure you have these font files in your assets folder.
   */
  const [fontsLoaded] = useFonts({
    'Inter-Regular': require('./assets/fonts/Inter-Regular.ttf'),
    'Inter-Medium': require('./assets/fonts/Inter-SemiBold.ttf'),
    'Inter-SemiBold': require('./assets/fonts/Inter-Bold.ttf'),
  });

  // Callback to hide splash screen once everything is ready
  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null; // Keep splash screen visible
  }

  return (
    <SafeAreaProvider>
      <View style={styles.container} onLayout={onLayoutRootView}>
        {/* Set StatusBar to dark for Light Mode visibility */}
        <StatusBar style="dark" />
        
         <QueryClientProvider client={queryClient}>
           <OrderProvider>
             <NavigationContainer>
               {/* TabStack contains AppStack, Earnings, and Settings */}
               <TabStack />
             </NavigationContainer>
           </OrderProvider>
           <ReactQueryDevtools initialIsOpen={false} />
         </QueryClientProvider>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.white,
  },
});