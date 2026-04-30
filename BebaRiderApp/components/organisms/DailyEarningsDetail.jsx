import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ChevronLeft, Car } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BebaText from '../atoms/BebaText';
import EarningsChart from '../organisms/EarningsChart';
import { Palette, Spacing, Typography } from '../../constants/theme';

const DailyEarningsDetail = ({ date = "April 24", totalEarnings = "358.78", tripCount = "10", fees, onBack, navigation }) => {
  const insets = useSafeAreaInsets();

  // 1. DUMMY DATA FOR TRIPS
  const dummyTrips = [
    {
      time: "20:01",
      location: "Ablekuma West, Akoa Ndor Road",
      amount: "22.35"
    },
    {
      time: "19:45",
      location: "Kaale Street, 1, Asafoatse Omani Street",
      amount: "17.15"
    },
    {
      time: "18:20",
      location: "Tudu Road, Accra Central",
      amount: "45.00"
    },
    {
      time: "17:10",
      location: "Dzorwulu, Blohum Street",
      amount: "31.20"
    },
    {
      time: "15:45",
      location: "Makola Market, Kinbu Road",
      amount: "28.50"
    },
    {
      time: "14:30",
      location: "Korle Bu, Guggisberg Avenue",
      amount: "19.00"
    }
  ];

  const rawChartData = [
    { day: '20', label: 'Apr', value: 223.83 },
    { day: '21', label: 'Apr', value: 100.78 },
    { day: '22', label: 'Apr', value: 237.03 },
    { day: '23', label: 'Apr', value: 127.18 },
    { day: '24', label: 'Apr', value: 358.78, active: true },
    { day: '25', label: 'Apr', value: 125.53 },
    { day: '26', label: 'Apr', value: 233.85 },
  ];

  const [chartData, setChartData] = useState(
    rawChartData.map(item => ({ x: item.day, y: item.value }))
  );

  return (
    <View style={[styles.mainWrapper, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <ChevronLeft size={28} color={Palette.black} />
        </TouchableOpacity>
        
        <View style={styles.tabContainer}>
          <View style={styles.activeTab}><BebaText category="body4" style={styles.bold}>Day</BebaText></View>
          <View style={styles.tab}><BebaText category="body4" color={Palette.gray500}>Week</BebaText></View>
          <View style={styles.tab}><BebaText category="body4" color={Palette.gray500}>Month</BebaText></View>
        </View>
        <View style={{ width: 40 }} /> 
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.summarySection}>
          <BebaText style={styles.totalAmount}>GHS {totalEarnings}</BebaText>
          <BebaText category="body3" color={Palette.gray500}>{tripCount} trips</BebaText>
        </View>

        <EarningsChart 
          data={chartData} 
          onBarPress={(item, index) => {
            const updated = rawChartData.map((d, i) => ({
              x: d.day,
              y: d.value,
              active: i === index
            }));
            setChartData(updated);
          }}
        />

        <View style={styles.badgeContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.badgeRow}>
            <View style={styles.badge}><BebaText category="body4">Cash GHS {fees?.cash ?? "447"}</BebaText></View>
            <View style={styles.badge}><BebaText category="body4">Service fees -GHS {fees?.service ?? "65.88"}</BebaText></View>
            <View style={styles.badge}><BebaText category="body4">Partner fees -GHS {fees?.partner ?? "22.35"}</BebaText></View>
          </ScrollView>
        </View>

        <View style={styles.listSection}>
          <BebaText category="h3" style={styles.dateLabel}>{date}</BebaText>
          <View style={styles.divider} />
          
          {/* Rendering the Dummy Trips */}
          {dummyTrips.map((item, index) => (
            <TouchableOpacity key={index} style={styles.tripRow} onPress={() => navigation.navigate('TripDetails')}>
              <View style={styles.iconContainer}>
                <Car size={24} color={Palette.black} />
              </View>

              <View style={styles.tripInfo}>
                <BebaText category="h4" style={styles.tripTime}>
                  {item.time}
                </BebaText>
                <BebaText 
                  category="body4" 
                  color={Palette.gray500} 
                  numberOfLines={2} 
                  style={styles.locationText}
                >
                  {item.location}
                </BebaText>
              </View>

              <View style={styles.amountContainer}>
                <BebaText category="h4" style={styles.tripAmount}>
                  GHS {item.amount}
                </BebaText>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainWrapper: { flex: 1, backgroundColor: Palette.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.padding,
    paddingVertical: Spacing.padding,
    backgroundColor: Palette.white,
    borderBottomWidth: 1,
    borderBottomColor: Palette.gray200,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Palette.gray100,
    borderRadius: Spacing.borderRadius,
    padding: Spacing.row / 2,
    width: '65%',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
  },
  activeTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    backgroundColor: Palette.background,
    borderRadius: 8,
    elevation: 2,
  },
  bold: { fontWeight: '600' },
  summarySection: {
    alignItems: 'center',
    marginTop: Spacing.padding,
  },
  totalAmount: {
    ...Typography.h1,
    fontSize: 40,
    fontWeight: '700',
    color: Palette.textPrimary,
  },
  badgeContainer: {
    marginBottom: Spacing.padding,
  },
  badgeRow: {
    paddingHorizontal: Spacing.padding,
    gap: Spacing.row,
  },
  badge: {
    backgroundColor: Palette.gray100,
    paddingHorizontal: Spacing.padding,
    paddingVertical: Spacing.row / 2,
    borderRadius: 16,
  },
  listSection: {
    marginTop: Spacing.padding,
    paddingHorizontal: Spacing.padding,
    borderTopWidth: 1,
    borderTopColor: Palette.gray100,
    paddingTop: Spacing.padding,
  },
  dateLabel: {
    ...Typography.h3,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: Spacing.padding,
  },
  divider: {
    height: 1,
    backgroundColor: Palette.gray200,
    marginBottom: Spacing.padding,
  },
  tripRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: Spacing.padding,
    borderBottomWidth: 1,
    borderBottomColor: Palette.gray100,
    gap: Spacing.padding,
  },
  iconContainer: {
    width: 32,
    alignItems: 'center',
    paddingTop: 2,
  },
  tripInfo: {
    flex: 1,
    gap: 4,
  },
  tripTime: {
    ...Typography.h4,
    fontSize: 16,
    fontWeight: '600',
  },
  locationText: {
    ...Typography.body4,
    fontSize: 14,
    lineHeight: 18,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  tripAmount: {
    ...Typography.h4,
    fontSize: 16,
    fontWeight: '600',
    color: Palette.textPrimary,
  },
});

export default DailyEarningsDetail;