import React, { useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Image } from 'react-native';
import { ChevronLeft, MapPin, Loader, ChevronsRight, User, Truck, Wallet, Navigation } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNearbyOrders, useAcceptOrder, useProfile, useEarnings } from '../query/hooks';
import useAppStore from '../store/useAppStore';
import { RIDER_STATUS } from '../constants/orderConstants';
import { useLocation } from '../hooks/useLocation';
import BebaText from '../components/atoms/BebaText';
import { Palette } from '../constants/theme';
import { BASE_FARE, DISTANCE_RATE } from '../constants/pricing';

const DeliveryTrackingScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { location } = useLocation();
  const riderStatus = useAppStore((state) => state.riderStatus);
  const setRiderStatus = useAppStore((state) => state.setRiderStatus);

  // Fetch real data
  const { data: availableOrders = [], isLoading: isLoadingOrders, refetch: refetchNearbyOrders } = useNearbyOrders(
    location?.latitude,
    location?.longitude,
    riderStatus === RIDER_STATUS.ONLINE && !!location
  );

  const { data: profile } = useProfile();
  const { data: earnings } = useEarnings();

  const acceptOrderMutation = useAcceptOrder();

  // Get the next available order (first in sorted list by distance)
  const nextOrder = availableOrders[0];

  // Calculate distance between two coordinates (Haversine) in km
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Calculate estimated price from pickup-dropoff distance
  const getEstimatedPrice = (order) => {
    if (order.price) return order.price;
    const pickupLat = parseFloat(order.pickup_latitude);
    const pickupLng = parseFloat(order.pickup_longitude);
    const dropoffLat = parseFloat(order.dropoff_latitude);
    const dropoffLng = parseFloat(order.dropoff_longitude);
    if (pickupLat && pickupLng && dropoffLat && dropoffLng) {
      const distanceKm = calculateDistance(pickupLat, pickupLng, dropoffLat, dropoffLng);
      return (BASE_FARE + distanceKm * DISTANCE_RATE).toFixed(2);
    }
    return BASE_FARE.toFixed(2);
  };

  // Derive zone label: use next order's pickup area or fallback
  const getZoneLabel = () => {
    if (nextOrder?.pickup_address) {
      const parts = nextOrder.pickup_address.split(',');
      return parts[0].trim();
    }
    return 'Accra Central';
  };

  const zoneLabel = getZoneLabel();

  const handleAcceptOrder = useCallback(async (orderId) => {
    try {
      await acceptOrderMutation.mutateAsync(orderId);
      setRiderStatus(RIDER_STATUS.ON_TRIP);
      navigation.navigate('ActiveTrip');
    } catch (error) {
      console.error('Error accepting order:', error);
    }
   }, [acceptOrderMutation, setRiderStatus, navigation]);

   return (
    <View style={[styles.mainWrapper, { paddingTop: insets.top }]}>
      <View style={styles.headerNav}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color={Palette.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={isLoadingOrders} onRefresh={refetchNearbyOrders} tintColor={Palette.primary} />}
      >
         {/* 1. Uniform Bento Grid - Side-by-Side Icons and Text */}
         <View style={styles.bentoGrid}>
           <View style={styles.bentoCard}>
             <View style={styles.iconContainer}><User size={18} color={Palette.primary} /></View>
             <View style={styles.cardTextContainer}>
               <BebaText category="h5" color={Palette.textPrimary} numberOfLines={1}>
                 {profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Rider' : 'Loading...'}
               </BebaText>
               <BebaText category="body4" color={Palette.textSecondary}>Level 300</BebaText>
             </View>
           </View>

           <TouchableOpacity style={styles.bentoCard}>
             <View style={styles.iconContainer}><Wallet size={18} color={Palette.primary} /></View>
             <View style={styles.cardTextContainer}>
                 <BebaText category="h5" color={Palette.textPrimary}>Earnings</BebaText>
                 <BebaText category="body4" color={Palette.textSecondary}>GHS {(earnings?.today || 0).toFixed(2)}</BebaText>
             </View>
           </TouchableOpacity>

           <View style={styles.bentoCard}>
             <View style={styles.iconContainer}><Navigation size={18} color={Palette.primary} /></View>
             <View style={styles.cardTextContainer}>
               <BebaText category="h5" color={Palette.textPrimary}>Zone</BebaText>
               <BebaText category="body4" color={Palette.textSecondary} numberOfLines={1}>{zoneLabel}</BebaText>
             </View>
           </View>

           <TouchableOpacity style={styles.bentoCard}>
             <View style={styles.iconContainer}><Truck size={18} color={Palette.primary} /></View>
             <View style={styles.cardTextContainer}>
                 <BebaText category="h5" color={Palette.textPrimary}>Trips</BebaText>
                 <BebaText category="body4" color={Palette.textSecondary}>{earnings?.completedTrips || 0} Today</BebaText>
             </View>
           </TouchableOpacity>
         </View>

         {/* 2. Next Delivery Card - Clipped Map Layout */}
         {nextOrder && (
           <View style={styles.nextDeliveryCard}>
               <View style={styles.nextDeliveryContent}>
                   <BebaText category="body4" color={Palette.textTertiary}>Next Delivery</BebaText>
                   <BebaText category="h2" color={Palette.white} style={styles.orderId}>#BEBA-{nextOrder.id.toString().slice(-4).toUpperCase()}</BebaText>

                   <View style={styles.locationRow}>
                       <MapPin size={14} color={Palette.textTertiary} />
                       <BebaText category="body4" color={Palette.white} numberOfLines={1}>{nextOrder.dropoff_address || 'Drop-off location'}</BebaText>
                   </View>

                   <View style={styles.statusBadge}>
                       <View style={styles.statusDot} />
                       <BebaText category="body4" color={Palette.white}>Pending</BebaText>
                   </View>
               </View>

                {/* Map clipped to the right side */}
                <View style={styles.mapClipContainer}>
                  <Image
                      source={{
                        uri: `https://staticmap.openstreetmap.de/staticmap.php?center=${nextOrder.dropoff_latitude || 5.6037},${nextOrder.dropoff_longitude || -0.1862}&zoom=13&size=300x300&maptype=mapnik`
                      }}
                      style={styles.clippedMap}
                      resizeMode="cover"
                  />
                  <View style={styles.mapDarken} />
                </View>
           </View>
         )}

        {/* 3. New Requests Header */}
        <View style={styles.sectionHeader}>
          <BebaText category="h3" color={Palette.textPrimary}>New Requests</BebaText>
          <BebaText category="body3" color={Palette.textSecondary}>{availableOrders.length} nearby</BebaText>
        </View>

        {/* 4. Request Cards */}
        {isLoadingOrders ? (
          <View style={styles.centerPadding}><Loader size={24} color={Palette.primary} /></View>
        ) : (
          availableOrders.map((order) => (
            <TouchableOpacity 
              key={order.id} 
              style={styles.requestCard} 
              onPress={() => handleAcceptOrder(order.id)}
            >
               <View style={styles.requestHeader}>
                 <BebaText category="h2" color={Palette.white}>#ORD-{order.id.toString().slice(-6).toUpperCase()}</BebaText>
                 <View style={styles.whiteBadge}>
                   <BebaText category="body4" color={Palette.primary}>GHS {getEstimatedPrice(order)}</BebaText>
                 </View>
               </View>

              <View style={styles.routeRow}>
                <View style={styles.flexOne}>
                  <BebaText category="body4" color="rgba(255,255,255,0.6)">Pickup</BebaText>
                  <BebaText category="body3" color={Palette.white} numberOfLines={1}>               {order.pickup_address || 'Pickup location'}</BebaText>
                </View>
                
                <View style={styles.arrowContainer}>
                   <ChevronsRight color="rgba(255,255,255,0.4)" size={28} />
                </View>

                <View style={[styles.flexOne, { alignItems: 'flex-end' }]}>
                  <BebaText category="body4" color="rgba(255,255,255,0.6)">Dropoff</BebaText>
                   <BebaText category="body3" color={Palette.white} numberOfLines={1}>{order.dropoff_address || 'Drop-off location'}</BebaText>
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
    width: 45, height: 45, borderRadius: 15,
    backgroundColor: Palette.surface, justifyContent: 'center', alignItems: 'center',
    elevation: 2,
  },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 40 },
  bentoGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-between', 
    marginVertical: 16,
    gap: 10,
  },
  bentoCard: {
    width: '48%', 
    height: 80,
    backgroundColor: Palette.surface,
    borderRadius: 22,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconContainer: {
    width: 36, height: 36, borderRadius: 12,
    backgroundColor: Palette.background, justifyContent: 'center', alignItems: 'center',
  },
  cardTextContainer: { flex: 1, justifyContent: 'center' },
  flexOne: { flex: 1 },
  nextDeliveryCard: {
    backgroundColor: Palette.secondary, 
    borderRadius: 35,
    height: 180, 
    overflow: 'hidden', 
    marginVertical: 10, 
    flexDirection: 'row',
    position: 'relative',
  },
  nextDeliveryContent: { 
    flex: 1.2, // Gives more space to the text side
    padding: 24, 
    justifyContent: 'center', 
    zIndex: 2 
  },
  orderId: { marginVertical: 4, fontSize: 24 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 12 },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)', alignSelf: 'flex-start',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 6,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FFD700' }, // Yellow for pending
  mapClipContainer: {
    flex: 1,
    height: '100%',
    position: 'relative',
  },
  clippedMap: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 40, // Clips the map inwards exactly like the image
    borderBottomLeftRadius: 40,
  },
  mapDarken: { 
    ...StyleSheet.absoluteFillObject, 
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderTopLeftRadius: 40,
    borderBottomLeftRadius: 40,
  },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginTop: 25, marginBottom: 12,
  },
  requestCard: {
    backgroundColor: Palette.primary, 
    borderRadius: 35,
    padding: 24, 
    marginBottom: 12,
  },
  requestHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 15,
  },
  whiteBadge: {
    backgroundColor: Palette.white, paddingHorizontal: 12,
    paddingVertical: 5, borderRadius: 12,
  },
  routeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  arrowContainer: { paddingHorizontal: 8 },
  centerPadding: { padding: 20, alignItems: 'center' },
});

export default DeliveryTrackingScreen;