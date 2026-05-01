import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Palette, Spacing } from '../../constants/theme';
import { RIDER_STATUS } from '../../constants/orderConstants';
import BebaText from '../atoms/BebaText';
import BebaButton from '../atoms/BebaButton';
import { Star, Wallet, Settings2, ChevronRight } from 'lucide-react-native';

const StatusSheet = ({ 
  isOnline, 
  onToggleStatus, 
  navigation, 
  riderStatus, 
  earnings, 
  availableOrdersCount, 
  hasActiveOrder,
  isLoading 
}) => {
  // Get the status text
  const getStatusText = () => {
    switch (riderStatus) {
      case RIDER_STATUS.ONLINE:
        return 'Online';
      case RIDER_STATUS.ON_TRIP:
        return 'On Trip';
      default:
        return 'Offline';
    }
  };

// Get status subtitle
  const getStatusSubtitle = () => {
    switch (riderStatus) {
      case RIDER_STATUS.ONLINE:
        return `${availableOrdersCount} orders available`;
      case RIDER_STATUS.ON_TRIP:
        return 'Delivery in progress';
      default:
        return 'Order search off';
    }
  };

  // Get deliveries count
  const getDeliveriesCount = () => {
    return earnings?.completedTrips || 0;
   };

  // Get earnings amount formatted
  const getEarningsAmount = () => {
    const amount = earnings?.today || 0;
    return `GH₵ ${amount.toFixed(2)}`;
  };

  // Navigate to delivery tracking screen (only if no active order)
  const handleDeliveriesPress = () => {
    if (navigation && !hasActiveOrder) {
      navigation.navigate('DeliveryTracking');
    }
  };

  return (
    <View style={styles.container}>
      {/* 1. Drag Handle */}
      <View style={styles.dragHandle} />

      {/* 2. Header with Status */}
<View style={styles.headerRow}>
        <View>
          <BebaText category="h1" color={Palette.textPrimary} style={styles.bold}>
            {getStatusText()}
          </BebaText>
          <BebaText category="body3" color={Palette.textSecondary}>
            {getStatusSubtitle()}
          </BebaText>
        </View>
        <TouchableOpacity style={styles.settingsBtn}>
          <Settings2 size={24} color={Palette.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* 3. Main Action Button (Yellow) */}
      {riderStatus !== RIDER_STATUS.ON_TRIP && (
        <BebaButton
          title={isOnline ? 'Turn off order search' : 'Turn on order search'}
          subtitle={isOnline ? 'Stop receiving orders' : 'Start receiving orders'}
          onPress={onToggleStatus}
          loading={isLoading}
          style={styles.yellowButton}
          textStyle={styles.buttonText}
        />
      )}

      {/* 4. Horizontal Stats Row */}
      <View style={styles.statsRow}>
         {/* Priority Card / Deliveries */}
         <TouchableOpacity 
           style={styles.statCard} 
           onPress={handleDeliveriesPress}
           disabled={hasActiveOrder}
         >
<View style={styles.iconCircle}>
             <Star size={20} color={Palette.textPrimary} />
           </View>
           <View style={styles.statInfo}>
             <BebaText category="body4" color={Palette.textSecondary}>Deliveries</BebaText>
             <BebaText category="h3" color={Palette.textPrimary} style={styles.bold}>
               {getDeliveriesCount()}
             </BebaText>
           </View>
           <ChevronRight size={18} color={Palette.textTertiary} />
         </TouchableOpacity>

{/* Earnings/Money Card */}
         <TouchableOpacity style={styles.statCard}>
           <View style={styles.iconCircle}>
             <Wallet size={20} color={Palette.textPrimary}/>
           </View>
           <View style={styles.statInfo}>
             <BebaText category="body4" color={Palette.textSecondary}>Today</BebaText>
             <BebaText category="h3" color={Palette.textPrimary} style={styles.bold}>
               {getEarningsAmount()}
             </BebaText>
           </View>
           <ChevronRight size={18} color={Palette.textTertiary} />
         </TouchableOpacity>
       </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: Palette.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 30,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: Palette.textTertiary,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  settingsBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Palette.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  yellowButton: {
    backgroundColor: Palette.accent,
    borderRadius: 16,
    height: 64,
    marginBottom: 16,
    justifyContent: 'center',
  },
  buttonText: {
    color: Palette.textPrimary,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.background,
    borderRadius: 16,
    padding: 12,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Palette.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  statInfo: {
    flex: 1,
  },
  bold: {
    fontWeight: 'bold',
  },
});

export default StatusSheet;
