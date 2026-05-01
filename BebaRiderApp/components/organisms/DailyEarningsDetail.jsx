import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { ChevronLeft, Car } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BebaText from "../atoms/BebaText";
import EarningsChart from "../organisms/EarningsChart";
import { Palette } from "../../constants/theme";
import { useTripHistory } from "../../query/hooks";

const DailyEarningsDetail = ({
  date = "April 24",
  totalEarnings = "358.78",
  tripCount = "10",
  fees,
  onBack,
  navigation,
}) => {
  const insets = useSafeAreaInsets();

  // Convert human-readable date (e.g. "Friday, Apr 24" or "Apr 24") to YYYY-MM-DD for API
  const parseDateToISO = (dateStr) => {
    const monthMap = {
      jan: '01', january: '01',
      feb: '02', february: '02',
      mar: '03', march: '03',
      apr: '04', april: '04',
      may: '05',
      jun: '06', june: '06',
      jul: '07', july: '07',
      aug: '08', august: '08',
      sep: '09', september: '09',
      oct: '10', october: '10',
      nov: '11', november: '11',
      dec: '12', december: '12',
    };
    // Remove comma and split
    const parts = dateStr.toLowerCase().replace(',', '').split(' ').filter(p => p);
    if (parts.length < 2) return new Date().toISOString().split('T')[0];

    let monthIdx = 0;
    for (let i = 0; i < parts.length; i++) {
      const key = parts[i].substring(0, 3);
      if (monthMap[key]) {
        monthIdx = i;
        break;
      }
    }
    const month = monthMap[parts[monthIdx]?.substring(0, 3)];
    const dayRaw = parts[monthIdx + 1];
    const day = dayRaw ? dayRaw.padStart(2, '0') : null;

    if (month && day) {
      const year = new Date().getFullYear();
      return `${year}-${month}-${day}`;
    }
    return new Date().toISOString().split('T')[0];
  };

  const dateISO = parseDateToISO(date);

  // Fetch real trip history from backend
  const { data: tripHistory = [], isLoading } = useTripHistory(dateISO);

  // Derive totals from actual trip data
  const [computedEarnings, setComputedEarnings] = useState(parseFloat(totalEarnings) || 0);
  const [computedTripCount, setComputedTripCount] = useState(parseInt(tripCount, 10) || 0);

  useEffect(() => {
    if (!isLoading && tripHistory.length > 0) {
      const total = tripHistory.reduce((sum, item) => {
        const val = typeof item.amount === 'string' ? parseFloat(item.amount) : (item.amount || 0);
        return sum + (isNaN(val) ? 0 : val);
      }, 0);
      setComputedEarnings(total);
      setComputedTripCount(tripHistory.length);
    }
  }, [isLoading, tripHistory]);

  const rawChartData = [
    { day: "20", label: "Apr", value: 223.83 },
    { day: "21", label: "Apr", value: 100.78 },
    { day: "22", label: "Apr", value: 237.03 },
    { day: "23", label: "Apr", value: 127.18 },
    { day: "24", label: "Apr", value: 358.78, active: true },
    { day: "25", label: "Apr", value: 125.53 },
    { day: "26", label: "Apr", value: 233.85 },
  ];

  const [chartData, setChartData] = useState(
    rawChartData.map((item) => ({ x: item.day, y: item.value })),
  );

  return (
    <View style={[styles.mainWrapper, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <ChevronLeft size={28} color={Palette.black} />
        </TouchableOpacity>

        <View style={styles.tabContainer}>
          <View style={styles.activeTab}>
            <BebaText category="body4" style={styles.bold}>
              Day
            </BebaText>
          </View>
          <View style={styles.tab}>
            <BebaText category="body4" color={Palette.gray500}>
              Week
            </BebaText>
          </View>
          <View style={styles.tab}>
            <BebaText category="body4" color={Palette.gray500}>
              Month
            </BebaText>
          </View>
        </View>
        <View style={{ width: 40 }} />
      </View>

       <ScrollView showsVerticalScrollIndicator={false}>
         <View style={styles.summarySection}>
           <BebaText style={styles.totalAmount}>
             GHS {computedEarnings.toFixed(2)}
           </BebaText>
           <BebaText category="body3" color={Palette.gray500}>
             {computedTripCount} trips
           </BebaText>
         </View>

        <View style={styles.chartContainer}>
          <EarningsChart
            data={chartData}
            onBarPress={(item, index) => {
              const updated = rawChartData.map((d, i) => ({
                x: d.day,
                y: d.value,
                active: i === index,
              }));
              setChartData(updated);
            }}
          />
        </View>

        <View style={styles.badgeContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.badgeRow}
          >
            <View style={styles.badge}>
              <BebaText category="body4">
                Cash GHS {fees?.cash ?? "447"}
              </BebaText>
            </View>
            <View style={styles.badge}>
              <BebaText category="body4">
                Service fees -GHS {fees?.service ?? "65.88"}
              </BebaText>
            </View>
            <View style={styles.badge}>
              <BebaText category="body4">
                Partner fees -GHS {fees?.partner ?? "22.35"}
              </BebaText>
            </View>
          </ScrollView>
        </View>

         <View style={styles.listSection}>
           <BebaText category="h3" style={styles.dateLabel}>
             {date}
           </BebaText>
           <View style={styles.divider} />

           {/* Rendering Trip History from API */}
           {isLoading ? (
             <View style={styles.centerPadding}>
               {/* You can add a loader here if needed */}
               <BebaText color={Palette.gray500}>Loading trips...</BebaText>
             </View>
           ) : tripHistory.length === 0 ? (
             <View style={styles.centerPadding}>
               <BebaText color={Palette.gray500}>No trips found for this day.</BebaText>
             </View>
           ) : (
             tripHistory.map((item, index) => (
               <TouchableOpacity
                 key={index}
                 style={styles.tripRow}
                 onPress={() => navigation.navigate("TripDetails")}
               >
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
                     GHS {typeof item.amount === 'number' ? item.amount.toFixed(2) : item.amount}
                   </BebaText>
                 </View>
               </TouchableOpacity>
             ))
           )}
         </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainWrapper: { flex: 1, backgroundColor: Palette.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#F2F2F2",
    borderRadius: 12,
    padding: 3,
    width: "65%",
  },
  tab: { flex: 1, alignItems: "center", paddingVertical: 6 },
  activeTab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 6,
    backgroundColor: Palette.background,
    borderRadius: 9,
    elevation: 2,
  },
  bold: { fontWeight: "600" },
  summarySection: { alignItems: "center", marginTop: 20 },
  totalAmount: { fontSize: 40, fontWeight: "700" },
  chartContainer: { marginVertical: 25 },
  badgeContainer: { marginBottom: 20 },
  badgeRow: { paddingHorizontal: 16, gap: 8 },
  badge: {
    backgroundColor: "#F2F2F2",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  listSection: {
    marginTop: 10,
    paddingHorizontal: 16,
    borderTopWidth: 8,
    borderTopColor: "#F9F9F9",
    paddingTop: 20,
  },
  dateLabel: { fontSize: 18, fontWeight: "700", marginBottom: 15 },
  divider: { height: 1, backgroundColor: "#EEEEEE", marginBottom: 10 },
  tripRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
    gap: 12,
  },
  iconContainer: {
    width: 32,
    alignItems: "center",
    paddingTop: 2,
  },
  tripInfo: {
    flex: 1,
    gap: 4,
  },
  tripTime: {
    fontSize: 16,
    fontWeight: "600",
  },
  locationText: {
    fontSize: 14,
    lineHeight: 18,
  },
  amountContainer: {
    alignItems: "flex-end",
  },
  tripAmount: {
    fontSize: 16,
    fontWeight: "600",
  },
  centerPadding: { padding: 20, alignItems: "center", justifyContent: "center" },
});

export default DailyEarningsDetail;
