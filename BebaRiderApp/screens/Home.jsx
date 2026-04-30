import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronRight } from 'lucide-react-native';
import { useOrder, RIDER_STATUS } from '../context/OrderContext';
import useAppStore from '../store/useAppStore';
import BebaText from '../components/atoms/BebaText';
import BebaMapView from '../components/organisms/MapView';
import StatusSheet from '../components/molecules/StatusSheet';
import { Palette, Spacing } from '../constants/theme';

const Home = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { 
    riderStatus, 
    onlineStatus, 
    toggleOnlineStatus, 
    activeOrder, 
    location,
    earnings,
  } = useOrder();

  // Coordinates matching the Tsokome Close area seen in the image
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

  // Handle navigation to active trip if exists
  useEffect(() => {
    if (activeOrder && riderStatus === RIDER_STATUS.ON_TRIP) {
      navigation.navigate('ActiveTrip', { order: activeOrder });
    }
  }, [activeOrder, riderStatus]);

  // Get banner text based on rider status
  const getBannerText = () => {
    switch (riderStatus) {
      case RIDER_STATUS.ONLINE:
        return 'Searching for orders...';
      case RIDER_STATUS.ON_TRIP:
        return 'Delivery in progress';
      default:
        return 'Orders unavailable';
    }
  };

  // Get banner color based on rider status
  const getBannerColor = () => {
    switch (riderStatus) {
      case RIDER_STATUS.ONLINE:
        return Palette.success;
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
        style={[styles.banner, { 
          paddingTop: insets.top + 8,
          backgroundColor: getBannerColor(),
        }]} 
        activeOpacity={0.9}
      >
        <View style={styles.bannerContent}>
          <View style={{ flex: 1, alignItems: 'center' }}>
             <BebaText category="body2" color={Palette.gray200} style={styles.bannerText}>
              {getBannerText()}
            </BebaText>
          </View>
          <ChevronRight size={20} color={Palette.gray200} />
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
        isOnline={onlineStatus}
        onToggleStatus={toggleOnlineStatus}
        navigation={navigation}
        riderStatus={riderStatus}
        earnings={earnings}
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingBottom: 12,
    paddingHorizontal: Spacing.padding,
    paddingTop: 8,
    zIndex: 20,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Home;
