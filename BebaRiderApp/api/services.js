// API Service functions
// These are thin wrappers around the API client for cleaner component code

import { riderAPI, orderAPI, demandAPI, authAPI } from './client';

// Auth Services
export const AuthService = {
  login: async (phoneNumber, password) => {
    const response = await authAPI.login(phoneNumber, password);
    return response.data;
  },
  register: async (userData) => {
    const response = await authAPI.register(userData);
    return response.data;
  },
};

// Rider Services
export const RiderService = {
  getProfile: async () => {
    const response = await riderAPI.getProfile();
    return response.data;
  },
  
  getEarnings: async () => {
    const response = await riderAPI.getEarnings();
    return response.data;
  },
  
  getActiveOrder: async () => {
    const response = await riderAPI.getActiveOrder();
    return response.data;
  },
  
  getNearbyOrders: async (lat, lng) => {
    const response = await riderAPI.getNearbyOrders(lat, lng);
    return response.data;
  },
  
  updateLocation: async (latitude, longitude) => {
    const response = await riderAPI.updateLocation(latitude, longitude);
    return response.data;
  },
};

// Order Services
export const OrderService = {
  acceptOrder: async (orderId) => {
    const response = await orderAPI.acceptOrder(orderId);
    return response.data;
  },
  
  startPickup: async (orderId, latitude, longitude) => {
    const response = await orderAPI.startPickup(orderId, latitude, longitude);
    return response.data;
  },
  
  completeOrder: async (orderId) => {
    const response = await orderAPI.completeOrder(orderId);
    return response.data;
  },
  
  requestReturn: async (orderId) => {
    const response = await orderAPI.requestReturn(orderId);
    return response.data;
  },
  
  getTripDetails: async (orderId) => {
    const response = await orderAPI.getTripDetails(orderId);
    return response.data;
  },
};

// Demand Services
export const DemandService = {
  getDemandCenters: async () => {
    const response = await demandAPI.getDemandCenters();
    return response.data;
  },
};

export default {
  AuthService,
  RiderService,
  OrderService,
  DemandService,
};
