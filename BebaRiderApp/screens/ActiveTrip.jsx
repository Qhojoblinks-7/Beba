import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Platform,
  Animated,
  ScrollView,
  PanResponder,
} from "react-native";
import {
  Map,
  Phone,
  MessageSquare,
  MapPin,
  User,
  Package,
  Bike,
  CheckCircle,
  Flag,
} from "lucide-react-native";

// Theme & Custom Hooks
import { Palette, Spacing } from "../constants/theme";
import { ORDER_STATUS } from "../constants/orderConstants";
import { BASE_FARE, DISTANCE_RATE } from "../constants/pricing";
import {
  useActiveOrder,
  useStartPickup,
  useCompleteOrder,
  useRequestReturn,
} from "../query/hooks";
import { useLocation } from "../hooks/useLocation";
import { useWaitTimer } from "../hooks/useWaitTimer";

// Components
import BebaText from "../components/atoms/BebaText";
import BebaMapView from "../components/organisms/BebaMapView";
import StatItem from "../components/molecules/StatItem";

const ActiveTrip = ({ route, navigation }) => {
  // TanStack Query
  const { data: activeOrder, isLoading: isLoadingOrder } = useActiveOrder();
  const startPickupMutation = useStartPickup();
  const requestReturnMutation = useRequestReturn();
  const completeOrderMutation = useCompleteOrder();

  // Location hook
  const { location } = useLocation();

  // Derive order details from activeOrder with fallbacks
  const contactName = activeOrder?.customer?.first_name || "Customer";
  const phoneNumber = activeOrder?.customer?.phone_number || "";
  const address =
    activeOrder?.dropoff_address ||
    activeOrder?.delivery_address ||
    "Delivery address";
  const gateCode = activeOrder?.gate_code || "";
  const additionalNote = activeOrder?.notes || "";
  const orderIdDisplay = activeOrder?.id || "#BEBA-000";
  const role = activeOrder?.role || "SENDER";
  const itemCount = activeOrder?.item_count || 0;
  const distanceVal = activeOrder?.distance
    ? parseFloat(activeOrder.distance)
    : 0;
  const distanceText = distanceVal > 0 ? `${distanceVal} mi` : "";
  const etaMinutesVal = activeOrder?.estimated_delivery_time
    ? Number(activeOrder.estimated_delivery_time)
    : 0;
  const etaText = etaMinutesVal > 0 ? `${etaMinutesVal} min` : "";
  const category = activeOrder?.category?.toUpperCase() || "PARCEL";
  const stopText = "1/1"; // Default for single-stop delivery

  // Determine trip started from order status
  const tripStarted = activeOrder?.status === ORDER_STATUS.IN_TRANSIT;

  // Use wait timer hook with category and arrival status
  const { formatTime, waitFee, canReturn } = useWaitTimer(
    category,
    tripStarted,
  );

  // Compute earnings breakdown
  const distanceFare =
    activeOrder && distanceVal > 0 ? distanceVal * DISTANCE_RATE : 0;
  const totalEstimated = (BASE_FARE + distanceFare + waitFee).toFixed(2);

  const handleCall = () => Linking.openURL(`tel:${phoneNumber}`);

  const handleNavigate = () => {
    const lat = MOCK_REGION.latitude;
    const lng = MOCK_REGION.longitude;
    const url =
      Platform.OS === "ios"
        ? `maps:0,0?q=${address}`
        : `google.navigation:q=${lat},${lng}`;
    Linking.openURL(url).catch(() => {
      Linking.openURL(
        `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
      );
    });
  };

  const handleStartTrip = async () => {
    if (!activeOrder?.id || !location) return;
    try {
      await startPickupMutation.mutateAsync({
        orderId: activeOrder.id,
        latitude: location.latitude,
        longitude: location.longitude,
      });
    } catch (error) {
      console.error("Failed to start trip:", error);
    }
  };

  const handleArrive = () => {
    // This just sets local UI state - arrived status
    // The actual IN_TRANSIT status comes from useActiveOrder query
    // We could add a local state for UI purposes
  };

  const handleCompleteDelivery = () => {
    if (activeOrder?.id) {
      navigation.navigate("QRScanner", { orderId: activeOrder.id });
    }
  };

  const handleReturnItem = async () => {
    if (!activeOrder?.id) return;
    try {
      await requestReturnMutation.mutateAsync(activeOrder.id);
    } catch (error) {
      console.error("Return item failed:", error);
    }
  };

  const [isArrived, setIsArrived] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const sheetAnim = useRef(new Animated.Value(0)).current;
  const dragY = useRef(0);

  const expandSheet = () => {
    setIsExpanded(true);
    Animated.spring(sheetAnim, {
      toValue: 1,
      useNativeDriver: false,
      tension: 60,
      friction: 10,
    }).start();
  };

  const collapseSheet = () => {
    setIsExpanded(false);
    Animated.spring(sheetAnim, {
      toValue: 0,
      useNativeDriver: false,
      tension: 60,
      friction: 10,
    }).start();
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dy) > 5 && gestureState.moveY < 80;
      },
      onPanResponderMove: (evt, gestureState) => {
        dragY.current = gestureState.dy;
      },
      onPanResponderRelease: (evt, gestureState) => {
        const dragThreshold = 80;
        if (gestureState.dy < -dragThreshold) {
          expandSheet();
        } else if (gestureState.dy > dragThreshold) {
          collapseSheet();
        } else {
          Animated.spring(sheetAnim, {
            toValue: isExpanded ? 1 : 0,
            useNativeDriver: false,
            tension: 60,
            friction: 10,
          }).start();
        }
        dragY.current = 0;
      },
    }),
  ).current;

  const sheetHeight = sheetAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["42%", "88%"],
  });

  return (
    <View style={styles.container}>
      <BebaMapView region={MOCK_REGION} />

      <Animated.View style={[styles.bottomSheet, { height: sheetHeight }]}>
        <View {...panResponder.panHandlers} style={styles.dragHandleContainer}>
          <View style={styles.dragHandle} />
        </View>

        <ScrollView
          style={styles.sheetContent}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.sheetInner}
          scrollEnabled={isExpanded}
          nestedScrollEnabled={false}
        >
          <View style={styles.headerSection}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <User size={28} color={Palette.gray400} />
                <View
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor: tripStarted
                        ? Palette.success
                        : Palette.accent,
                    },
                  ]}
                />
              </View>
            </View>

            <View style={styles.headerInfo}>
              <BebaText
                category="h2"
                color={Palette.textPrimary}
                style={styles.bold}
              >
                {contactName}
              </BebaText>
              <View style={styles.headerMeta}>
                <View style={styles.roleBadge}>
                  <BebaText
                    category="body3"
                    color={Palette.primary}
                    style={styles.bold}
                  >
                    {role.toUpperCase()}
                  </BebaText>
                </View>
                <BebaText category="body2" color={Palette.gray500}>
                  {orderIdDisplay}
                </BebaText>
              </View>
            </View>

            <TouchableOpacity
              style={styles.callBtn}
              onPress={handleCall}
              activeOpacity={0.8}
            >
              <Phone size={22} color={Palette.primary} />
            </TouchableOpacity>
          </View>

          {/* Stats Bar with slot-based equal spacing */}
          <View style={styles.statsBar}>
            <View style={styles.statSlot}>
              <StatItem label="Stop" value={stopText} highlight />
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statSlot}>
              <StatItem label="ETA" value={etaText} />
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statSlot}>
              <StatItem label="Distance" value={distanceText} />
            </View>
          </View>

          <View style={styles.actionsSection}>
            <TouchableOpacity
              style={styles.navButton}
              activeOpacity={0.8}
              onPress={handleNavigate}
            >
              <Map size={35} color={Palette.background} />
            </TouchableOpacity>

            <View style={styles.contactButtons}>
              <TouchableOpacity
                style={styles.contactBtn}
                activeOpacity={0.8}
                onPress={handleCall}
              >
                <Phone size={22} color={Palette.primary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.contactBtn} activeOpacity={0.8}>
                <MessageSquare size={22} color={Palette.primary} />
              </TouchableOpacity>
            </View>

            {!tripStarted && activeOrder?.status === ORDER_STATUS.PICKED_UP ? (
              <TouchableOpacity
                style={styles.startButton}
                activeOpacity={0.8}
                onPress={handleStartTrip}
                disabled={startPickupMutation.isPending}
              >
                <Bike size={35} color={Palette.background} />
              </TouchableOpacity>
            ) : tripStarted && !isArrived ? (
              <TouchableOpacity
                style={styles.arriveButton}
                activeOpacity={0.8}
                onPress={handleArrive}
              >
                <Flag size={35} color={Palette.background} />
              </TouchableOpacity>
            ) : (
              <View style={styles.activeStatus}>
                <View style={styles.activeDot} />
              </View>
            )}
          </View>

          <View style={styles.card}>
            <BebaText
              category="body3"
              color={Palette.gray400}
              style={styles.cardLabel}
            >
              DELIVER TO
            </BebaText>
            <BebaText
              category="body2"
              color={Palette.textPrimary}
              style={[styles.bold, styles.addressText]}
              numberOfLines={isExpanded ? undefined : 2}
            >
              {address}
            </BebaText>
            {gateCode && (
              <View style={styles.gateBadge}>
                <BebaText
                  category="body3"
                  color={Palette.accent}
                  style={styles.bold}
                >
                  GATE CODE: {gateCode}
                </BebaText>
              </View>
            )}
          </View>

          {(itemCount > 0 || additionalNote) && (
            <View style={styles.card}>
              <BebaText
                category="body3"
                color={Palette.gray400}
                style={styles.cardLabel}
              >
                DELIVERY DETAILS
              </BebaText>

              {itemCount > 0 && (
                <View style={styles.itemsRow}>
                  <View style={styles.itemIcon}>
                    <Package size={18} color={Palette.primary} />
                  </View>
                  <View>
                    <BebaText
                      category="body2"
                      color={Palette.textPrimary}
                      style={styles.bold}
                    >
                      {itemCount} item{itemCount > 1 ? "s" : ""}
                    </BebaText>
                    <BebaText category="body3" color={Palette.gray500}>
                      Verify before delivery
                    </BebaText>
                  </View>
                </View>
              )}

              {additionalNote && (
                <View style={styles.noteBox}>
                  <BebaText
                    category="body3"
                    color={Palette.gray400}
                    style={styles.bold}
                  >
                    CUSTOMER NOTE
                  </BebaText>
                  <BebaText
                    category="body2"
                    color={Palette.textPrimary}
                    style={styles.noteText}
                  >
                    {additionalNote}
                  </BebaText>
                </View>
              )}
            </View>
          )}

          <View style={[styles.card, styles.earningsCard]}>
            <View>
              <BebaText category="body3" color={Palette.gray400}>
                ESTIMATED PAYOUT
              </BebaText>
              <BebaText
                category="h2"
                color={Palette.primary}
                style={styles.bold}
              >
                GH₵ {totalEstimated}
              </BebaText>
            </View>
            {tripStarted && (
              <View style={styles.waitFee}>
                <BebaText category="body3" color={Palette.accent}>
                  WAIT FEE
                </BebaText>
                <BebaText
                  category="h3"
                  color={Palette.accent}
                  style={styles.bold}
                >
                  GH₵ {waitFee}
                </BebaText>
                <BebaText category="body3" color={Palette.gray500}>
                  {formatTime}
                </BebaText>
              </View>
            )}
          </View>

          {tripStarted && (
            <TouchableOpacity
              style={styles.completeButton}
              activeOpacity={0.8}
              onPress={handleCompleteDelivery}
            >
              <CheckCircle size={32} color={Palette.background} />
            </TouchableOpacity>
          )}

          {tripStarted && canReturn && (
            <TouchableOpacity
              style={styles.returnButton}
              activeOpacity={0.8}
              onPress={handleReturnItem}
              disabled={requestReturnMutation.isPending}
            >
              <BebaText category="h4" color={Palette.white}>
                Return Item
              </BebaText>
            </TouchableOpacity>
          )}

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Palette.background },
  bottomSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Palette.surface,
    borderTopLeftRadius: Spacing.borderRadius + 8,
    borderTopRightRadius: Spacing.borderRadius + 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 25,
    paddingHorizontal: Spacing.padding,
  },
  dragHandleContainer: {
    width: "100%",
    alignItems: "center",
    paddingVertical: Spacing.padding / 2,
  },
  dragHandle: {
    width: 36,
    height: 4,
    backgroundColor: Palette.gray200,
    borderRadius: 2,
  },
  sheetContent: {
    flex: 1,
  },
  sheetInner: {
    paddingTop: 4,
    paddingBottom: Spacing.padding,
  },

  /* Header Section */
  headerSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.row,
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Palette.gray100,
    justifyContent: "center",
    alignItems: "center",
  },
  avatar: { position: "relative" },
  statusDot: {
    position: "absolute",
    bottom: 2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 3,
    borderColor: Palette.background,
  },
  headerInfo: { flex: 1, marginLeft: Spacing.padding },
  headerMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 8,
  },
  roleBadge: {
    backgroundColor: Palette.primary + "20",
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 12,
  },
  callBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Palette.gray50,
    justifyContent: "center",
    alignItems: "center",
  },

  /* Stats Bar */
  statsBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Palette.gray50,
    borderRadius: Spacing.borderRadius,
    marginBottom: Spacing.row,
    paddingVertical: 12,
  },
  statSlot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: Palette.gray300,
  },

  /* Actions Section */
  actionsSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.padding,
    marginBottom: Spacing.padding,
  },
  navButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Palette.secondary,
    justifyContent: "center",
    alignItems: "center",
  },
  contactButtons: {
    flexDirection: "row",
    gap: 12,
  },
  contactBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Palette.gray50,
    justifyContent: "center",
    alignItems: "center",
  },
  startButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Palette.danger,
    justifyContent: "center",
    alignItems: "center",
  },
  arriveButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Palette.secondary,
    justifyContent: "center",
    alignItems: "center",
  },
  activeStatus: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Palette.success + "20",
    justifyContent: "center",
    alignItems: "center",
  },
  activeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Palette.success,
  },

  /* Cards */
  card: {
    backgroundColor: Palette.surface,
    borderRadius: Spacing.borderRadius,
    padding: Spacing.padding,
    marginBottom: Spacing.row,
  },
  cardLabel: { marginBottom: Spacing.padding / 2 },
  addressText: { lineHeight: 22 },
  gateBadge: {
    marginTop: Spacing.padding,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: Palette.accent + "20",
    borderRadius: 12,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: Palette.accent + "40",
  },

  /* Items Row */
  itemsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginTop: Spacing.padding,
    marginBottom: Spacing.row,
  },
  itemIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Palette.primary + "15",
    justifyContent: "center",
    alignItems: "center",
  },

  /* Note Box */
  noteBox: {
    marginTop: Spacing.padding,
    padding: Spacing.padding,
    backgroundColor: Palette.gray100,
    borderRadius: Spacing.borderRadius,
    borderLeftWidth: 4,
    borderLeftColor: Palette.primary,
  },
  noteText: { marginTop: 4, lineHeight: 20 },

  /* Earnings Card */
  earningsCard: {
    backgroundColor: Palette.secondary,
    borderRadius: Spacing.borderRadius,
    padding: Spacing.padding,
    marginBottom: Spacing.row,
  },
  waitFee: {
    alignItems: "flex-end",
  },

  /* Complete Button */
  completeButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Palette.success,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    shadowColor: Palette.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  returnButton: {
    backgroundColor: Palette.danger,
    paddingVertical: 14,
    borderRadius: Spacing.borderRadius,
    alignItems: "center",
    marginTop: Spacing.row,
    marginBottom: Spacing.padding,
  },

  bottomSpacer: { height: Spacing.row },
  bold: { fontWeight: "700" },
});

const MOCK_REGION = {
  latitude: 5.558,
  longitude: -0.202,
  latitudeDelta: 0.002,
  longitudeDelta: 0.002,
};

export default ActiveTrip;
