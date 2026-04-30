import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  ShieldCheck, Phone, UserPlus, CheckCircle, 
  Settings, AlertCircle, Calendar, MapPin 
} from 'lucide-react-native';
import BebaText from '../components/atoms/BebaText';
import { Palette, Spacing } from '../constants/theme';

const SecurityScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [emergencyContact, setEmergencyContact] = useState('');
  const [lastFaceCheck, setLastFaceCheck] = useState('2024-04-15');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);

  const handleAddEmergencyContact = () => {
    if (!emergencyContact.trim()) {
      Alert.alert('Error', 'Please enter a phone number');
      return;
    }
    // In a real app, this would save to backend
    Alert.alert(
      'Success', 
      'Emergency contact saved successfully',
      [{ text: 'OK' }]
    );
    setEmergencyContact('');
  };

  const handleFaceCheck = () => {
    // In a real app, this would trigger the face verification flow
    Alert.alert(
      'Face Verification',
      'Please look at the camera to verify your identity',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Verify', onPress: () => {
          setLastFaceCheck(new Date().toISOString().split('T')[0]);
          Alert.alert('Success', 'Identity verified successfully!');
        }}
      ]
    );
  };

  const handleToggleTwoFactor = () => {
    setTwoFactorEnabled(!twoFactorEnabled);
    // In a real app, this would update the setting on backend
  };

  const daysSinceLastCheck = (date) => {
    const lastCheck = new Date(date);
    const today = new Date();
    const diffTime = Math.abs(today - lastCheck);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <BebaText category="h1" color={Palette.textPrimary} style={styles.sectionTitle}>
          Security & Safety
        </BebaText>

        {/* Face Check Status */}
        <View style={styles.securityCard}>
          <View style={styles.securityHeader}>
            <ShieldCheck size={24} color={Palette.primary} />
            <BebaText category="h3" color={Palette.textPrimary}>Identity Verification</BebaText>
          </View>
          
          <View style={styles.faceCheckInfo}>
            <BebaText category="body4" color={Palette.textSecondary}>
              Last verified:
            </BebaText>
            <BebaText category="h4" color={Palette.textPrimary}>
              {lastFaceCheck}
            </BebaText>
            <BebaText category="body4" color={ 
              daysSinceLastCheck(lastFaceCheck) > 7 ? Palette.error : Palette.success
            }>
              {daysSinceLastCheck(lastFaceCheck)} days ago
            </BebaText>
          </View>
          
          <TouchableOpacity 
            style={styles.buttonPrimary}
            onPress={handleFaceCheck}
          >
            <BebaText category="h4" color={Palette.white}>
              Verify Identity
            </BebaText>
          </TouchableOpacity>
        </View>

        {/* Emergency Contacts */}
        <View style={styles.securityCard}>
          <View style={styles.securityHeader}>
            <UserPlus size={24} color={Palette.primary} />
            <BebaText category="h3" color={Palette.textPrimary}>Emergency Contacts</BebaText>
          </View>
          
          <View style={styles.emergencyContactSection}>
            <BebaText category="body4" color={Palette.textSecondary}>
              Add emergency contact who will be notified if you trigger SOS
            </BebaText>
            
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="Enter phone number"
                value={emergencyContact}
                onChangeText={setEmergencyContact}
                keyboardType="phone-pad"
              />
              <TouchableOpacity 
                style={styles.buttonSecondary}
                onPress={handleAddEmergencyContact}
              >
                <BebaText category="h4" color={Palette.primary}>
                  Add
                </BebaText>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Account Security */}
        <View style={styles.securityCard}>
          <View style={styles.securityHeader}>
            <Settings size={24} color={Palette.primary} />
            <BebaText category="h3" color={Palette.textPrimary}>Account Security</BebaText>
          </View>
          
          <View style={styles.toggleRow}>
            <BebaText category="h4" color={Palette.textPrimary}>
              Two-Factor Authentication
            </BebaText>
            <View style={styles.toggleContainer}>
              <View style={[
                styles.toggle,
                twoFactorEnabled && styles.toggleOn
              ]}>
                <View style={[
                  styles.toggleThumb,
                  twoFactorEnabled && styles.toggleThumbOn
                ]} />
              </View>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.toggleRow}
            onPress={handleToggleTwoFactor}
          >
            <BebaText category="h4" color={Palette.textPrimary}>
              Change Password
            </BebaText>
            <View style={styles.toggleContainer}>
              <View style={styles.toggleThumb} />
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.toggleRow}
            onPress={() => navigation.navigate('ChangePassword')}
          >
            <BebaText category="h4" color={Palette.textPrimary}>
              Change Password
            </BebaText>
            <View style={styles.toggleContainer}>
              <View style={styles.toggleThumb} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Safety Features */}
        <View style={styles.securityCard}>
          <View style={styles.securityHeader}>
            <AlertCircle size={24} color={Palette.error || '#FF3B30'} />
            <BebaText category="h3" color={Palette.textPrimary}>Safety Features</BebaText>
          </View>
          
          <View style={styles.safetyFeature}>
            <BebaText category="h4" color={Palette.textPrimary}>
              In-App SOS
            </BebaText>
            <BebaText category="body4" color={Palette.textSecondary}>
              Press power button 5x to alert emergency contacts
            </BebaText>
          </View>
          
          <View style={styles.safetyFeature}>
            <BebaText category="h4" color={Palette.textPrimary}>
              Trip Sharing
            </BebaText>
            <BebaText category="body4" color={Palette.textSecondary}>
              Share live location with trusted contacts
            </BebaText>
          </View>
          
          <View style={styles.safetyFeature}>
            <BebaText category="h4" color={Palette.textPrimary}>
              Safety Training
            </BebaText>
            <BebaText category="body4" color={Palette.textSecondary}>
              Complete defensive driving course
            </BebaText>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Palette.background },
  scrollContent: { paddingHorizontal: Spacing.gutter, paddingBottom: 40 },
  sectionTitle: { marginVertical: 20 },
  
  securityCard: {
    backgroundColor: Palette.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 3
  },
  securityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  
  faceCheckInfo: {
    alignItems: 'center',
    marginVertical: 16
  },
  
  emergencyContactSection: { marginTop: 16 },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 16
  },
  input: {
    flex: 1,
    backgroundColor: Palette.gray100,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: Palette.textPrimary
  },
  
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Palette.gray100
  },
  toggleContainer: {
    width: 40,
    height: 20,
    backgroundColor: Palette.gray200,
    borderRadius: 10
  },
  toggle: {
    width: 20,
    height: 20,
    backgroundColor: Palette.primary,
    borderRadius: 10,
    position: 'absolute',
    left: 2
  },
  toggleOn: {
    backgroundColor: Palette.primary,
    left: 20
  },
  toggleThumb: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Palette.white,
    position: 'absolute',
    left: 2,
    top: 2
  },
  toggleThumbOn: {
    left: 20
  },
  
  safetyFeature: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Palette.gray100
  },
  
  buttonPrimary: {
    backgroundColor: Palette.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 16
  },
  buttonSecondary: {
    backgroundColor: Palette.transparent,
    borderWidth: 1,
    borderColor: Palette.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 16
  }
});

export default SecurityScreen;