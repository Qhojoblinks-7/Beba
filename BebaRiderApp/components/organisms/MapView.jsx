import React from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Polyline, Marker } from 'react-native-maps';
import { Palette } from '../../constants/theme';

/**
 * Beba MapView Organism
 * @param {object} region - Current GPS coordinates {latitude, longitude, latitudeDelta, longitudeDelta}
 * @param {array} routeCoordinates - Array of coords for the "Electric Lime" path
 * @param {object} destination - Coords for the drop-off marker
 * @param {object} navigationMarker - Coords for the red navigation arrow
 */
const BebaMapView = ({ region, routeCoordinates = [], destination, navigationMarker }) => {
  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={region}
        showsUserLocation={true}
        showsMyLocationButton={false}
        customMapStyle={lightMapStyle} 
      >
        {/* The "Electric Lime" Route Line */}
        {routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor={Palette.primary}
            strokeWidth={4}
            lineDashPattern={[1]}
          />
        )}

        {/* Destination Marker */}
        {destination && (
          <Marker coordinate={destination}>
            <View style={styles.destinationMarker}>
              <View style={styles.innerMarker} />
            </View>
          </Marker>
        )}

        {/* Red Navigation Arrow Marker */}
        {navigationMarker && (
          <Marker coordinate={navigationMarker}>
            <View style={styles.navigationMarker}>
              <View style={styles.arrowInner} />
            </View>
          </Marker>
        )}
      </MapView>
    </View>
  );
};

// Simplified Light Mode Style to keep it clean for riders
const lightMapStyle = [
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#e9e9e9" }] },
  { "featureType": "landscape", "elementType": "geometry", "stylers": [{ "color": "#f5f5f5" }] },
  { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#ffffff" }] },
  { "featureType": "poi", "stylers": [{ "visibility": "off" }] }
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: Palette.gray100,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  destinationMarker: {
    height: 24,
    width: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 166, 62, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerMarker: {
    height: 12,
    width: 12,
    borderRadius: 6,
    backgroundColor: Palette.primary,
    borderWidth: 2,
    borderColor: Palette.white,
  },
  navigationMarker: {
    height: 40,
    width: 40,
    borderRadius: 20,
    backgroundColor: Palette.danger,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Palette.white,
    shadowColor: Palette.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  arrowInner: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 16,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: Palette.white,
    transform: [{ rotate: '180deg' }],
  },
});

export default BebaMapView;