import React, { useRef, useState } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import Constants from 'expo-constants';
import {
  Map,
  Camera,
  UserLocation,
  ShapeSource,
  LineLayer,
  MarkerView
} from '@maplibre/maplibre-react-native';
import { Plus, Minus, Navigation2, Layers } from 'lucide-react-native';
import { Palette } from '../../constants/theme';
import BebaText from '../atoms/BebaText';

const { mapApiKey } = Constants.expoConfig?.extra || {};

const BebaMapView = ({ 
  region, 
  routeCoordinates = [], 
  newPickups = [], 
  activeDropoffs = [],
  navigationMarker, 
  style 
}) => {
  const cameraRef = useRef(null);
  const [zoomLevel, setZoomLevel] = useState(14);
  const [showTrafficMode, setShowTrafficMode] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);

  // Accra default coordinates if no region is provided
  const centerCoordinate = region 
    ? [region.longitude, region.latitude] 
    : navigationMarker
    ? [navigationMarker.longitude, navigationMarker.latitude]
    : [-0.1862, 5.6037]; 

  /**
   * handleZoom
   * Uses setStop to adjust zoom level imperatively (v11 API).
   */
  const handleZoom = (delta) => {
    const newZoom = Math.min(Math.max(zoomLevel + delta, 2), 20);
    setZoomLevel(newZoom);

    if (cameraRef.current?.setStop) {
      cameraRef.current.setStop({
        zoomLevel: newZoom,
        duration: 300,
      });
    }
  };

  /**
   * handleRecenter
   * Fly to actual device location if available, otherwise fallback.
   */
  const handleRecenter = () => {
    const target = currentLocation
      ? [currentLocation.longitude, currentLocation.latitude]
      : centerCoordinate;

    if (cameraRef.current?.flyTo) {
      cameraRef.current.flyTo(target, 1000);
      setZoomLevel(16);
    }
  };

  const routeGeoJSON = routeCoordinates.length > 0 ? {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'LineString',
      coordinates: routeCoordinates.map(coord => [coord.longitude, coord.latitude]),
    },
  } : null;

  return (
    <View style={[styles.container, style]}>
      <Map
        style={styles.map}
        mapStyle={showTrafficMode
          ? `https://tiles.stadiamaps.com/styles/alidade_smooth_dark.json?api_key=${mapApiKey}`
          : `https://tiles.stadiamaps.com/styles/alidade_smooth.json?api_key=${mapApiKey}`}
        logoEnabled={false}
        compassEnabled={false}
      >
        <Camera
          ref={cameraRef}
          zoom={zoomLevel}
          centerCoordinate={centerCoordinate}
        />

        {/* Delivery Route Rendering */}
        {routeGeoJSON && (
          <ShapeSource id="routeSource" shape={routeGeoJSON}>
            <LineLayer
              id="routeLine"
              style={{
                lineColor: Palette.primary,
                lineWidth: 5,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
          </ShapeSource>
        )}

        {/* Map Overlays for Pickups - guard against invalid data */}
        {Array.isArray(newPickups) && newPickups.map((pickup) => (
          <MarkerView
            key={`pickup-${pickup.id}`}
            id={`pickup-${pickup.id}`}
            coordinate={[pickup.longitude, pickup.latitude]}
          >
            <View style={styles.tooltipWrapper}>
              <View style={[styles.pillContainer, { backgroundColor: Palette.primary }]}>
                <BebaText category="body4" color={Palette.white} style={styles.pillText}>
                  Pickup • GHS {pickup.price}
                </BebaText>
              </View>
              <View style={[styles.pillArrow, { borderTopColor: Palette.primary }]} />
            </View>
          </MarkerView>
        ))}

        {/* Map Overlays for Drop-offs - guard against invalid data */}
        {Array.isArray(activeDropoffs) && activeDropoffs.map((dropoff) => (
          <MarkerView
            key={`dropoff-${dropoff.id}`}
            id={`dropoff-${dropoff.id}`}
            coordinate={[dropoff.longitude, dropoff.latitude]}
          >
            <View style={styles.tooltipWrapper}>
              <View style={[styles.pillContainer, { backgroundColor: Palette.secondary }]}>
                <BebaText category="body4" color={Palette.white} style={styles.pillText}>
                  Drop-off
                </BebaText>
              </View>
              <View style={[styles.pillArrow, { borderTopColor: Palette.secondary }]} />
            </View>
          </MarkerView>
        ))}

        <UserLocation
          visible={true}
          animated={true}
          renderMode="native"
          onLocationUpdate={(location) => {
            const [longitude, latitude] = location.coordinate;
            setCurrentLocation({ longitude, latitude });
          }}
        />
      </Map>

      {/* Floating Map Controls */}
      <View style={styles.controlsContainer}>
        <View style={styles.controlGroup}>
          <TouchableOpacity style={styles.controlButton} onPress={() => handleZoom(1)}>
            <Plus size={22} color={Palette.textPrimary} />
          </TouchableOpacity>
          <View style={styles.separator} />
          <TouchableOpacity style={styles.controlButton} onPress={() => handleZoom(-1)}>
            <Minus size={22} color={Palette.textPrimary} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.actionButton, showTrafficMode && { backgroundColor: Palette.primary }]}
          onPress={() => setShowTrafficMode(!showTrafficMode)}
        >
          <Layers size={22} color={showTrafficMode ? Palette.white : Palette.textPrimary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleRecenter}>
          <Navigation2 size={22} color={Palette.textPrimary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7F7',
  },
  map: { flex: 1 },
  controlsContainer: {
    position: 'absolute',
    right: 16,
    top: '35%',
    gap: 12,
  },
  controlGroup: {
    backgroundColor: Palette.white,
    borderRadius: 15,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  controlButton: {
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  separator: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginHorizontal: 10,
  },
  actionButton: {
    backgroundColor: Palette.white,
    padding: 14,
    borderRadius: 15,
    elevation: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tooltipWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 150, 
  },
   pillContainer: {
     paddingHorizontal: 12,
     paddingVertical: 8,
     borderRadius: 20,
     elevation: 4,
     shadowColor: '#000',
     shadowOpacity: 0.15,
     shadowRadius: 6,
     shadowOffset: { width: 0, height: 2 },
   },
  pillText: {
    fontWeight: '800',
    fontSize: 11,
    textAlign: 'center',
  },
  pillArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -1,
  },
});

export default BebaMapView;