import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RiderService, OrderService, DemandService, AuthService } from '../api/services';

// ============ RIDER QUERIES ============

/**
 * Fetch current rider profile
 */
export const useProfile = () => {
  return useQuery({
    queryKey: ['rider', 'profile'],
    queryFn: RiderService.getProfile,
  });
};

/**
 * Fetch earnings summary
 */
export const useEarnings = () => {
  return useQuery({
    queryKey: ['rider', 'earnings'],
    queryFn: async () => {
      const data = await RiderService.getEarnings();
      // Map backend fields to consistent frontend names
      return {
        today: parseFloat(data.daily_total) || 0,
        thisWeek: parseFloat(data.this_week) || 0,
        balance: parseFloat(data.balance) || 0,
        completedTrips: data.completed_trips || 0,
        waitFees: parseFloat(data.wait_fees_earned) || 0,
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Fetch active order if any
 */
export const useActiveOrder = () => {
  return useQuery({
    queryKey: ['order', 'active'],
    queryFn: RiderService.getActiveOrder,
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 10, // refetch every 10 seconds when on trip
  });
};

/**
 * Fetch nearby available orders based on location
 */
export const useNearbyOrders = (latitude, longitude, enabled = true) => {
  return useQuery({
    queryKey: ['orders', 'nearby', latitude, longitude],
    queryFn: () => RiderService.getNearbyOrders(latitude, longitude),
    enabled: enabled && !!latitude && !!longitude,
    staleTime: 1000 * 10, // 10 seconds - fetch more frequently
    refetchInterval: 1000 * 10, // refetch every 10 seconds when online
    refetchOnMount: true, // Always refetch on component mount
    refetchOnWindowFocus: true, // Refetch when window regains focus
  });
};

/**
 * Fetch trip history for a specific date (YYYY-MM-DD)
 */
export const useTripHistory = (date) => {
  return useQuery({
    queryKey: ['rider', 'trip-history', date],
    queryFn: () => RiderService.getTripHistory(date),
    enabled: !!date,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Fetch demand centers for heatmap
 */
export const useDemandCenters = () => {
  return useQuery({
    queryKey: ['demand', 'centers'],
    queryFn: DemandService.getDemandCenters,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// ============ ORDER MUTATIONS ============

/**
 * Accept an order mutation
 */
export const useAcceptOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: OrderService.acceptOrder,
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['orders', 'nearby'] });
      queryClient.invalidateQueries({ queryKey: ['order', 'active'] });
      queryClient.invalidateQueries({ queryKey: ['rider', 'earnings'] });
    },
  });
};

/**
 * Start pickup mutation
 */
export const useStartPickup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, latitude, longitude }) =>
      OrderService.startPickup(orderId, latitude, longitude),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', 'active'] });
    },
  });
};

/**
 * Complete delivery mutation
 */
export const useCompleteOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: OrderService.completeOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', 'active'] });
      queryClient.invalidateQueries({ queryKey: ['rider', 'earnings'] });
      queryClient.invalidateQueries({ queryKey: ['rider', 'profile'] });
    },
  });
};

/**
  * Request return item mutation
  */
 export const useRequestReturn = () => {
   return useMutation({
     mutationFn: OrderService.requestReturn,
   });
 };

 /**
  * Mark arrived at pickup mutation
  */
 export const useArriveAtPickup = () => {
   const queryClient = useQueryClient();

   return useMutation({
     mutationFn: ({ orderId, latitude, longitude }) =>
       OrderService.arriveAtPickup(orderId, latitude, longitude),
     onSuccess: () => {
       // Optionally invalidate queries if needed
       queryClient.invalidateQueries({ queryKey: ['order', 'active'] });
     },
   });
 };

 // ============ AUTH MUTATIONS ============

/**
 * Login mutation
 */
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ phoneNumber, password }) =>
      AuthService.login(phoneNumber, password),
    onSuccess: () => {
      // Optionally prefetch user data after login
      queryClient.prefetchQuery({ queryKey: ['rider', 'profile'] });
      queryClient.prefetchQuery({ queryKey: ['rider', 'earnings'] });
    },
  });
};

/**
 * Register mutation
 */
export const useRegister = () => {
  return useMutation({
    mutationFn: AuthService.register,
  });
};

// ============ LOCATION MUTATION ============

/**
 * Update rider location mutation
 */
export const useUpdateLocation = () => {
  return useMutation({
    mutationFn: ({ latitude, longitude }) =>
      RiderService.updateLocation(latitude, longitude),
    // Optionally discard failed location updates to avoid blocking
    onError: (error) => {
      console.warn('Failed to update location:', error.message);
    },
  });
};
