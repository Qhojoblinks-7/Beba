import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight } from 'lucide-react-native';
import { Palette, Spacing, Typography } from '../constants/theme';

// Beba Components
import BebaText from '../components/atoms/BebaText';
import EarningsChart from '../components/organisms/EarningsChart';
import DailyEarningsDetail from '../components/organisms/DailyEarningsDetail';
const weeklyData = [
  { x: 'Th', y: 127.18, date: 'Thursday, Apr 23' },
  { x: 'Fr', y: 358.78, date: 'Friday, Apr 24' },
  { x: 'Sa', y: 125.53, date: 'Saturday, Apr 25' },
  { x: 'Su', y: 233.85, date: 'Sunday, Apr 26' },
  { x: 'Mo', y: 0, date: 'Monday, Apr 27' },
  { x: 'Tu', y: 0, date: 'Tuesday, Apr 28' },
  { x: 'We', y: 0, date: 'Wednesday, Apr 29' }, // Active/Today
];

/**
 * Mock detailed trip data for each day
 * In production, this would come from the API
 */
const dailyTripData = {
  'Thursday, Apr 23': {
    totalEarnings: 127.18,
    tripCount: 4,
    trips: [
      { time: '08:30', location: 'Accra Mall - Food Court', amount: 25.50 },
      { time: '11:15', location: 'Legon Campus, Gate 2', amount: 32.00 },
      { time: '14:20', location: 'Osu Oxford Street, Shop 4', amount: 18.75 },
      { time: '17:45', location: 'East Legon Hills, House 42', amount: 50.93 },
    ],
    fees: {
      cash: 127.18,
      service: 6.36,
      partner: 0.00,
    },
  },
  'Friday, Apr 24': {
    totalEarnings: 358.78,
    tripCount: 12,
    trips: [
      { time: '07:00', location: 'Dzorwulu - Main Market', amount: 22.00 },
      { time: '08:15', location: 'Airport Residential Area', amount: 45.50 },
      { time: '09:30', location: 'Cantonments Hospital', amount: 28.00 },
      { time: '11:00', location: 'Labone Filling Station', amount: 15.75 },
      { time: '12:30', location: 'Osu Deliveries (x2)', amount: 38.50 },
      { time: '14:00', location: 'East Legon Mall', amount: 52.00 },
      { time: '15:45', location: 'Abelemkpe Market', amount: 19.25 },
      { time: '17:00', location: 'Ridge Hospital Area', amount: 33.00 },
      { time: '18:30', location: 'Café Kwae Late Run', amount: 10.00 },
      { time: '19:15', location: 'North Ridge VIP', amount: 28.50 },
      { time: '20:00', location: 'Airport Roundabout', amount: 25.48 },
      { time: '21:30', location: 'Night Run - Labone', amount: 39.50 },
    ],
    fees: {
      cash: 358.78,
      service: 17.94,
      partner: 5.00,
    },
  },
  'Saturday, Apr 25': {
    totalEarnings: 125.53,
    tripCount: 3,
    trips: [
      { time: '10:00', location: 'Accra Mall Weekend Market', amount: 35.00 },
      { time: '13:30', location: 'Labone Beach Side', amount: 28.50 },
      { time: '16:45', location: 'Osu Weekend Specials', amount: 62.03 },
    ],
    fees: {
      cash: 125.53,
      service: 6.28,
      partner: 2.50,
    },
  },
  'Sunday, Apr 26': {
    totalEarnings: 233.85,
    tripCount: 6,
    trips: [
      { time: '09:00', location: 'Church Service Runs - Cantonments', amount: 32.00 },
      { time: '11:30', location: 'Osu Mall Deliveries', amount: 45.75 },
      { time: '14:00', location: 'East Legon Brunch Run (x2)', amount: 38.00 },
      { time: '16:20', location: 'Abelemkpe Sunday Market', amount: 28.50 },
      { time: '18:00', location: 'Labone Dinner Prep', amount: 42.60 },
      { time: '20:30', location: 'Airport Late Night', amount: 47.00 },
    ],
    fees: {
      cash: 233.85,
      service: 11.69,
      partner: 3.00,
    },
  },
  'Monday, Apr 27': {
    totalEarnings: 0,
    tripCount: 0,
    trips: [],
    fees: {
      cash: 0,
      service: 0,
      partner: 0,
    },
  },
  'Tuesday, Apr 28': {
    totalEarnings: 0,
    tripCount: 0,
    trips: [],
    fees: {
      cash: 0,
      service: 0,
      partner: 0,
    },
  },
  'Wednesday, Apr 29': {
    totalEarnings: 0,
    tripCount: 0,
    trips: [],
    fees: {
      cash: 0,
      service: 0,
      partner: 0,
    },
  },
};

const Earnings = ({ navigation }) => {
  const handleBarPress = (item, index) => {
    const detailData = dailyTripData[item.date];
    if (detailData) {
      navigation.push('DailyEarningsDetail', {
        date: item.date,
        ...detailData,
      });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header Row with Icon */}
      <View style={styles.headerRow}>
        <BebaText category="h1" style={styles.headerTitle}>Money</BebaText>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        nestedScrollEnabled={true}
      >
        {/* 1. Bar Chart Section */}
        <EarningsChart data={weeklyData} onBarPress={handleBarPress} />

        {/* 2. Today's Earnings Row */}
        <TouchableOpacity 
          style={styles.todayRow}
          activeOpacity={0.7}
          onPress={() => {
            const todayData = dailyTripData[weeklyData[6].date];
            if (todayData) {
              navigation.push('DailyEarningsDetail', {
                date: weeklyData[6].date,
                ...todayData,
              });
            }
          }}
        >
          <BebaText category="body1" style={styles.todayLabel}>Today</BebaText>
          <View style={styles.rightContent}>
            <BebaText category="h3" style={styles.bold}>GHS {weeklyData[6].y}</BebaText>
            <ChevronRight size={20} color={Palette.gray400} />
          </View>
        </TouchableOpacity>

        {/* 3. Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <BebaText category="body1" color={Palette.gray600}>Balance</BebaText>
            <BebaText category="h2" style={styles.bold}>GHS 0.88</BebaText>
          </View>

          <View style={styles.partnerSection}>
            <BebaText category="body4" color={Palette.gray500}>Service partner</BebaText>
            <BebaText category="body2" style={styles.partnerName}>
              TOPKLASS 24/7 ENTERPRISE
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
    backgroundColor: Palette.white,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.padding,
    paddingVertical: Spacing.padding,
    backgroundColor: Palette.white,
    borderBottomWidth: 1,
    borderBottomColor: Palette.gray200,
  },
  headerTitle: {
    ...Typography.h1,
    fontSize: 32,
    fontWeight: '800',
  },
  scrollContent: {
    paddingBottom: 40,
    paddingTop: Spacing.row,
  },
  todayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Palette.gray50,
    marginHorizontal: Spacing.padding,
    padding: Spacing.padding,
    borderRadius: Spacing.borderRadius,
    marginTop: Spacing.padding,
  },
  todayLabel: {
    ...Typography.h3,
    color: Palette.textPrimary,
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  balanceCard: {
    backgroundColor: Palette.gray50,
    marginHorizontal: Spacing.padding,
    marginTop: Spacing.padding,
    padding: Spacing.padding,
    borderRadius: Spacing.borderRadius,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.padding * 2,
  },
  partnerSection: {
    marginTop: Spacing.row,
  },
  partnerName: {
    fontWeight: '600',
    marginTop: 2,
    ...Typography.body2,
  },
  bold: {
    fontWeight: '700',
  },
});

export default Earnings;