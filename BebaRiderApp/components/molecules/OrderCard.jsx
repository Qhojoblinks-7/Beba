import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Clock, MapPin, Package, FileText, Coffee, ChevronRight } from 'lucide-react-native';
import { Palette, Spacing } from '../../constants/theme';
import BebaText from '../atoms/BebaText';

/**
 * OrderCard Molecule
 * Displays an available order in the Delivery Tracking screen
 * Shows priority, category icons, and acceptance button
 */
const OrderCard = ({ order, onAccept, onPress }) => {
  const { 
    id, 
    category = 'PARCEL', 
    priority_weight,
    pickup_address, 
    dropoff_address,
    customer,
    item_count = 1,
    notes,
    created_at,
  } = order;

  // Get category icon
  const getCategoryIcon = () => {
    switch (category?.toUpperCase()) {
      case 'FOOD':
        return <Coffee size={20} color={Palette.danger} />;
      case 'DOCUMENT':
        return <FileText size={20} color={Palette.primary} />;
      default:
        return <Package size={20} color={Palette.accent} />;
    }
  };

  // Get category color for priority badge
  const getCategoryColor = () => {
    switch (category?.toUpperCase()) {
      case 'FOOD':
        return Palette.danger;
      case 'DOCUMENT':
        return Palette.primary;
      default:
        return Palette.accent;
    }
  };

  // Format time since order created
  const getTimeAgo = () => {
    if (!created_at) return '';
    const diff = Date.now() - new Date(created_at).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    return `${hours}h ago`;
  };

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.9}
    >
      {/* Left: Category Icon & Priority */}
      <View style={[styles.iconContainer, { backgroundColor: getCategoryColor() + '20' }]}>
        {getCategoryIcon()}
        <View style={[styles.priorityBadge, { backgroundColor: getCategoryColor() }]}>
          <BebaText category="body4" color={Palette.white} style={styles.priorityText}>
            {priority_weight || 10}
          </BebaText>
        </View>
      </View>

      {/* Center: Order Info */}
      <View style={styles.infoContainer}>
        <View style={styles.headerRow}>
          <BebaText category="h4" color={Palette.textPrimary}>
            {id || `Order #${order?.id}`}
          </BebaText>
          <View style={styles.timeContainer}>
            <Clock size={12} color={Palette.gray500} />
            <BebaText category="body3" color={Palette.gray500} style={styles.timeText}>
              {getTimeAgo()}
            </BebaText>
          </View>
        </View>

        <View style={styles.addressSection}>
          <View style={styles.addressRow}>
            <MapPin size={14} color={Palette.success} />
            <BebaText category="body2" numberOfLines={1} style={styles.addressText}>
              {pickup_address || 'Pickup location'}
            </BebaText>
          </View>
          <View style={styles.addressRow}>
            <MapPin size={14} color={Palette.danger} />
            <BebaText category="body2" numberOfLines={1} style={styles.addressText}>
              {dropoff_address || 'Drop-off location'}
            </BebaText>
          </View>
        </View>

        <View style={styles.footerRow}>
          <BebaText category="body3" color={Palette.gray500}>
            {customer?.first_name || 'Customer'} • {item_count || 1} item{item_count > 1 ? 's' : ''}
          </BebaText>
        </View>
      </View>

      {/* Right: Accept Button */}
      <TouchableOpacity 
        style={[styles.acceptButton, { backgroundColor: getCategoryColor() }]}
        onPress={() => onAccept(id)}
        activeOpacity={0.8}
      >
        <BebaText category="body3" color={Palette.white} style={styles.acceptText}>
          Accept
        </BebaText>
        <ChevronRight size={16} color={Palette.white} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.surface,
    padding: Spacing.padding,
    borderRadius: Spacing.borderRadius,
    marginBottom: Spacing.row,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    position: 'relative',
  },
  priorityBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '700',
  },
  infoContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    marginLeft: 2,
  },
  addressSection: {
    gap: 4,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addressText: {
    flex: 1,
  },
  footerRow: {
    marginTop: 4,
  },
  acceptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 4,
  },
  acceptText: {
    fontWeight: '600',
  },
});

export default OrderCard;
