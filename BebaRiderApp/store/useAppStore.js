import { create } from 'zustand';

const useAppStore = create((set) => ({
  // Rider Status: OFFLINE, ONLINE, ON_TRIP
  riderStatus: 'OFFLINE',
  setRiderStatus: (status) => set({ riderStatus: status }),

  // Active Trip Context: temporary UI data during an active delivery
  activeTrip: {
    // Example: waitTimeElapsed: 0, // in seconds
    // We can add more fields as needed
  },
  setActiveTrip: (partialTrip) => set((state) => ({
    activeTrip: { ...state.activeTrip, ...partialTrip }
  })),
  resetActiveTrip: () => set({ activeTrip: {} }),

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