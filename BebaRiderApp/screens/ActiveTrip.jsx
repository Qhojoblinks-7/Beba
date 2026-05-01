import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Platform,
  Animated,
  ScrollView,
  PanResponder,
  Alert,
} from "react-native";
import * as Haptics from "expo-haptics";
import {
  Phone,
  MessageSquare,
  User,
  Package,
  Bike,
  CheckCircle,
  Flag,
  AlertTriangle,
  Star,
  ChevronDown,
  ChevronUp,
  Shield,
  Map,
} from "lucide-react-native";
import { useFocusEffect } from "@react-navigation/native";

// Theme & Custom Hooks
import { Palette, Spacing } from "../constants/theme";
import { ORDER_STATUS } from "../constants/orderConstants";
import { BASE_FARE, DISTANCE_RATE } from "../constants/pricing";
import {
  useActiveOrder,
  useStartPickup,
  useCompleteOrder,
  useRequestReturn,
  useArriveAtPickup,
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
  const arriveAtPickupMutation = useArriveAtPickup();

  // Location hook
  const { location, startLocationTracking, stopLocationTracking } = useLocation();

  // Start location tracking while this screen is focused
  useFocusEffect(
    useCallback(() => {
      startLocationTracking();
      return () => stopLocationTracking();
    }, [])
  );

  // UI State
  const [isArrived, setIsArrived] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showOrderSummary, setShowOrderSummary] = useState(false);
  const [showSOS, setShowSOS] = useState(false);
  const [sosReason, setSosReason] = useState("");

  // Animation refs
  const swipeAnim = useRef(new Animated.Value(0)).current;
  const sheetAnim = useRef(new Animated.Value(0)).current;
  const dragY = useRef(0);

  // Derive order details
  const contactName = activeOrder?.customer?.first_name || "Customer";
  const phoneNumber = activeOrder?.customer?.phone_number || "";
  const customerRating = activeOrder?.customer?.rating || 4.5;
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

  // Trip phase based on status
  const getTripPhase = () => {
    if (!activeOrder) return "pending";
    const status = activeOrder.status;
    if (status === ORDER_STATUS.PICKED_UP) return "pickup";
    if (status === ORDER_STATUS.IN_TRANSIT) return "transit";
    if (status === ORDER_STATUS.DELIVERED) return "completed";
    return "pending";
  };
  const tripPhase = getTripPhase();
  const tripStarted = tripPhase === "transit";

  // Wait timer (only when arrived at pickup during transit phase)
  const { formatTime, waitFee, canReturn } = useWaitTimer(
    category,
    tripPhase === "transit" && isArrived,
  );

   // Compute earnings
   const distanceFare =
     activeOrder && distanceVal > 0 ? distanceVal * DISTANCE_RATE : 0;
   const totalEstimated = (BASE_FARE + distanceFare + waitFee).toFixed(2);

   // Mutable refs for latest state values (avoid stale closures in PanResponder)
   const isArrivedRef = useRef(isArrived);
   const tripPhaseRef = useRef(tripPhase);
   const activeOrderRef = useRef(activeOrder);
   const locationRef = useRef(location);

   // Keep refs in sync on every render
   useEffect(() => {
     isArrivedRef.current = isArrived;
   }, [isArrived]);

   useEffect(() => {
     tripPhaseRef.current = tripPhase;
   }, [tripPhase]);

   useEffect(() => {
     activeOrderRef.current = activeOrder;
   }, [activeOrder]);

   useEffect(() => {
     locationRef.current = location;
   }, [location]);

   // --- Handlers ---

  const handleCall = () => {
    if (phoneNumber) Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleMessage = () => {
    if (phoneNumber) Linking.openURL(`sms:${phoneNumber}`);
  };

  const handleNavigate = () => {
    let lat, lng;
    if (tripPhase === "pickup") {
      lat = activeOrder?.pickup_latitude;
      lng = activeOrder?.pickup_longitude;
    } else {
      lat = activeOrder?.dropoff_latitude;
      lng = activeOrder?.dropoff_longitude;
    }
    const destLat = lat ? parseFloat(lat) : MOCK_REGION.latitude;
    const destLng = lng ? parseFloat(lng) : MOCK_REGION.longitude;

    const url =
      Platform.OS === "ios"
        ? `maps:0,0?q=${destLat},${destLng}`
        : `google.navigation:q=${destLat},${destLng}`;
    Linking.openURL(url).catch(() => {
      Linking.openURL(
        `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}`,
      );
    });
  };

   const handleStartTrip = async () => {
     const currentOrder = activeOrderRef.current;
     const currentLocation = locationRef.current;
     if (!currentOrder?.id || !currentLocation) return;
     try {
       await startPickupMutation.mutateAsync({
         orderId: currentOrder.id,
         latitude: currentLocation.latitude,
         longitude: currentLocation.longitude,
       });
       Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
     } catch (error) {
       console.error("Failed to start trip:", error);
     }
   };

   const handleArrive = async () => {
     const currentOrder = activeOrderRef.current;
     const currentLocation = locationRef.current;
     if (!currentOrder?.id || !currentLocation) return;
     try {
       await arriveAtPickupMutation.mutateAsync({
         orderId: currentOrder.id,
         latitude: currentLocation.latitude,
         longitude: currentLocation.longitude,
       });
       setIsArrived(true);
       Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
     } catch (error) {
       console.error("Failed to mark arrival:", error);
       Alert.alert("Error", "Failed to mark arrival at pickup. Please try again.");
     }
   };

   const handleCompleteDelivery = async () => {
     const currentOrder = activeOrderRef.current;
     if (!currentOrder?.id) return;
     try {
       await completeOrderMutation.mutateAsync(currentOrder.id);
       Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
       navigation.navigate("Orders");
     } catch (error) {
       console.error("Failed to complete delivery:", error);
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

  const handleQuickResponse = (message) => {
    const smsUrl = `sms:${phoneNumber}?body=${encodeURIComponent(message)}`;
    Linking.openURL(smsUrl);
  };

  const handleSOS = (reason) => {
    setSosReason(reason);
    // TODO: POST to backend support endpoint
    console.log("SOS reported:", reason);
    Alert.alert(
      "Issue Reported",
      "Your support request has been sent. A team member will contact you shortly.",
      [{ text: "OK", onPress: () => setShowSOS(false) }]
    );
    setShowSOS(false);
  };

  // Sheet expand/collapse
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

   // Swipe-to-confirm pan responder
   const swipeAnimValue = useRef(new Animated.Value(0)).current;
   const [swipeActive, setSwipeActive] = useState(false);

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
     })
   ).current;

    // Swipe-to-confirm for primary action — reads from refs to avoid stale state
    const swipePanResponder = useRef(
     PanResponder.create({
       onMoveShouldSetPanResponder: (_, gestureState) => {
         return gestureState.dx > 5 && Math.abs(gestureState.dy) < 5;
       },
       onPanResponderMove: (_, gestureState) => {
         const maxSwipe = 200;
         const progress = Math.min(gestureState.dx / maxSwipe, 1);
         swipeAnimValue.setValue(progress);
       },
       onPanResponderRelease: (_, gestureState) => {
         const maxSwipe = 200;
         const progress = gestureState.dx / maxSwipe;
         if (progress > 0.8) {
           Animated.spring(swipeAnimValue, {
             toValue: 1,
             useNativeDriver: false,
             tension: 200,
             friction: 5,
           }).start(() => {
             const currentPhase = tripPhaseRef.current;
             const currentArrived = isArrivedRef.current;

             if (currentPhase === "pickup") {
               if (!currentArrived) {
                 handleArrive();
               } else {
                 handleStartTrip();
               }
             } else if (currentPhase === "transit") {
               handleCompleteDelivery();
             }
             swipeAnimValue.setValue(0);
             setSwipeActive(false);
             Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
           });
         } else {
           Animated.spring(swipeAnimValue, {
             toValue: 0,
             useNativeDriver: false,
             tension: 200,
             friction: 5,
           }).start();
           setSwipeActive(false);
         }
       },
     })
   ).current;




  const sheetHeight = sheetAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["42%", "88%"],
  });

  const swipeTranslateX = swipeAnimValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 200],
  });

  const swipeThumbColor = swipeAnimValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [Palette.gray300, Palette.gray400, Palette.success],
  });

  // Render progress bar (3 steps)
  const renderProgressBar = () => {
    const steps = [
      { key: "accepted", label: "Accepted", icon: "✓" },
      { key: "pickup", label: "Picked Up", icon: "📦" },
      { key: "delivered", label: "Delivered", icon: "✓" },
    ];

    const phaseIndex = ["pickup", "transit", "completed"].indexOf(tripPhase);

    return (
      <View style={styles.progressContainer}>
        {steps.map((step, index) => (
          <React.Fragment key={step.key}>
            <View style={styles.progressStep}>
              <View
                style={[
                  styles.progressDot,
                  index <= phaseIndex
                    ? { backgroundColor: Palette.primary }
                    : { backgroundColor: Palette.gray300 },
                ]}
              />
              <BebaText
                category="body4"
                color={index <= phaseIndex ? Palette.textPrimary : Palette.gray400}
                style={styles.progressLabel}
              >
                {step.label}
              </BebaText>
            </View>
            {index < steps.length - 1 && (
              <View
                style={[
                  styles.progressLine,
                  index < phaseIndex
                    ? { backgroundColor: Palette.primary }
                    : { backgroundColor: Palette.gray200 },
                ]}
              />
            )}
          </React.Fragment>
        ))}
      </View>
    );
  };

  // Render quick responses
  const quickResponses = [
    "I'm outside",
    "I've arrived",
    "Running late",
    "Call me",
    "Unable to deliver",
  ];

  const renderQuickResponses = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.quickResponsesRow}
    >
      {quickResponses.map((msg, idx) => (
        <TouchableOpacity
          key={idx}
          style={styles.quickResponseBtn}
          onPress={() => handleQuickResponse(msg)}
        >
          <BebaText category="body4" color={Palette.primary}>
            {msg}
          </BebaText>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  // Render SOS modal
  const renderSOSModal = () => {
    if (!showSOS) return null;
    return (
      <View style={styles.sosOverlay}>
        <View style={styles.sosModal}>
          <View style={[styles.sosIconContainer, { backgroundColor: Palette.danger + "20" }]}>
            <AlertTriangle size={32} color={Palette.danger} />
          </View>
          <BebaText category="h3" style={styles.sosTitle}>
            Report an Issue
          </BebaText>
          <BebaText category="body2" color={Palette.textSecondary} style={styles.sosSubtitle}>
            Select a reason for your support request
          </BebaText>

          {[
            "Accident / Injury",
            "Bike Breakdown",
            "Safety Concern",
            "Customer Issue",
            "Other",
          ].map((reason) => (
            <TouchableOpacity
              key={reason}
              style={styles.sosOption}
              onPress={() => handleSOS(reason)}
            >
              <BebaText category="body2" color={Palette.textPrimary}>
                {reason}
              </BebaText>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={[styles.sosCancelBtn, { borderColor: Palette.border }]}
            onPress={() => setShowSOS(false)}
          >
            <BebaText category="body2" color={Palette.textSecondary}>
              Cancel
            </BebaText>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // --- Derived ---
  const isActive = tripPhase !== "completed";
  const phaseLabel =
    tripPhase === "pickup"
      ? "Arriving at Pickup"
      : tripPhase === "transit"
      ? "On the Way to Drop-off"
      : "Delivery Complete";

  const primaryActionText =
    tripPhase === "pickup"
      ? isArrived
        ? "SWIPE TO START DELIVERY"
        : "SWIPE TO ARRIVE AT PICKUP"
      : tripPhase === "transit"
      ? "SWIPE TO COMPLETE DELIVERY"
      : "COMPLETED";

  const primaryActionIcon =
    tripPhase === "pickup" && !isArrived ? (
      <Bike size={28} color={Palette.background} />
    ) : tripPhase === "pickup" && isArrived ? (
      <Package size={28} color={Palette.background} />
    ) : tripPhase === "transit" ? (
      <CheckCircle size={28} color={Palette.background} />
    ) : null;

  // Render stats bar
  const renderStatsBar = () => (
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
  );

  // Render order summary
  const renderOrderSummary = () => (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.orderSummaryHeader}
        onPress={() => setShowOrderSummary(!showOrderSummary)}
      >
        <View style={styles.orderSummaryLeft}>
          <Package size={18} color={Palette.primary} />
          <BebaText category="body2" color={Palette.textPrimary} style={styles.orderSummaryTitle}>
            {itemCount > 0 ? `${itemCount} item${itemCount > 1 ? "s" : ""}` : "Order"} • {category}
          </BebaText>
        </View>
        {showOrderSummary ? <ChevronUp size={20} color={Palette.textSecondary} /> : <ChevronDown size={20} color={Palette.textSecondary} />}
      </TouchableOpacity>

      {showOrderSummary && (
        <View style={styles.orderSummaryContent}>
          {/* Mock items - replace with actual order_items from backend if available */}
          {[
            { name: "Food Pack (3 items)", qty: 1 },
            { name: "Special Instructions", qty: null },
          ].map((item, idx) => (
            <View key={idx} style={styles.orderItemRow}>
              <BebaText category="body2" color={Palette.textPrimary}>
                {item.name}
              </BebaText>
              {item.qty && (
                <BebaText category="body3" color={Palette.textSecondary}>
                  x{item.qty}
                </BebaText>
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <BebaMapView region={MOCK_REGION} />

      {/* SOS Overlay */}
      {renderSOSModal()}

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
          {/* Header Section with Progress */}
          <View style={styles.headerSection}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <User size={28} color={Palette.gray400} />
                <View
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor: tripPhase === "completed" ? Palette.success : Palette.accent,
                    },
                  ]}
                />
              </View>
              <View style={styles.ratingBadge}>
                <Star size={12} color={Palette.accent} fill={Palette.accent} />
                <BebaText category="caption" color={Palette.textPrimary}>
                  {customerRating.toFixed(1)}
                </BebaText>
              </View>
            </View>

            <View style={styles.headerInfo}>
              <BebaText category="h2" color={Palette.textPrimary} style={styles.bold}>
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
                <View style={styles.orderIdPill}>
                  <BebaText category="body3" color={Palette.white}>
                    #{orderIdDisplay}
                  </BebaText>
                </View>
              </View>
              <BebaText category="body3" color={Palette.textSecondary} style={{ marginTop: 4 }}>
                {phaseLabel}
              </BebaText>
            </View>

            <TouchableOpacity
              style={styles.callBtn}
              onPress={handleCall}
              activeOpacity={0.8}
            >
              <Phone size={22} color={Palette.primary} />
            </TouchableOpacity>
          </View>

          {/* Progress Indicator */}
          {renderProgressBar()}

          {/* Delivery Details Card */}
          <View style={styles.card}>
            <BebaText
              category="body3"
              color={Palette.textTertiary}
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
                <BebaText category="body3" color={Palette.accent} style={styles.bold}>
                  GATE CODE: {gateCode}
                </BebaText>
              </View>
            )}
          </View>

          {/* Order Summary (collapsible) */}
          {renderOrderSummary()}

          {/* Special Instructions */}
          {additionalNote && (
            <View style={styles.card}>
              <BebaText category="body3" color={Palette.textTertiary} style={styles.cardLabel}>
                CUSTOMER NOTE
              </BebaText>
              <View style={styles.noteBox}>
                <BebaText
                  category="body2"
                  color={Palette.textPrimary}
                  style={styles.noteText}
                >
                  {additionalNote}
                </BebaText>
              </View>
            </View>
          )}

          {/* Quick Responses */}
          <View style={styles.quickResponsesContainer}>
            <BebaText category="body3" color={Palette.textTertiary} style={styles.sectionLabel}>
              QUICK MESSAGES
            </BebaText>
            {renderQuickResponses()}
          </View>

          {/* Stats Bar */}
          {renderStatsBar()}

          {/* Action Buttons Row */}
          <View style={styles.actionsSection}>
            <TouchableOpacity
              style={styles.navButton}
              activeOpacity={0.8}
              onPress={handleNavigate}
            >
              <Map size={28} color={Palette.background} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.contactBtn}
              activeOpacity={0.8}
              onPress={handleCall}
            >
              <Phone size={22} color={Palette.primary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.contactBtn}
              activeOpacity={0.8}
              onPress={handleMessage}
            >
              <MessageSquare size={22} color={Palette.primary} />
            </TouchableOpacity>
          </View>

          {/* Swipe-to-Confirm Track */}
          {tripPhase !== "completed" && (
            <View style={styles.swipeTrackContainer}>
              <View style={styles.swipeTrack}>
                <Animated.View
                  style={[
                    styles.swipeThumb,
                    {
                      transform: [{ translateX: swipeTranslateX }],
                      backgroundColor: swipeThumbColor,
                    },
                  ]}
                  {...swipePanResponder.panHandlers}
                >
                  {primaryActionIcon}
                </Animated.View>
                <BebaText
                  category="body3"
                  color={Palette.textSecondary}
                  style={styles.swipeLabel}
                >
                  {primaryActionText}
                </BebaText>
              </View>
              <BebaText category="caption" color={Palette.textTertiary} style={styles.swipeHint}>
                Swipe to confirm
              </BebaText>
            </View>
          )}

          {/* Wait Fee (only during transit after arrival) */}
          {tripStarted && isArrived && waitFee > 0 && (
            <View style={[styles.card, styles.earningsCard]}>
              <View>
                <BebaText category="body3" color={Palette.gray300}>
                  WAIT FEE ACCRUED
                </BebaText>
                <View style={styles.waitFeeRow}>
                  <BebaText category="h2" color={Palette.accent} style={styles.bold}>
                    GH₵ {waitFee.toFixed(2)}
                  </BebaText>
                  <BebaText category="body3" color={Palette.gray300}>
                    {formatTime()}
                  </BebaText>
                </View>
              </View>
            </View>
          )}

          {/* Earnings Summary */}
          <View style={[styles.card, styles.earningsCard]}>
            <BebaText category="body3" color={Palette.gray300}>
              ESTIMATED PAYOUT
            </BebaText>
            <BebaText
              category="h2"
              color={Palette.white}
              style={styles.bold}
            >
              GH₵ {totalEstimated}
            </BebaText>
          </View>

          {/* SOS Button (discreet) */}
          {tripPhase !== "completed" && (
            <TouchableOpacity
              style={styles.sosButton}
              onPress={() => setShowSOS(true)}
            >
              <Shield size={16} color={Palette.danger} />
              <BebaText category="body4" color={Palette.danger}>
                Report Issue
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
    borderTopLeftRadius: Spacing.cardRadius + 8,
    borderTopRightRadius: Spacing.cardRadius + 8,
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
  sheetContent: { flex: 1 },
  sheetInner: { paddingTop: 4, paddingBottom: Spacing.padding },

  /* Header Section */
  headerSection: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: Spacing.row,
  },
  avatarContainer: {
    position: "relative",
    marginRight: Spacing.padding,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Palette.gray100,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  statusDot: {
    position: "absolute",
    bottom: 2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 3,
    borderColor: Palette.surface,
  },
  ratingBadge: {
    position: "absolute",
    bottom: -4,
    right: -8,
    backgroundColor: Palette.accent + "20",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  headerInfo: { flex: 1 },
  headerMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 8,
    flexWrap: "wrap",
  },
  roleBadge: {
    backgroundColor: Palette.primary + "15",
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 12,
  },
  orderIdPill: {
    backgroundColor: Palette.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
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

  /* Progress Bar */
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.row,
  },
  progressStep: {
    alignItems: "center",
    flex: 1,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 10,
    fontWeight: "500",
  },
  progressLine: {
    height: 2,
    flex: 1,
    backgroundColor: Palette.gray200,
    marginBottom: 6,
  },

  /* Stats Bar */
  statsBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Palette.gray100,
    borderRadius: Spacing.borderRadius,
    marginBottom: Spacing.row,
    paddingVertical: 12,
  },
  statSlot: { flex: 1, alignItems: "center", justifyContent: "center" },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: Palette.gray300,
  },

  /* Cards */
  card: {
    backgroundColor: Palette.surface,
    borderRadius: Spacing.borderRadius,
    padding: Spacing.padding,
    marginBottom: Spacing.row,
    borderWidth: 1,
    borderColor: Palette.border,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: Palette.textTertiary,
    marginBottom: Spacing.padding / 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  addressText: {
    fontSize: 14,
    fontWeight: '400',
    color: Palette.textPrimary,
    lineHeight: 22,
  },
  bold: { fontWeight: "700" },
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

  /* Order Summary */
  orderSummaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderSummaryLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  orderSummaryTitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  orderSummaryContent: {
    marginTop: Spacing.padding,
    paddingTop: Spacing.padding,
    borderTopWidth: 1,
    borderTopColor: Palette.border,
  },
  orderItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },

  /* Quick Responses */
  quickResponsesContainer: {
    marginBottom: Spacing.row,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: Palette.textTertiary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  quickResponsesRow: {
    gap: 8,
  },
  quickResponseBtn: {
    backgroundColor: Palette.primary + "10",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Palette.primary + "20",
  },

  /* Actions */
  actionsSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.padding,
    marginBottom: Spacing.padding,
  },
  navButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Palette.secondary,
    justifyContent: "center",
    alignItems: "center",
  },
  contactBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Palette.gray50,
    justifyContent: "center",
    alignItems: "center",
  },

  /* Swipe-to-Confirm */
  swipeTrackContainer: {
    alignItems: "center",
    marginBottom: Spacing.padding,
  },
  swipeTrack: {
    width: "100%",
    height: 56,
    backgroundColor: Palette.gray100,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Palette.gray200,
  },
  swipeThumb: {
    position: "absolute",
    left: 0,
    top: 0,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  swipeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Palette.textSecondary,
  },
  swipeHint: {
    marginTop: 6,
    fontSize: 11,
    color: Palette.textTertiary,
  },

  /* Wait Fee & Earnings */
  earningsCard: {
    backgroundColor: Palette.primary,
    borderRadius: Spacing.borderRadius,
    padding: Spacing.padding,
    marginBottom: Spacing.row,
  },
  waitFeeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },

  /* SOS Button */
  sosButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: Spacing.borderRadius,
    borderWidth: 1,
    borderColor: Palette.danger,
    marginBottom: Spacing.padding,
  },

  /* SOS Modal */
  sosOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  sosModal: {
    backgroundColor: Palette.surface,
    borderRadius: Spacing.borderRadius,
    padding: Spacing.padding,
    width: "85%",
    maxWidth: 400,
  },
  sosIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: Spacing.row,
  },
  sosTitle: {
    textAlign: "center",
    marginBottom: 8,
  },
  sosSubtitle: {
    textAlign: "center",
    marginBottom: Spacing.row,
  },
  sosOption: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Palette.border,
  },
  sosCancelBtn: {
    marginTop: Spacing.padding,
    paddingVertical: 14,
    borderRadius: Spacing.borderRadius,
    alignItems: "center",
    borderWidth: 1,
  },

  bottomSpacer: { height: Spacing.row },
});

const MOCK_REGION = {
  latitude: 5.558,
  longitude: -0.202,
  latitudeDelta: 0.002,
  longitudeDelta: 0.002,
};

export default ActiveTrip;
