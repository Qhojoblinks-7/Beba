import { QueryClient } from '@tanstack/react-query';

/**
 * QueryClient instance for React Query
 * 
 * IMPORTANT: This client must be created at module load time
 * to ensure it's available before any components attempt to use hooks.
 * 
 * In React Query v5, the QueryClient check happens at hook invocation,
 * so we need to ensure it's initialized before the app renders any
 * components that might use React Query hooks.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
      // Prevent the error by using a simpler error handler
      queryCache: {
        onError: (error) => {
          console.warn('Query error:', error);
        },
      },
    },
    mutations: {
      retry: 1,
      // Handle mutation errors gracefully
      onError: (error) => {
        console.warn('Mutation error:', error);
      },
    },
  },
});

// Helper to get the query client (for cases where direct access is needed)
export const getQueryClient = () => queryClient;
