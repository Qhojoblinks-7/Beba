import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Palette, Spacing } from '../constants/theme';

// Beba Components
import BebaText from '../components/atoms/BebaText';
import TripCard from '../components/molecules/TripCard';
import EarningsChart from '../components/organisms/EarningsChart';

/**
 * Mock Data for the Timeline
 * In production, this will come from your Django 'api/trips/history/' endpoint
 */
const MOCK_HISTORY = [
  { id: '1', destination: 'Accra Mall - Food Court', time: '14:20', amount: 'GH₵ 35.00', type: 'Food' },
  { id: '2', destination: 'Oxford Street, Osu', time: '12:15', amount: 'GH₵ 22.50', type: 'Parcel' },
  { id: '3', destination: 'Legon Campus, Gate 2', time: '10:45', amount: 'GH₵ 45.00', type: 'Food' },
  { id: '4', destination: 'Dzorwulu - Sid’s Pharmacy', time: '09:30', amount: 'GH₵ 18.00', type: 'Medical' },
  { id: '5', destination: 'Kaneshie Market', time: 'Yesterday', amount: 'GH₵ 28.00', type: 'Parcel' },
];

const History = ({ navigation }) => {
  
  const renderHeader = () => (
    <View style={styles.header}>
<BebaText category="h1" color={Palette.textPrimary}>Activity</BebaText>
      <BebaText category="body3" color={Palette.textSecondary}>View your completed deliveries</BebaText>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={MOCK_HISTORY}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TripCard 
            destination={item.destination}
            time={item.time}
            amount={item.amount}
            type={item.type}
            onPress={() => {
              // Later, you can navigate to a 'TripDetail' screen 
              // that shows the specific map route for that trip
              console.log(`Reviewing Trip ${item.id}`);
            }}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
<BebaText category="body2" color={Palette.textTertiary}>No trips found yet today.</BebaText>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.white,
  },
  listContent: {
    padding: Spacing.padding,
    paddingBottom: 100, // Space for the TabBar
  },
  header: {
    marginBottom: 24,
    marginTop: 10,
  },
  emptyContainer: {
    marginTop: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default History;