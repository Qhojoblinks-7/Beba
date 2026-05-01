import { create } from 'zustand';

const useAppStore = create((set) => ({
  // Rider status: OFFLINE, ONLINE, ON_TRIP
  riderStatus: 'OFFLINE',
  setRiderStatus: (status) => set({ riderStatus: status }),

  // UI Preferences: theme and language
  uiPreferences: {
    theme: 'light', // or 'dark'
    language: 'en', // en, tw, ga
  },
  setTheme: (theme) => set((state) => ({
    uiPreferences: { ...state.uiPreferences, theme }
  })),
  setLanguage: (language) => set((state) => ({
    uiPreferences: { ...state.uiPreferences, language }
  })),
}));

export default useAppStore;