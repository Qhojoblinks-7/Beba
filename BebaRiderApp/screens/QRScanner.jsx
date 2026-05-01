import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { X } from 'lucide-react-native';
import { useActiveOrder, useCompleteOrder } from '../query/hooks';
import useAppStore from '../store/useAppStore';
import { RIDER_STATUS } from '../constants/orderConstants';
import BebaText from '../components/atoms/BebaText';
import { Palette, Spacing } from '../constants/theme';

const QRScanner = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  
  // TanStack Query
  const { data: activeOrder } = useActiveOrder();
  const completeOrderMutation = useCompleteOrder();
  
  // Zustand for status updates
  const setRiderStatus = useAppStore((state) => state.setRiderStatus);

  // Prefer route param, fallback to activeOrder from query
  const orderId = route.params?.orderId || activeOrder?.id;

  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const cameraRef = useRef(null);

  useEffect(() => {
    // Request camera permission on mount
    if (permission && !permission.granted) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const handleBarCodeScanned = async (result) => {
    if (!scanning || isProcessing) return;

    const scannedData = result.data;
    setScanning(false);
    setIsProcessing(true);

    try {
      // Validate we have an orderId
      if (!orderId) {
        throw new Error('Order ID not available');
      }
      // In production, verify the QR code matches this orderId
      // For now, we can optionally check if scannedData === orderId
      await completeOrderMutation.mutateAsync(orderId);
      // Set rider back to ONLINE after successful completion
      setRiderStatus(RIDER_STATUS.ONLINE);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } catch (error) {
      Alert.alert(
        'Scan Failed',
        'Could not complete delivery. Please try again.',
        [{ text: 'OK', onPress: () => setScanning(true) }]
      );
      setScanning(true);
      setIsProcessing(false);
    }
  };

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, styles.permissionView]}>
        <BebaText category="h2" color={Palette.textPrimary} style={styles.centerText}>
          Camera Access Required
        </BebaText>
        <BebaText category="body3" color={Palette.textSecondary} style={[styles.centerText, { marginVertical: 15 }]}>
          To verify delivery, Beba needs permission to use your camera for QR scanning.
        </BebaText>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <BebaText category="h4" color={Palette.white}>Grant Permission</BebaText>
        </TouchableOpacity>
        <TouchableOpacity style={{ marginTop: 20 }} onPress={() => navigation.goBack()}>
          <BebaText category="body4" color={Palette.textSecondary}>Cancel</BebaText>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        onBarcodeScanned={scanning ? handleBarCodeScanned : undefined}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
      >
        {/* Header */}
        <View style={[styles.overlayHeader, { paddingTop: insets.top + 10 }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
            <X size={24} color={Palette.white} />
          </TouchableOpacity>
          <BebaText category="h3" color={Palette.white}>Scan QR to Complete Delivery</BebaText>
          <View style={{ width: 40 }} />
        </View>

        {/* Scan Guide */}
        <View style={styles.scanGuideContainer}>
          <View style={styles.scanFrame}>
            <View style={styles.cornerTL} />
            <View style={styles.cornerTR} />
            <View style={styles.cornerBL} />
            <View style={styles.cornerBR} />
            <BebaText category="body3" color={Palette.white} style={styles.scanPrompt}>
              Position QR code within frame
            </BebaText>
          </View>
        </View>

        {/* Footer */}
        <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
          <BebaText category="body3" color={Palette.gray200}>
            Order #{orderId || ''}
          </BebaText>
          {isProcessing && (
            <BebaText category="body2" color={Palette.primary} style={styles.processingText}>
              Verifying...
            </BebaText>
          )}
        </View>
      </CameraView>
    </View>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Palette.black },
    camera: { flex: 1 },
    overlayHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: Spacing.gutter,
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 10,
    },
    iconBtn: {
      padding: 10,
      backgroundColor: 'rgba(0,0,0,0.4)',
      borderRadius: 20,
    },
    scanGuideContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    scanFrame: {
      width: 260,
      height: 260,
      borderWidth: 0,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.3)',
      borderColor: Palette.primary,
    },
    cornerTL: {
      position: 'absolute',
      top: -2,
      left: -2,
      width: 30,
      height: 30,
      borderTopWidth: 4,
      borderLeftWidth: 4,
      borderColor: Palette.primary,
      borderTopLeftRadius: 20,
    },
    cornerTR: {
      position: 'absolute',
      top: -2,
      right: -2,
      width: 30,
      height: 30,
      borderTopWidth: 4,
      borderRightWidth: 4,
      borderColor: Palette.primary,
      borderTopRightRadius: 20,
    },
    cornerBL: {
      position: 'absolute',
      bottom: -2,
      left: -2,
      width: 30,
      height: 30,
      borderBottomWidth: 4,
      borderLeftWidth: 4,
      borderColor: Palette.primary,
      borderBottomLeftRadius: 20,
    },
    cornerBR: {
      position: 'absolute',
      bottom: -2,
      right: -2,
      width: 30,
      height: 30,
      borderBottomWidth: 4,
      borderRightWidth: 4,
      borderColor: Palette.primary,
      borderBottomRightRadius: 20,
    },
    scanPrompt: {
      marginTop: 12,
      textAlign: 'center',
    },
    footer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      alignItems: 'center',
      paddingHorizontal: Spacing.gutter,
      paddingTop: 20,
      backgroundColor: 'rgba(0,0,0,0.4)',
    },
    processingText: {
      marginTop: 8,
      fontWeight: '600',
    },
    permissionView: {
      backgroundColor: Palette.background,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 40,
    },
    centerText: {
      textAlign: 'center',
    },
    permissionButton: {
      backgroundColor: Palette.primary,
      paddingVertical: 15,
      paddingHorizontal: 30,
      borderRadius: Spacing.borderRadius,
      marginTop: 20,
    },
});

export default QRScanner;
