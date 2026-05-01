import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useAuthStore = create((set, get) => ({
  // Auth state
  isAuthenticated: false,
  user: null,
  token: null,
  isLoading: false,
  error: null,

  // Initialize auth state from stored tokens
  initialize: async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const userStr = await AsyncStorage.getItem('authUser');
      const user = userStr ? JSON.parse(userStr) : null;
      
      if (token && user) {
        set({ isAuthenticated: true, token, user });
      } else if (token) {
        set({ isAuthenticated: true, token });
      }
    } catch (err) {
      console.error('Auth initialization error:', err);
    }
  },

  // Set loading state
  setLoading: (loading) => set({ isLoading: loading }),

  // Set error
  setError: (error) => set({ error }),

  // Clear error
  clearError: () => set({ error: null }),

  // Login success - store user and tokens
  loginSuccess: async (user, token, refreshToken = null) => {
    try {
      // Store tokens for axios interceptor
      await AsyncStorage.setItem('accessToken', token);
      if (refreshToken) {
        await AsyncStorage.setItem('refreshToken', refreshToken);
      }
      // Store user data
      await AsyncStorage.setItem('authUser', JSON.stringify(user));
      
      set({
        isAuthenticated: true,
        user,
        token,
        error: null,
        isLoading: false,
      });
    } catch (err) {
      console.error('Error storing auth data:', err);
      set({ error: 'Failed to store authentication data' });
    }
  },

  // Logout - clear auth state
  logout: async () => {
    await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'authUser']);
    set({
      isAuthenticated: false,
      user: null,
      token: null,
      error: null,
      isLoading: false,
    });
  },

  // Update user profile
  updateUser: (userData) => set((state) => ({
    user: { ...state.user, ...userData },
  })),
}));

export default useAuthStore;


