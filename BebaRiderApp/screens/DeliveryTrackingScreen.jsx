import React, { useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
} from "react-native";
import {
  ChevronLeft,
  MapPin,
  Loader,
  ChevronsRight,
  User,
  Truck,
  Wallet,
  Navigation,
  Car
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { useNearbyOrders, useAcceptOrder, useEarnings, useActiveOrder } from "../query/hooks";
import useAppStore from "../store/useAppStore";
import { RIDER_STATUS } from "../constants/orderConstants";
import { useLocation } from "../hooks/useLocation";
import BebaText from "../components/atoms/BebaText";
import { Palette } from "../constants/theme";

const DeliveryTrackingScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { location, startLocationTracking, stopLocationTracking } = useLocation();
  const riderStatus = useAppStore((state) => state.riderStatus);
  const setRiderStatus = useAppStore((state) => state.setRiderStatus);
  const user = useAppStore((state) => state.user);

  // Start location tracking when screen is focused
  useFocusEffect(
    useCallback(() => {
      startLocationTracking();
      return () => stopLocationTracking();
    }, [])
  );

  const { data: availableOrders = [], isLoading: isLoadingOrders, refetch: refetchNearbyOrders } = useNearbyOrders(
    location?.latitude,
    location?.longitude,
    riderStatus === RIDER_STATUS.ONLINE && !!location,
  );

  const { data: activeOrder } = useActiveOrder();
  const { data: earnings } = useEarnings();

  const acceptOrderMutation = useAcceptOrder();

  // Ensure availableOrders is always an array (handle paginated response shape)
  const ordersList = Array.isArray(availableOrders) ? availableOrders : (availableOrders?.results || []);

  // Determine which order to show on the "Next Delivery" card (active order has priority)
  const displayOrder = activeOrder || ordersList[0];
  const isActive = !!activeOrder;

  const handleAcceptOrder = useCallback(
    async (orderId) => {
      try {
        await acceptOrderMutation.mutateAsync(orderId);
        setRiderStatus(RIDER_STATUS.ON_TRIP);
        navigation.navigate("ActiveTrip");
      } catch (error) {
        console.error("Error accepting order:", error);
      }
    },
    [navigation, setRiderStatus],
  );

  return (
    <View style={[styles.mainWrapper, { paddingTop: insets.top }]}>
      <View style={styles.headerNav}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ChevronLeft size={24} color={Palette.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isLoadingOrders}
            onRefresh={refetchNearbyOrders}
            tintColor={Palette.primary}
          />
        }
      >
        {/* Bento Grid - Uniform side-by-side */}
        <View style={styles.bentoGrid}>
          <View style={styles.bentoCard}>
            <View style={styles.iconContainer}>
              <User size={18} color={Palette.primary} />
            </View>
            <View style={styles.cardTextContainer}>
              <BebaText
                category="h5"
                color={Palette.textPrimary}
                numberOfLines={1}
              >
                {user?.name || "Immanuel"}
              </BebaText>
              <BebaText category="body4" color={Palette.textSecondary}>
                Level 300
              </BebaText>
            </View>
          </View>

           <TouchableOpacity style={styles.bentoCard}>
             <View style={styles.iconContainer}>
               <Wallet size={18} color={Palette.primary} />
             </View>
             <View style={styles.cardTextContainer}>
               <BebaText category="h5" color={Palette.textPrimary}>
                 Earnings
               </BebaText>
               <BebaText category="body4" color={Palette.textSecondary}>
                 {earnings?.today ? `GHS ${earnings.today.toFixed(2)}` : 'GHS 0.00'}
               </BebaText>
             </View>
           </TouchableOpacity>

          <View style={styles.bentoCard}>
            <View style={styles.iconContainer}>
              <Navigation size={18} color={Palette.primary} />
            </View>
            <View style={styles.cardTextContainer}>
              <BebaText category="h5" color={Palette.textPrimary}>
                Zone
              </BebaText>
              <BebaText
                category="body4"
                color={Palette.textSecondary}
                numberOfLines={1}
              >
                Accra
              </BebaText>
            </View>
          </View>

          <TouchableOpacity style={styles.bentoCard}>
            <View style={styles.iconContainer}>
              <Truck size={18} color={Palette.primary} />
            </View>
            <View style={styles.cardTextContainer}>
              <BebaText category="h5" color={Palette.textPrimary}>
                Trips
              </BebaText>
              <BebaText category="body4" color={Palette.textSecondary}>
                {earnings?.completedTrips || 0} Today
              </BebaText>
            </View>
          </TouchableOpacity>
        </View>

        {/* Next Delivery Card with Dynamic Order (active order has priority) */}
        {displayOrder ? (
          <View style={styles.nextDeliveryCard}>
            <View style={styles.nextDeliveryContent}>
              <BebaText category="body4" color="rgba(255,255,255,0.7)">
                {isActive ? 'Active Delivery' : 'Next Delivery'}
              </BebaText>
              <BebaText
                category="h2"
                color={Palette.white}
                style={styles.orderId}
              >
                #BEBA-{displayOrder.id}
              </BebaText>

              <View style={styles.locationRow}>
                <MapPin size={14} color="rgba(255,255,255,0.7)" />
                <BebaText
                  category="body4"
                  color={Palette.white}
                  numberOfLines={1}
                >
                  {displayOrder.pickup_address || "Pickup location"}
                </BebaText>
              </View>

              <View style={styles.statusBadge}>
                <View style={styles.statusDot} />
                <BebaText category="body4" color={Palette.white}>
                  {displayOrder.status.replace('_', ' ')}
                </BebaText>
              </View>
            </View>

            <View style={styles.mapWrapper}>
              <Image
                source={{
                  uri: `https://staticmap.openstreetmap.de/staticmap.php?center=${displayOrder.pickup_latitude},${displayOrder.pickup_longitude}&zoom=13&size=400x400&maptype=mapnik&markers=${displayOrder.pickup_latitude},${displayOrder.pickup_longitude},red-pushpin`,
                }}
                style={styles.mapImage}
                resizeMode="cover"
              />
              {/* Horizontal blend overlay */}
              <LinearGradient
                colors={[Palette.secondary, Palette.secondary, "transparent"]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                locations={[0, 0.15, 0.8]} // Solid color for a bit, then fades out
                style={styles.blendGradient}
              />
            </View>
          </View>
        ) : null}

        <View style={styles.sectionHeader}>
          <BebaText category="h3" color={Palette.textPrimary}>
            New Requests
          </BebaText>
          <BebaText category="body3" color={Palette.textSecondary}>
            {ordersList.length} nearby
          </BebaText>
        </View>

        {isLoadingOrders ? (
          <View style={styles.centerPadding}>
            <Loader size={24} color={Palette.primary} />
          </View>
        ) : (
          ordersList.map((order) => (
            <TouchableOpacity
              key={order.id}
              style={styles.requestCard}
              onPress={() => handleAcceptOrder(order.id)}
            >
               <View style={styles.requestHeader}>
                 <BebaText category="h2" color={Palette.white}>
                   #ORD-{order.id.toString().slice(-6).toUpperCase()}
                 </BebaText>
                 <View style={styles.whiteBadge}>
                   <BebaText category="body4" color={Palette.primary}>
                     GHS {order.trip_metrics?.total_fare || "0.00"}
                   </BebaText>
                 </View>
               </View>

               <View style={styles.routeRow}>
                 <View style={styles.flexOne}>
                   <BebaText category="body4" color="rgba(255,255,255,0.6)">
                     Pickup
                   </BebaText>
                   <BebaText
                     category="body3"
                     color={Palette.white}
                     numberOfLines={1}
                   >
                     {order.pickup_address || "Pickup location"}
                   </BebaText>
                 </View>

                 <View style={styles.arrowContainer}>
                   <ChevronsRight color="rgba(255,255,255,0.4)" size={28} />
                 </View>

                 <View style={[styles.flexOne, { alignItems: "flex-end" }]}>
                   <BebaText category="body4" color="rgba(255,255,255,0.6)">
                     Dropoff
                   </BebaText>
                   <BebaText
                     category="body3"
                     color={Palette.white}
                     numberOfLines={1}
                   >
                     {order.dropoff_address || "Dropoff location"}
                   </BebaText>
                 </View>
               </View>
             </TouchableOpacity>
           ))
         )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainWrapper: { flex: 1, backgroundColor: Palette.background },
  headerNav: { paddingHorizontal: 16, paddingVertical: 8 },
  backButton: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: Palette.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 40 },
  bentoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginVertical: 16,
    gap: 10,
  },
  bentoCard: {
    width: "48%",
    height: 80,
    backgroundColor: Palette.surface,
    borderRadius: 22,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: Palette.background,
    justifyContent: "center",
    alignItems: "center",
  },
  cardTextContainer: { flex: 1, justifyContent: "center" },
  flexOne: { flex: 1 },
  nextDeliveryCard: {
    backgroundColor: Palette.secondary,
    borderRadius: 35,
    height: 190,
    overflow: "hidden",
    marginVertical: 10,
    flexDirection: "row",
    position: "relative",
  },
  nextDeliveryContent: {
    flex: 1.2,
    padding: 24,
    justifyContent: "center",
    zIndex: 20,
  },
  orderId: { marginVertical: 4, fontSize: 26 },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFD700",
  },
  mapWrapper: {
    flex: 1,
    height: "100%",
    position: "relative",
  },
  mapImage: {
    width: "100%",
    height: "100%",
  },
  blendGradient: {
    ...StyleSheet.absoluteFillObject,
    // This creates the transition from solid card color to map transparency
    zIndex: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 25,
    marginBottom: 12,
  },
  requestCard: {
    backgroundColor: Palette.primary,
    borderRadius: 35,
    padding: 24,
    marginBottom: 12,
  },
  requestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  whiteBadge: {
    backgroundColor: Palette.white,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  routeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  arrowContainer: { paddingHorizontal: 8 },
  centerPadding: { padding: 20, alignItems: "center" },
});

export default DeliveryTrackingScreen;
