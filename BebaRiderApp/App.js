import React, { useEffect, useState, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

// Internal Navigation & Theme
import TabStack from './navigation/TabStark';
import AuthStack from './navigation/AuthStack';
import useAuthStore from './store/useAuthStore';
import { Palette } from './constants/theme';

/**
 * Create a stable QueryClient instance for React Query
 * Using useRef ensures the client is created once and reused across renders,
 * preventing the "No QueryClient set" error that can occur with module-level
 * initialization timing issues in React Query v5.
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

export default function App() {
  const { isAuthenticated, initialize } = useAuthStore();
  const [authInitialized, setAuthInitialized] = useState(false);

  // Initialize auth state on mount
  useEffect(() => {
    const init = async () => {
      try {
        await initialize();
      } catch (e) {
        console.log('Auth init error:', e);
      } finally {
        setAuthInitialized(true);
      }
    };
    init();
    
    // Failsafe: If auth takes too long, still show the app
    const timeout = setTimeout(() => {
      setAuthInitialized(true);
    }, 1000);
    
    return () => clearTimeout(timeout);
  }, []);

  // QueryClientProvider wraps the entire app including loading state
  // to prevent "No QueryClient set" error when components use React Query hooks
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <View style={styles.container}>
          <StatusBar style="dark" />
          
          {/* Show loading while checking auth or loading fonts */}
          {!authInitialized ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Palette.primary} />
            </View>
          ) : (
            <NavigationContainer>
              {isAuthenticated ? <TabStack /> : <AuthStack />}
            </NavigationContainer>
          )}
        </View>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Palette.white,
  },
});
