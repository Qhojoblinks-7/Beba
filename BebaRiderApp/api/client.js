import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Base URL for Django API (physical device uses host machine's local network IP)
const BASE_URL = 'http://10.79.253.107:8000';

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        const response = await axios.post(`${BASE_URL}/auth/refresh/`, {
          refresh: refreshToken,
        });
        await AsyncStorage.setItem('accessToken', response.data.access);
        originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
        return api(originalRequest);
      } catch (refreshError) {
        await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  login: (phoneNumber, password) =>
    api.post('/auth/login/', { phone_number: phoneNumber, password }),
  register: (data) => api.post('/auth/register/', data),
  refreshToken: (refresh) => api.post('/auth/refresh/', { refresh }),
};

// Rider endpoints
export const riderAPI = {
  // Get current rider profile
  getProfile: () => api.get('/api/riders/me/'),
  
  // Get earnings summary
  getEarnings: () => api.get('/api/rider/analytics/'),
  
  // Get current active order (if any)
  getActiveOrder: () => api.get('/api/riders/active-order/'),
  
  // Get nearby available orders
  getNearbyOrders: (lat, lng) => 
    api.get('/api/riders/nearby-orders/', { params: { lat, lng } }),
  
  // Get location updates
  updateLocation: (latitude, longitude) =>
    api.post('/api/location/update/', { latitude, longitude }),
};

// Order endpoints
export const orderAPI = {
  // Accept an order (change status to PICKED_UP)
  acceptOrder: (orderId) => api.post(`/api/orders/${orderId}/accept/`),

  // Start pickup (change status to IN_TRANSIT)
  startPickup: (orderId, latitude, longitude) =>
    api.post(`/api/orders/${orderId}/start-pickup/`, { latitude, longitude }),

  // Mark arrived at pickup (change status to ARRIVED_AT_PICKUP)
  arriveAtPickup: (orderId, latitude, longitude) =>
    api.post(`/api/orders/${orderId}/arrive-at-pickup/`, { latitude, longitude }),

  // Complete delivery (change status to DELIVERED)
  completeOrder: (orderId) => api.post(`/api/orders/${orderId}/complete/`),

  // Request return item (recalculation)
  requestReturn: (orderId) => api.post(`/api/orders/${orderId}/return-item/`),

  // Get trip metrics/details
  getTripDetails: (orderId) => api.get(`/api/orders/${orderId}/trip-metrics/`),
};

// Heatmap/Demand endpoints
export const demandAPI = {
  getDemandCenters: () => api.get('/heatmap/demand-centers/'),
};

export default api;
