import React, { useEffect, useState, useCallback } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronRight } from "lucide-react-native";
import * as Network from 'expo-network';
import { useLocation } from "../hooks/useLocation";
import { useActiveOrder, useEarnings, useNearbyOrders, useAcceptOrder } from "../query/hooks";
import useAppStore from "../store/useAppStore";
import { RIDER_STATUS } from "../constants/orderConstants";
import BebaText from "../components/atoms/BebaText";
import BebaMapView from "../components/organisms/MapView";
import StatusSheet from "../components/molecules/StatusSheet";
import { Palette, Spacing } from "../constants/theme";

const Home = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { location, startLocationTracking, stopLocationTracking, permissionStatus, error: locationError } =
    useLocation();

  // Rider status from Zustand store
  const riderStatus = useAppStore((state) => state.riderStatus);
  const setRiderStatus = useAppStore((state) => state.setRiderStatus);

  // Network status state
  const [isConnected, setIsConnected] = useState(true);
  const [networkType, setNetworkType] = useState(null);

  // Check network status on mount and listen for changes
  useEffect(() => {
    const checkNetwork = async () => {
      try {
        const networkState = await Network.getNetworkStateAsync();
        setIsConnected(networkState.isConnected);
        setNetworkType(networkState.type);
      } catch (err) {
        console.error('Error checking network:', err);
        setIsConnected(false);
      }
    };

    checkNetwork();

    // Listen for network changes
    const networkListener = Network.addNetworkStateListener((state) => {
      setIsConnected(state.isConnected);
      setNetworkType(state.type);
    });

    return () => networkListener.remove();
  }, []);

  // Derived boolean: is rider in ONLINE state (searching for orders)
  const isOnline = riderStatus === RIDER_STATUS.ONLINE;

   // Compute banner status based on connection, permissions, GPS health
   const getBannerStatus = () => {
     // 1. Network issues (highest priority)
     if (!isConnected) {
       return {
         text: 'No internet connection',
         color: Palette.danger,
       };
     }

     // 2. Location permission denied
     if (permissionStatus === 'denied') {
       return {
         text: 'Location permission denied',
         color: Palette.danger,
       };
     }

     if (permissionStatus === 'undetermined') {
       return {
         text: 'Location permission required',
         color: Palette.accent,
       };
     }

     // 3. GPS/location service disabled or error
     if (locationError) {
       if (locationError.includes('location services') || locationError.includes('disabled')) {
         return {
           text: 'Please enable GPS/location services',
           color: Palette.danger,
         };
       }
       return {
         text: 'GPS error: ' + locationError,
         color: Palette.danger,
       };
     }

     // 4. Still acquiring GPS fix
     if (!location) {
       return {
         text: 'Acquiring GPS signal...',
         color: Palette.accent,
       };
     }

  // 5. All systems good — show network & GPS accuracy
  const networkLabel = networkType
    ? networkType.charAt(0).toUpperCase() + networkType.slice(1)
    : 'Unknown';
  const accuracy = location?.accuracy ? Math.round(location.accuracy) : '?';

  return {
    text: `Network: ${networkLabel} | GPS: ±${accuracy}m`,
    color: Palette.secondary,
  };
   };

   const bannerStatus = getBannerStatus();

    // TanStack Query hooks for data fetching
    const { data: activeOrder } = useActiveOrder();
    const { data: earnings } = useEarnings();
    const { data: nearbyOrders = [], refetch: refetchNearbyOrders } = useNearbyOrders(
      location?.latitude,
      location?.longitude,
      isOnline && !!location,
    );

    // Refetch nearby orders when coming online or location changes
    useEffect(() => {
      if (isOnline && location) {
        refetchNearbyOrders();
      }
    }, [isOnline, location, refetchNearbyOrders]);

   // Order mutations
   const acceptOrderMutation = useAcceptOrder();

  // Local loading state for toggle button
  const [isToggling, setIsToggling] = useState(false);

  // Fixed map region (Tsokome Close area)
  const [region] = useState({
    latitude: 5.5566,
    longitude: -0.2045,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  });

  const navigationMarker = {
    latitude: 5.5566,
    longitude: -0.2045,
  };

   // Toggle rider online/offline status
   const toggleOnlineStatus = useCallback(async () => {
     setIsToggling(true);
     try {
       if (riderStatus === RIDER_STATUS.OFFLINE) {
         setRiderStatus(RIDER_STATUS.ONLINE);
         startLocationTracking();
       } else {
         setRiderStatus(RIDER_STATUS.OFFLINE);
         stopLocationTracking();
       }
     } catch (error) {
       console.error("Error toggling status:", error);
     } finally {
       setIsToggling(false);
     }
   }, [
     riderStatus,
     setRiderStatus,
     startLocationTracking,
     stopLocationTracking,
   ]);

   // Accept the first available order and start delivery
   const handleAcceptFirstOrder = useCallback(async () => {
     if (!nearbyOrders || nearbyOrders.length === 0) return;
     const firstOrder = nearbyOrders[0];
     try {
       await acceptOrderMutation.mutateAsync(firstOrder.id);
       setRiderStatus(RIDER_STATUS.ON_TRIP);
       // Navigation to ActiveTrip is handled by useEffect when activeOrder becomes available
     } catch (error) {
       console.error("Error accepting order:", error);
     }
   }, [nearbyOrders, acceptOrderMutation, setRiderStatus]);

   // Navigate to ActiveTrip when an order is active and rider is ON_TRIP
   useEffect(() => {
     if (activeOrder && riderStatus === RIDER_STATUS.ON_TRIP) {
       navigation.navigate("ActiveTrip", { order: activeOrder });
     }
    }, [activeOrder, riderStatus, navigation]);

    // Compute loading state for the yellow button
    const buttonLoading = isToggling || acceptOrderMutation.isPending;

   return (
     <View style={styles.container}>
       {/* 1. Dynamic Status Banner */}
       <TouchableOpacity
         style={[
           styles.banner,
           {
             paddingTop: insets.top + 8,
             backgroundColor: bannerStatus.color,
           },
         ]}
         activeOpacity={0.9}
       >
         <View style={styles.bannerContent}>
           <View style={{ flex: 1, alignItems: "center" }}>
             <BebaText
               category="body2"
               color={Palette.white}
               style={styles.bannerText}
             >
               {bannerStatus.text}
             </BebaText>
           </View>
           <ChevronRight size={20} color={Palette.white} />
         </View>
       </TouchableOpacity>

       {/* 2. The Background Layer: Map */}
       <BebaMapView
         region={region}
         navigationMarker={location || navigationMarker}
       />

      {/* 3. The Bottom Sheet: Status Control */}
       <StatusSheet
         onToggleStatus={toggleOnlineStatus}
         onAcceptOrder={handleAcceptFirstOrder}
         navigation={navigation}
         riderStatus={riderStatus}
         earnings={earnings}
         availableOrdersCount={nearbyOrders?.length || 0}
         isLoading={buttonLoading}
       />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  banner: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingBottom: 12,
    paddingHorizontal: Spacing.padding,
    paddingTop: 8,
    zIndex: 20,
  },
  bannerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  bannerText: {
    fontSize: 16,
    fontWeight: "600",
  },
});

export default Home;
