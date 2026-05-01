import React, { useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Linking, RefreshControl } from 'react-native';
import { ChevronLeft, MapPin, Box, ChevronRight, Phone, User, Loader } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNearbyOrders, useAcceptOrder } from '../query/hooks';
import useAppStore from '../store/useAppStore';
import { RIDER_STATUS } from '../constants/orderConstants';
import { useLocation } from '../hooks/useLocation';
import BebaText from '../components/atoms/BebaText';
import OrderCard from '../components/molecules/OrderCard';
import { Palette, Spacing } from '../constants/theme';

const DeliveryTrackingScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  
  // State & Hooks
  const { location } = useLocation();
  const riderStatus = useAppStore((state) => state.riderStatus);
  const setRiderStatus = useAppStore((state) => state.setRiderStatus);
  
  // TanStack Query
  const { data: availableOrders = [], isLoading: isLoadingOrders, refetch: refetchNearbyOrders } = useNearbyOrders(
    location?.latitude,
    location?.longitude,
    riderStatus === RIDER_STATUS.ONLINE && !!location
  );
  
  const acceptOrderMutation = useAcceptOrder();

  // Destination mock coordinates for navigation
  const destinationCoords = location || { lat: 5.5500, lng: -0.1962 }; 

  const handleNavigation = (address) => {
    const url = `google.navigation:q=${encodeURIComponent(address)}`;
    Linking.openURL(url).catch(err => {
      const webUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
      Linking.openURL(webUrl).catch(e => console.error("Couldn't load map", e));
    });
  };

  const handleCall = (phoneNumber = "+233000000000") => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleAcceptOrder = useCallback(async (orderId) => {
    try {
      await acceptOrderMutation.mutateAsync(orderId);
      // Update rider status to ON_TRIP
      setRiderStatus(RIDER_STATUS.ON_TRIP);
      navigation.navigate('ActiveTrip');
    } catch (error) {
      console.error('Error accepting order:', error);
    }
  }, [acceptOrderMutation, navigation, setRiderStatus]);

  const handleOrderPress = useCallback((order) => {
    // Show order details modal or navigate to detail screen
    console.log('Order pressed:', order.id);
  }, []);

  const handleRefresh = useCallback(() => {
    refetchNearbyOrders();
  }, [refetchNearbyOrders]);

  // Show empty state if not online
  if (riderStatus === RIDER_STATUS.OFFLINE) {
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
        <View style={styles.emptyContainer}>
<BebaText category="h2" color={Palette.textPrimary}>Go Online</BebaText>
          <BebaText category="body2" color={Palette.textSecondary}>
            Turn on order search to see available deliveries
          </BebaText>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.mainWrapper, { paddingTop: insets.top }]}>
      {/* 1. Fixed Back Button */}
      <View style={styles.headerNav}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
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
            onRefresh={handleRefresh}
          />
        }
      >
        
        {/* 2. Quick Actions Grid */}
        <View style={styles.grid}>
          {/* Call Customer */}
          <TouchableOpacity 
            style={styles.gridItem}
            onPress={() => handleCall()}
          >
            <View style={styles.iconCircle}>
              <Phone size={18} color={Palette.primary} /> 
            </View>
            <View style={styles.textContainer}>
              <BebaText category="h4" color={Palette.textPrimary}>Call</BebaText>
              <BebaText category="body3" color={Palette.textSecondary}>Support</BebaText>
            </View>
          </TouchableOpacity>

          {/* GPS Navigation */}
          <TouchableOpacity 
            style={[styles.gridItem, { backgroundColor: Palette.secondary }]}
            onPress={() => handleNavigation('Current Location')}
          >
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <MapPin size={18} color={Palette.accent} />
            </View>
<View style={styles.textContainer}>
              <BebaText category="h4" color={Palette.white}>Navigate</BebaText>
              <BebaText category="body3" color={Palette.textTertiary}>GPS</BebaText>
            </View>
          </TouchableOpacity>
        </View>

        {/* 3. Section Header */}
        <View style={styles.sectionHeader}>
          <BebaText category="h3" color={Palette.textPrimary}>
            Available Deliveries ({availableOrders.length})
          </BebaText>
        </View>

        {/* 4. Available Orders List */}
        {isLoadingOrders ? (
          <View style={styles.loadingContainer}>
<Loader size={32} color={Palette.primary} />
            <BebaText category="body2" color={Palette.textSecondary}>
              Finding orders near you...
            </BebaText>
          </View>
        ) : availableOrders.length === 0 ? (
          <View style={styles.emptyOrders}>
            <Box size={48} color={Palette.textTertiary} />
            <BebaText category="h3" color={Palette.textPrimary}>
              No orders available
            </BebaText>
            <BebaText category="body2" color={Palette.textSecondary}>
              Check back shortly for new deliveries
            </BebaText>
          </View>
        ) : (
          availableOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onAccept={handleAcceptOrder}
              onPress={() => handleOrderPress(order)}
            />
          ))
        )}

        {/* 5. Recent Orders Section */}
        <View style={styles.sectionHeader}>
          <BebaText category="h3" color={Palette.textPrimary}>Recent</BebaText>
          <TouchableOpacity>
            <BebaText category="body3" color={Palette.textSecondary}>See All</BebaText>
          </TouchableOpacity>
        </View>

        {/* Recent Order Card (Mock - should eventually use history hook) */}
        <TouchableOpacity 
          style={styles.recentCard}
          onPress={() => navigation.navigate('TripDetails')}
        >
          <View style={styles.recentHeader}>
            <BebaText category="h4" color={Palette.textPrimary}>#RW3E-74ESW4</BebaText>
            <View style={styles.miniBadge}>
              <BebaText category="body4" color={Palette.white}>Delivered</BebaText>
            </View>
          </View>
          
<View style={styles.routeContainer}>
            <View>
              <BebaText category="body4" color={Palette.textPrimary}>Today, 2:30 PM</BebaText>
              <BebaText category="body3" color={Palette.textSecondary}>Makola Market</BebaText>
            </View>
            <ChevronRight color={Palette.textPrimary} size={24} />
            <View style={{ alignItems: 'flex-end' }}>
              <BebaText category="body4" color={Palette.textPrimary}>Today, 2:45 PM</BebaText>
              <BebaText category="body3" color={Palette.textSecondary}>Osu Oxford St</BebaText>
            </View>
          </View>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainWrapper: { 
    flex: 1, 
    backgroundColor: Palette.background,
  },
  headerNav: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Palette.surface,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  scrollContent: { 
    paddingHorizontal: 16, 
    paddingBottom: 40,
    paddingTop: 10,
  },
  grid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 12, 
    marginBottom: 24 
  },
  gridItem: { 
    width: '48%', 
    backgroundColor: Palette.surface, 
    padding: 12, 
    borderRadius: Spacing.borderRadius,
    flexDirection: 'row', 
    alignItems: 'center',
    minHeight: 75,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Palette.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10 
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center'
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 15
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
    gap: 12,
  },
  emptyOrders: {
    alignItems: 'center',
    padding: 40,
    gap: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    padding: 40,
  },
  recentCard: {
    backgroundColor: Palette.secondary,
    borderRadius: Spacing.borderRadius,
    padding: 20,
    marginBottom: 16,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  miniBadge: {
    backgroundColor: Palette.primary,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 12
  },
  routeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  }
});

export default DeliveryTrackingScreen;
