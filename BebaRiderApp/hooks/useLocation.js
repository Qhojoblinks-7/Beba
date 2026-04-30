import { useState, useEffect, useCallback, useRef } from 'react';
import * as Location from 'expo-location';
import { RiderService } from '../api/services';

/**
 * useLocation Hook
 * Handles real-time GPS tracking for the rider
 * - Requests location permissions
 * - Tracks rider position
 * - Sends location updates to backend
 */
export const useLocation = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState(null);
  
  const watchSubscription = useRef(null);
  const locationUpdateInterval = useRef(null);
  
  // Request location permissions
  const requestPermissions = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setPermissionStatus(status);
      return status === 'granted';
    } catch (err) {
      console.error('Error requesting permissions:', err);
      setError(err.message);
      return false;
    }
  }, []);
  
  // Get current location once
  const getCurrentLocation = useCallback(async () => {
    try {
      const hasPermission = permissionStatus === 'granted' || await requestPermissions();
      if (!hasPermission) {
        setError('Location permission denied');
        return null;
      }
      
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      
      const locationData = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        accuracy: loc.coords.accuracy,
        timestamp: loc.timestamp,
      };
      
      setLocation(locationData);
      return locationData;
    } catch (err) {
      console.error('Error getting location:', err);
      setError(err.message);
      return null;
    }
  }, [permissionStatus, requestPermissions]);
  
  // Start continuous location tracking
  const startLocationTracking = useCallback(async () => {
    try {
      const hasPermission = permissionStatus === 'granted' || await requestPermissions();
      if (!hasPermission) {
        setError('Location permission denied');
        return false;
      }
      
      // Start watching location
      watchSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000, // Update every 5 seconds
          distanceInterval: 10, // Or when moved 10 meters
        },
        (loc) => {
          const locationData = {
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            accuracy: loc.coords.accuracy,
            timestamp: loc.timestamp,
          };
          setLocation(locationData);
        }
      );
      
      setIsTracking(true);
      
      // Also send periodic updates to backend
      locationUpdateInterval.current = setInterval(async () => {
        if (location) {
          try {
            await RiderService.updateLocation(location.latitude, location.longitude);
          } catch (err) {
            console.error('Error updating location to backend:', err);
          }
        }
      }, 30000); // Send every 30 seconds
      
      // Get initial location
      await getCurrentLocation();
      
      return true;
    } catch (err) {
      console.error('Error starting location tracking:', err);
      setError(err.message);
      return false;
    }
  }, [permissionStatus, requestPermissions, getCurrentLocation, location]);
  
  // Stop location tracking
  const stopLocationTracking = useCallback(() => {
    if (watchSubscription.current) {
      watchSubscription.current.remove();
      watchSubscription.current = null;
    }
    
    if (locationUpdateInterval.current) {
      clearInterval(locationUpdateInterval.current);
      locationUpdateInterval.current = null;
    }
    
    setIsTracking(false);
  }, []);
  
  // Calculate distance to a point
  const calculateDistance = useCallback((lat1, lon1, lat2, lon2) => {
    // Haversine formula
    const R = 6371e3; // Earth's radius in meters
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;
    
    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    return R * c; // Distance in meters
  }, []);
  
  // Check if within radius of a point
  const isWithinRadius = useCallback((point, radiusMeters = 50) => {
    if (!location || !point) return false;
    const distance = calculateDistance(
      location.latitude,
      location.longitude,
      point.latitude,
      point.longitude
    );
    return distance <= radiusMeters;
  }, [location, calculateDistance]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopLocationTracking();
    };
  }, []);
  
  const value = {
    location,
    error,
    isTracking,
    permissionStatus,
    requestPermissions,
    getCurrentLocation,
    startLocationTracking,
    stopLocationTracking,
    calculateDistance,
    isWithinRadius,
  };
  
  return value;
};

export default useLocation;
