import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BebaText from '../components/atoms/BebaText';
import { Palette, Spacing } from '../constants/theme';
import { Car, ChevronRight } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';

const VehicleDetails = ({ navigation }) => {
  const vehicleData = {
    plateNumber: 'GX 1234-21',
    model: 'Toyota Camry',
    year: '2021',
    color: 'White',
    registrationDate: '2024-03-09',
    expiryDate: '2026-03-09',
    insuranceProvider: 'Enterprise Insurance',
    policyNumber: 'INS-123456789',
    insuranceExpiry: '2025-09-15',
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Car size={32} color={Palette.white} />
          <BebaText category="h2" color={Palette.white} style={styles.headerTitle}>
            Vehicle Details
          </BebaText>
        </View>

        {/* Vehicle Info Card */}
        <View style={styles.card}>
          <BebaText category="h3" color={Palette.textPrimary} style={styles.cardTitle}>
            Vehicle Information
          </BebaText>

          <View style={styles.infoRow}>
            <BebaText category="body2" color={Palette.textSecondary}>
              Plate Number
            </BebaText>
            <BebaText category="body2" color={Palette.textPrimary} style={styles.value}>
              {vehicleData.plateNumber}
            </BebaText>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <BebaText category="body2" color={Palette.textSecondary}>
              Model
            </BebaText>
            <BebaText category="body2" color={Palette.textPrimary} style={styles.value}>
              {vehicleData.model}
            </BebaText>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <BebaText category="body2" color={Palette.textSecondary}>
              Year
            </BebaText>
            <BebaText category="body2" color={Palette.textPrimary} style={styles.value}>
              {vehicleData.year}
            </BebaText>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <BebaText category="body2" color={Palette.textSecondary}>
              Color
            </BebaText>
            <BebaText category="body2" color={Palette.textPrimary} style={styles.value}>
              {vehicleData.color}
            </BebaText>
          </View>
        </View>

        {/* Registration Card */}
        <View style={styles.card}>
          <BebaText category="h3" color={Palette.textPrimary} style={styles.cardTitle}>
            Registration
          </BebaText>

          <View style={styles.infoRow}>
            <BebaText category="body2" color={Palette.textSecondary}>
              Registration Date
            </BebaText>
            <BebaText category="body2" color={Palette.textPrimary} style={styles.value}>
              {vehicleData.registrationDate}
            </BebaText>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <BebaText category="body2" color={Palette.textSecondary}>
              Expiry Date
            </BebaText>
            <BebaText category="body2" color={Palette.textPrimary} style={styles.value}>
              {vehicleData.expiryDate}
            </BebaText>
          </View>
        </View>

        {/* Insurance Card */}
        <View style={styles.card}>
          <BebaText category="h3" color={Palette.textPrimary} style={styles.cardTitle}>
            Insurance
          </BebaText>

          <View style={styles.infoRow}>
            <BebaText category="body2" color={Palette.textSecondary}>
              Provider
            </BebaText>
            <BebaText category="body2" color={Palette.textPrimary} style={styles.value}>
              {vehicleData.insuranceProvider}
            </BebaText>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <BebaText category="body2" color={Palette.textSecondary}>
              Policy Number
            </BebaText>
            <BebaText category="body2" color={Palette.textPrimary} style={styles.value}>
              {vehicleData.policyNumber}
            </BebaText>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <BebaText category="body2" color={Palette.textSecondary}>
              Expiry Date
            </BebaText>
            <BebaText category="body2" color={Palette.textPrimary} style={styles.value}>
              {vehicleData.insuranceExpiry}
            </BebaText>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  scrollContent: {
    padding: Spacing.padding,
  },
  header: {
    backgroundColor: Palette.secondary,
    borderRadius: Spacing.borderRadius,
    padding: Spacing.gutter,
    alignItems: 'center',
    marginBottom: Spacing.gutter,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.row,
  },
  headerTitle: {
    color: Palette.white,
  },
  card: {
    backgroundColor: Palette.white,
    borderRadius: Spacing.borderRadius,
    padding: Spacing.card,
    marginBottom: Spacing.gutter,
  },
  cardTitle: {
    marginBottom: Spacing.row,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.row,
  },
  value: {
    color: Palette.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: Palette.gray100,
    marginVertical: Spacing.row,
  },
});

export default VehicleDetails;
