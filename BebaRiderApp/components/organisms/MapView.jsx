import React from 'react';
import { StyleSheet, View } from 'react-native';
import MapLibreGL from '@maplibre/maplibre-react-native';
import { Palette } from '../../constants/theme';

// Initialize MapLibre (no access token needed for OpenStreetMap tiles)
// For custom styles, you can set a style URL: MapLibreGL.setStyle('https://demotiles.maplibre.org/style.json')

/**
 * Beba MapView Organism - Powered by MapLibre
 * @param {object} region - Current GPS coordinates {latitude, longitude, latitudeDelta, longitudeDelta}
 * @param {array} routeCoordinates - Array of {latitude, longitude} for the route polyline
 * @param {object} destination - Coords for the drop-off marker {latitude, longitude}
 * @param {object} navigationMarker - Coords for the rider's current location marker
 * @param {object} style - Optional additional styles for the container
 */
const BebaMapView = ({ region, routeCoordinates = [], destination, navigationMarker, style }) => {
  // Center coordinate [longitude, latitude]
  const centerCoordinate = region
    ? [region.longitude, region.latitude]
    : navigationMarker
    ? [navigationMarker.longitude, navigationMarker.latitude]
    : [-0.2045, 5.5566];

  // Build GeoJSON LineString for route
  const lineString = routeCoordinates.length > 0 ? {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'LineString',
      coordinates: routeCoordinates.map(coord => [coord.longitude, coord.latitude]),
    },
  } : null;

  return (
    <View style={[styles.container, style]}>
      <MapLibreGL.MapView
        style={styles.map}
        styleURL="https://demotiles.maplibre.org/style.json"
        scrollEnabled={true}
        zoomEnabled={true}
        pitchEnabled={true}
        rotateEnabled={true}
      >
        {/* Camera follows region */}
        <MapLibreGL.Camera
          zoomLevel={15}
          centerCoordinate={centerCoordinate}
          animationMode="flyTo"
          animationDuration={1000}
        />

        {/* Route polyline (if provided) */}
        {lineString && (
          <MapLibreGL.ShapeSource id="routeSource" shape={lineString}>
            <MapLibreGL.LineLayer
              id="routeLine"
              style={{
                lineColor: Palette.primary,
                lineWidth: 4,
                lineDashPattern: [2, 2],
              }}
            />
          </MapLibreGL.ShapeSource>
        )}

        {/* Destination marker (drop-off point) */}
        {destination && (
          <MapLibreGL.PointAnnotation
            id="destination"
            coordinate={[destination.longitude, destination.latitude]}
          >
            <View style={styles.destinationMarker}>
              <View style={styles.innerMarker} />
            </View>
          </MapLibreGL.PointAnnotation>
        )}

        {/* Rider current location marker (red arrow) */}
        {navigationMarker && (
          <MapLibreGL.PointAnnotation
            id="riderLocation"
            coordinate={[navigationMarker.longitude, navigationMarker.latitude]}
          >
            <View style={styles.navigationMarker}>
              <View style={styles.arrowInner} />
            </View>
          </MapLibreGL.PointAnnotation>
        )}

        {/* Local location puck (blue dot) */}
        <MapLibreGL.UserLocation
          visible={true}
          showsUserHeadingIndicator={true}
        />
      </MapLibreGL.MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
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
