import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { RiderService, OrderService, DemandService } from '../api/services';
import { useLocation } from '../hooks/useLocation';

const OrderContext = createContext();

// Order status flow from README:
// PENDING → PICKED_UP → IN_TRANSIT → DELIVERED
export const ORDER_STATUS = {
  PENDING: 'PENDING',
  PICKED_UP: 'PICKED_UP',
  IN_TRANSIT: 'IN_TRANSIT',
  DELIVERED: 'DELIVERED',
};

// Rider status flow from README:
// OFFLINE → ONLINE → ON_TRIP → OFFLINE
export const RIDER_STATUS = {
  OFFLINE: 'OFFLINE',
  ONLINE: 'ONLINE',
  ON_TRIP: 'ON_TRIP',
};

// Priority weights from README
const PRIORITY_WEIGHTS = {
  FOOD: 30,
  DOCUMENT: 20,
  PARCEL: 10,
};

// Wait time limits from README (in minutes)
const WAIT_TIME_LIMITS = {
  FOOD: 5,
  PARCEL: 10,
  DOCUMENT: 10,
};

// Base fare - can be configured
const BASE_FARE = 5.0;
// Distance rate per km - from README: (distance × 2) + base fare
const DISTANCE_RATE = 2.0;

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};

export const OrderProvider = ({ children }) => {
  // Rider status
  const [riderStatus, setRiderStatus] = useState(RIDER_STATUS.OFFLINE);
  const [onlineStatus, setOnlineStatus] = useState(false);
  
  // Order data
  const [availableOrders, setAvailableOrders] = useState([]);
  const [activeOrder, setActiveOrder] = useState(null);
  const [orderStatus, setOrderStatus] = useState(null);
  
  // Location
  const { location, startLocationTracking, stopLocationTracking, error: locationError } = useLocation();
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  
  // Earnings data
  const [earnings, setEarnings] = useState({
    today: 0,
    thisWeek: 0,
    balance: 0,
    completedTrips: 0,
    waitFees: 0,
  });

  // Demand centers
  const [demandCenters, setDemandCenters] = useState([]);

  // Fetch nearby orders when rider goes online
  const fetchNearbyOrders = useCallback(async () => {
    if (!location) return;
    
    setIsLoadingOrders(true);
    try {
      const orders = await RiderService.getNearbyOrders(
        location.latitude, 
        location.longitude
      );
      // Sort by priority weight (highest first)
      const sortedOrders = [...orders].sort((a, b) => 
        (b.priority_weight || 0) - (a.priority_weight || 0)
      );
      setAvailableOrders(sortedOrders);
    } catch (error) {
      console.error('Error fetching nearby orders:', error);
      // Fallback to mock data on error
      setAvailableOrders(getMockOrders());
    } finally {
      setIsLoadingOrders(false);
    }
  }, [location]);

  // Fetch demand centers
  const fetchDemandCenters = useCallback(async () => {
    try {
      const data = await DemandService.getDemandCenters();
      setDemandCenters(data);
    } catch (error) {
      console.error('Error fetching demand centers:', error);
    }
  }, []);

  // Fetch earnings
  const fetchEarnings = useCallback(async () => {
    try {
      const data = await RiderService.getEarnings();
      setEarnings({
        today: parseFloat(data.daily_total) || 0,
        thisWeek: parseFloat(data.this_week) || 0,
        balance: parseFloat(data.balance) || 0,
        completedTrips: data.completed_trips || 0,
        waitFees: parseFloat(data.wait_fees_earned) || 0,
      });
    } catch (error) {
      console.error('Error fetching earnings:', error);
    }
  }, []);

  // Toggle rider online status
  const toggleOnlineStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      if (riderStatus === RIDER_STATUS.OFFLINE) {
        // Go online
        setRiderStatus(RIDER_STATUS.ONLINE);
        setOnlineStatus(true);
        startLocationTracking();
        await fetchNearbyOrders();
        await fetchDemandCenters();
        await fetchEarnings();
      } else {
        // Go offline
        setRiderStatus(RIDER_STATUS.OFFLINE);
        setOnlineStatus(false);
        stopLocationTracking();
        setAvailableOrders([]);
      }
    } catch (error) {
      console.error('Error toggling status:', error);
    } finally {
      setIsLoading(false);
    }
  }, [riderStatus, fetchNearbyOrders, fetchDemandCenters, fetchEarnings, startLocationTracking, stopLocationTracking]);

  // Accept order - changes status from PENDING to PICKED_UP
  const acceptOrder = useCallback(async (orderId) => {
    setIsLoading(true);
    try {
      const orderData = await OrderService.acceptOrder(orderId);
      setActiveOrder(orderData);
      setOrderStatus(ORDER_STATUS.PICKED_UP);
      setRiderStatus(RIDER_STATUS.ON_TRIP);
      
      // Remove from available orders
      setAvailableOrders(prev => prev.filter(o => o.id !== orderId));
      
      return orderData;
    } catch (error) {
      console.error('Error accepting order:', error);
      Alert.alert('Error', 'Failed to accept order. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Start pickup - changes status from PICKED_UP to IN_TRANSIT
  const startPickup = useCallback(async (orderId) => {
    if (!location) {
      Alert.alert('Error', 'Location not available. Please enable GPS.');
      return;
    }
    
    setIsLoading(true);
    try {
      await OrderService.startPickup(orderId, location.latitude, location.longitude);
      setOrderStatus(ORDER_STATUS.IN_TRANSIT);
      setActiveOrder(prev => ({ ...prev, status: ORDER_STATUS.IN_TRANSIT }));
    } catch (error) {
      console.error('Error starting pickup:', error);
      Alert.alert('Error', 'Failed to start pickup. Make sure you are near the pickup location.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [location]);

  // Complete delivery with QR verification
  const completeDelivery = useCallback(async (orderId) => {
    setIsLoading(true);
    try {
      await OrderService.completeOrder(orderId);
      
      // Reset states
      setActiveOrder(null);
      setOrderStatus(null);
      setRiderStatus(RIDER_STATUS.ONLINE);
      
      // Refresh earnings
      await fetchEarnings();
      
      return true;
    } catch (error) {
      console.error('Error completing delivery:', error);
      Alert.alert('Error', 'Failed to complete delivery. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [fetchEarnings]);

  // Request return item - recalculate price (distance × 2) + base fare
  const requestReturnItem = useCallback(async (orderId) => {
    try {
      const result = await OrderService.requestReturn(orderId);
      Alert.alert(
        'Item Returned',
        'The trip price has been recalculated and the customer has been notified.',
        [{ text: 'OK' }]
      );
      return result;
    } catch (error) {
      console.error('Error requesting return:', error);
      throw error;
    }
  }, []);

  // Get wait time limit for current order's category
  const getWaitTimeLimit = useCallback(() => {
    if (!activeOrder) return 10;
    const category = activeOrder.category?.toUpperCase();
    return WAIT_TIME_LIMITS[category] || 10;
  }, [activeOrder]);

  // Update active order with local state (for optimistic updates)
  const updateActiveOrder = useCallback((updates) => {
    setActiveOrder(prev => prev ? { ...prev, ...updates } : null);
  }, []);

  // Mock data for offline fallback
  const getMockOrders = useCallback(() => {
    return [
      {
        id: 'ORD-001',
        category: 'FOOD',
        priorityWeight: PRIORITY_WEIGHTS.FOOD,
        pickup_address: 'Kaale Street, 1',
        dropoff_address: 'Asafoatse Omani Street',
        customer: { first_name: 'Ester', phone_number: '+233240000000' },
        item_count: 3,
        notes: 'Wait at main entrance',
        created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      },
      {
        id: 'ORD-002',
        category: 'DOCUMENT',
        priorityWeight: PRIORITY_WEIGHTS.DOCUMENT,
        pickup_address: 'Ridge Hospital, North Ridge',
        dropoff_address: 'Kaale Street, 1',
        customer: { first_name: 'Kojo', phone_number: '+233240000001' },
        item_count: 5,
        notes: 'Gate B - Red Door',
        created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      },
      {
        id: 'ORD-003',
        category: 'PARCEL',
        priorityWeight: PRIORITY_WEIGHTS.PARCEL,
        pickup_address: 'Makola Market',
        dropoff_address: 'Osu Oxford Street',
        customer: { first_name: 'Ama', phone_number: '+233240000002' },
        item_count: 1,
        notes: 'Fragile - Handle with care',
        created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      },
    ];
  }, []);

  // Check for active order on mount
  useEffect(() => {
    const checkActiveOrder = async () => {
      try {
        const order = await RiderService.getActiveOrder();
        if (order) {
          setActiveOrder(order);
          setOrderStatus(order.status);
          setRiderStatus(RIDER_STATUS.ON_TRIP);
        }
      } catch (error) {
        console.error('Error checking active order:', error);
      }
    };
    
    checkActiveOrder();
  }, []);

  const value = {
    // Rider status
    riderStatus,
    onlineStatus,
    toggleOnlineStatus,
    
    // Order data
    availableOrders,
    activeOrder,
    orderStatus,
    isLoadingOrders,
    
    // Actions
    acceptOrder,
    startPickup,
    completeDelivery,
    requestReturnItem,
    updateActiveOrder,
    fetchNearbyOrders,
    
    // Utilities
    getWaitTimeLimit,
    PRIORITY_WEIGHTS,
    WAIT_TIME_LIMITS,
    
    // Location
    location,
    locationError,
    
    // Earnings
    earnings,
    fetchEarnings,
    
    // Demand
    demandCenters,
    fetchDemandCenters,
    
    // Loading
    isLoading,
    
    // Constants
    BASE_FARE,
    DISTANCE_RATE,
  };

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
};

export default OrderContext;
