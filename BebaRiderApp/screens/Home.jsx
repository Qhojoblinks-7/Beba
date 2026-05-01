import React, { useEffect, useState, useCallback } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronRight } from "lucide-react-native";
import { useLocation } from "../hooks/useLocation";
import { useActiveOrder, useEarnings, useNearbyOrders } from "../query/hooks";
import useAppStore from "../store/useAppStore";
import { RIDER_STATUS } from "../constants/orderConstants";
import BebaText from "../components/atoms/BebaText";
import BebaMapView from "../components/organisms/MapView";
import StatusSheet from "../components/molecules/StatusSheet";
import { Palette, Spacing } from "../constants/theme";

const Home = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { location, startLocationTracking, stopLocationTracking } =
    useLocation();

  // Rider status from Zustand store
  const riderStatus = useAppStore((state) => state.riderStatus);
  const setRiderStatus = useAppStore((state) => state.setRiderStatus);

  // Derived boolean: is rider in ONLINE state (searching for orders)
  const isOnline = riderStatus === RIDER_STATUS.ONLINE;

  // TanStack Query hooks for data fetching
  const { data: activeOrder } = useActiveOrder();
  const { data: earnings } = useEarnings();
  const { data: nearbyOrders } = useNearbyOrders(
    location?.latitude,
    location?.longitude,
    isOnline && !!location,
  );

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

  // Navigate to ActiveTrip when an order is active and rider is ON_TRIP
  useEffect(() => {
    if (activeOrder && riderStatus === RIDER_STATUS.ON_TRIP) {
      navigation.navigate("ActiveTrip", { order: activeOrder });
    }
  }, [activeOrder, riderStatus, navigation]);

  // Banner text based on rider status
  const getBannerText = () => {
    switch (riderStatus) {
      case RIDER_STATUS.ONLINE:
        return "Searching for orders...";
      case RIDER_STATUS.ON_TRIP:
        return "Delivery in progress";
      default:
        return "Orders unavailable";
    }
  };

  // Banner color based on rider status
  const getBannerColor = () => {
    switch (riderStatus) {
      case RIDER_STATUS.ONLINE:
        return Palette.secondary;
      case RIDER_STATUS.ON_TRIP:
        return Palette.primary;
      default:
        return Palette.danger;
    }
  };

  return (
    <View style={styles.container}>
      {/* 1. Slim Banner based on rider status */}
      <TouchableOpacity
        style={[
          styles.banner,
          {
            paddingTop: insets.top + 8,
            backgroundColor: getBannerColor(),
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
              {getBannerText()}
            </BebaText>
          </View>
          <ChevronRight size={20} color={Palette.white} />
        </View>
      </TouchableOpacity>

      {/* 2. The Background Layer: Map */}
      <BebaMapView
        region={region}
        navigationMarker={location || navigationMarker}
        riderLocation={location}
      />

      {/* 3. The Bottom Sheet: Status Control */}
      <StatusSheet
        isOnline={isOnline}
        onToggleStatus={toggleOnlineStatus}
        navigation={navigation}
        riderStatus={riderStatus}
        earnings={earnings}
        availableOrdersCount={nearbyOrders?.length || 0}
        hasActiveOrder={!!activeOrder}
        isLoading={isToggling}
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
