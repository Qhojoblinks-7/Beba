import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ChevronLeft, ChevronDown } from 'lucide-react-native';
import BebaText from '../atoms/BebaText';
import BebaButton from '../atoms/BebaButton';
import BebaMapView from './BebaMapView'; // Reusing your map component
import { Palette, Spacing } from '../../constants/theme';

const TripDetails = ({ navigation, route }) => {
  // Mock data based on your provided image
  const tripData = {
    date: "April 24, 19:45",
    from: "Kaale Street, 1",
    stop: "Asafoatse Omani Street",
    to: "Kaale Street, 1",
    price: "GHS 22",
    fees: "-GHS 4.85",
    total: "GHS 17.15",
  };

  return (
    <View style={styles.container}>
      {/* 1. Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft size={28} color={Palette.black} />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <BebaText category="h2">Trip</BebaText>
          <BebaText category="body4" color={Palette.gray500}>{tripData.date}</BebaText>
        </View>
        <View style={{ width: 28 }} /> {/* Spacer for centering */}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 2. Map Section */}
        <View style={styles.mapContainer}>
          <BebaMapView 
            style={styles.map}
            // Add your logic here to show the route polyline seen in the image
          />
        </View>

        {/* 3. Address Details Section */}
        <View style={styles.section}>
          <DetailRow label="From" value={tripData.from} />
          <DetailRow label="Trip stop" value={tripData.stop} />
          <DetailRow label="To" value={tripData.to} last />
        </View>

        {/* 4. Financial Breakdown Section */}
        <View style={styles.section}>
          <ExpandableRow label="Trip price" value={tripData.price} valueColor={Palette.success} />
          <ExpandableRow label="Fees" value={tripData.fees} valueColor={Palette.danger} />
          
          <View style={styles.totalRow}>
            <BebaText category="h3">Total</BebaText>
            <BebaText category="h3">{tripData.total}</BebaText>
          </View>
        </View>

        {/* 5. Points & Support Section */}
        <View style={styles.section}>
          <BebaText category="h3" style={styles.sectionTitle}>Points for accepted trip requests</BebaText>
          <BebaButton 
            title="Report a problem" 
            style={styles.reportButton}
            onPress={() => {}} 
          />
        </View>
      </ScrollView>
    </View>
  );
};

// Helper Components for the List
const DetailRow = ({ label, value, last }) => (
  <View style={[styles.detailRow, !last && styles.borderBottom]}>
    <BebaText category="body4" color={Palette.gray500}>{label}</BebaText>
    <BebaText category="body2" style={styles.marginTop}>{value}</BebaText>
  </View>
);

const ExpandableRow = ({ label, value, valueColor }) => (
  <View style={[styles.expandableRow, styles.borderBottom]}>
    <BebaText category="body2">{label}</BebaText>
    <View style={styles.row}>
      <BebaText category="body2" color={valueColor} style={styles.marginRight}>{value}</BebaText>
      <ChevronDown size={20} color={Palette.black} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Palette.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.padding,
    paddingTop: Spacing.padding + 20,
    paddingBottom: Spacing.padding,
    backgroundColor: Palette.white,
    borderBottomWidth: 1,
    borderBottomColor: Palette.gray200,
  },
  headerTitle: { alignItems: 'center' },
  mapContainer: { height: 220, width: '100%' },
  map: { ...StyleSheet.absoluteFillObject },
  section: {
    backgroundColor: Palette.white,
    paddingHorizontal: Spacing.padding,
    marginTop: Spacing.padding,
    borderTopWidth: 1,
    borderTopColor: Palette.gray200,
  },
  detailRow: { paddingVertical: Spacing.padding },
  expandableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.padding,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.padding,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  borderBottom: { borderBottomWidth: 1, borderBottomColor: Palette.gray100 },
  marginTop: { marginTop: 4 },
  marginRight: { marginRight: 8 },
  sectionTitle: { marginBottom: Spacing.padding },
  reportButton: {
    backgroundColor: Palette.accent,
    borderRadius: Spacing.borderRadius,
    height: 56,
    marginTop: Spacing.padding,
  },
});

export default TripDetails;