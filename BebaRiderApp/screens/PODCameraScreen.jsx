import React, { useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera'; // Assuming Expo Camera
import { X, Zap, Circle, CheckCircle, RotateCcw, Package } from 'lucide-react-native';
import BebaText from '../components/atoms/BebaText';
import { Palette, Spacing } from '../constants/theme';

const PODCameraScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const cameraRef = useRef(null);
  
  // These would come from the Chat Thread navigation parameters
  const customerName = route.params?.customerName || "Ester"; 
  const orderId = route.params?.orderId || "#WE6K-78RFE4";

  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState(null);
  const [isTakingPhoto, setIsTakingPhoto] = useState(false);
  const [flash, setFlash] = useState('off');

  if (!permission) {
    // Camera permissions are still loading.
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={[styles.container, styles.permissionView]}>
        <Package size={60} color={Palette.textSecondary} style={{marginBottom: 20}} />
        <BebaText category="h2" color={Palette.textPrimary} style={styles.centerText}>Camera Access Required</BebaText>
        <BebaText category="body3" color={Palette.textSecondary} style={[styles.centerText, {marginVertical: 15}]}>
          To provide proof of delivery, Beba needs permission to use your camera.
        </BebaText>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <BebaText category="h4" color={Palette.white}>Grant Permission</BebaText>
        </TouchableOpacity>
        <TouchableOpacity style={{marginTop: 20}} onPress={() => navigation.goBack()}>
          <BebaText category="body4" color={Palette.textSecondary}>Cancel</BebaText>
        </TouchableOpacity>
      </View>
    );
  }

  const takePhoto = async () => {
    if (cameraRef.current && !isTakingPhoto) {
      try {
        setIsTakingPhoto(true);
        const options = { quality: 0.7, base64: true, skipProcessing: true };
        const takenPhoto = await cameraRef.current.takePictureAsync(options);
        setPhoto(takenPhoto);
      } catch (error) {
        console.error("Failed to take photo", error);
        Alert.alert("Error", "Failed to capture photo. Please try again.");
      } finally {
        setIsTakingPhoto(false);
      }
    }
  };

   const confirmPOD = () => {
     // In a real app, this is where you'd start the upload process.
     // For now, we return the photo object back to the ChatThread.
     console.log('Sending POD evidence for Order', orderId);
     navigation.navigate('ChatThread', { podPhoto: photo, orderId: orderId, name: customerName });
   };

  const toggleFlash = () => {
    setFlash(current => (current === 'off' ? 'on' : 'off'));
  };

  // --- Photo Preview Mode ---
  if (photo) {
    return (
      <View style={styles.container}>
        <Image source={{ uri: photo.uri }} style={styles.fullPreview} />
        
        {/* Fixed Header in Preview */}
        <View style={[styles.overlayHeader, { paddingTop: insets.top + 10 }]}>
          <BebaText category="h3" color={Palette.white}>Confirm Delivery Photo</BebaText>
        </View>

        {/* POD Contextual Badge */}
        <View style={styles.contextBadge}>
          <BebaText category="body4" color={Palette.gray400}>Proof of delivery for</BebaText>
          <BebaText category="h4" color={Palette.white}>{customerName}</BebaText>
          <BebaText category="h4" color={Palette.primary}>{orderId}</BebaText>
        </View>

        {/* Action Footer for Preview */}
        <View style={[styles.previewFooter, { paddingBottom: insets.bottom + 20 }]}>
          <TouchableOpacity style={styles.retakeButton} onPress={() => setPhoto(null)}>
            <RotateCcw size={24} color={Palette.textPrimary} />
            <BebaText category="h4" color={Palette.textPrimary}>Retake</BebaText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.confirmButton} onPress={confirmPOD}>
            <CheckCircle size={24} color={Palette.white} />
            <BebaText category="h4" color={Palette.white}>Confirm POD</BebaText>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // --- Live Camera Mode ---
  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} ref={cameraRef} flash={flash}>
        {/* 1. Transparent Header Navigation */}
        <View style={[styles.overlayHeader, { paddingTop: insets.top + 10 }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconOp}>
            <X size={24} color={Palette.white} />
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleFlash} style={styles.iconOp}>
            <Zap size={24} color={flash === 'on' ? Palette.accent : Palette.white} />
          </TouchableOpacity>
        </View>

        {/* 2. Simplified Guide Mask */}
        <View style={styles.maskContainer}>
          <View style={styles.guideFrame}>
            <BebaText category="body4" color={Palette.white} style={styles.guideText}>Center the delivered items here</BebaText>
          </View>
        </View>

        {/* 3. Operational Footer */}
        <View style={[styles.cameraFooter, { paddingBottom: insets.bottom + 20 }]}>
          <View style={styles.footerContext}>
            <BebaText category="body3" color={Palette.gray400}>Uploading to</BebaText>
            <BebaText category="h3" color={Palette.white}>{customerName}</BebaText>
            <BebaText category="h4" color={Palette.primary}>{orderId}</BebaText>
          </View>
          
          <TouchableOpacity 
            style={[styles.shutterButton, isTakingPhoto && styles.shutterDisabled]} 
            onPress={takePhoto} 
            disabled={isTakingPhoto}
          >
            <Circle size={60} color={Palette.white} fill={Palette.white} />
          </TouchableOpacity>
          
          <View style={{width: 50}} /> {/* Empty space to balance shutter */}
        </View>
      </CameraView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Palette.black }, // Camera defaults to dark for context
  camera: { flex: 1, justifyContent: 'space-between' },
  overlayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.gutter,
    zIndex: 10,
    alignItems: 'center'
  },
  iconOp: {
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 22
  },
  maskContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5
  },
  guideFrame: {
    width: '75%',
    height: '40%',
    borderColor: 'rgba(255,255,255,0.7)',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)'
  },
  guideText: { textAlign: 'center', paddingHorizontal: 20 },
  cameraFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.gutter,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingVertical: 15
  },
  footerContext: { gap: 2, flex: 1 },
  shutterButton: {
    padding: 3,
    borderWidth: 4,
    borderColor: Palette.white,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterDisabled: { opacity: 0.5 },
  
  // Preview Styles
  fullPreview: { ...StyleSheet.absoluteFillObject },
  contextBadge: {
    position: 'absolute',
    top: Spacing.column * 1.5,
    left: Spacing.gutter,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 12,
    borderRadius: 12,
    gap: 4
  },
  previewFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.gutter,
    paddingTop: 20,
    gap: 15
  },
  retakeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Palette.surface,
    paddingVertical: 14,
    justifyContent: 'center',
    borderRadius: Spacing.borderRadius,
  },
  confirmButton: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Palette.primary,
    paddingVertical: 14,
    justifyContent: 'center',
    borderRadius: Spacing.borderRadius,
  },
  // Permission Styles
  permissionView: {
    backgroundColor: Palette.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  centerText: { textAlign: 'center' },
  permissionButton: {
    backgroundColor: Palette.primary,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: Spacing.borderRadius,
    marginTop: 20
  }
});

export default PODCameraScreen;