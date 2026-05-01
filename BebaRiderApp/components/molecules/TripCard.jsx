import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Palette, Spacing } from '../../constants/theme';
import BebaText from '../atoms/BebaText';
import { MapPin, Clock, ArrowRight } from 'lucide-react-native';

/**
 * TripCard Molecule
 * @param {string} destination - Drop-off location (e.g., "Kaneshie Market")
 * @param {string} time - Time of completion (e.g., "12:30 PM")
 * @param {string} amount - Total earned (e.g., "GH₵ 25.00")
 * @param {string} type - "Food" or "Parcel" for specific icons
 * @param {function} onPress - Navigate to the trip detail/map snippet
 */
const TripCard = ({ destination, time, amount, type = "Food", onPress }) => {
  return (
    <TouchableOpacity 
      activeOpacity={0.9} 
      onPress={onPress} 
      style={styles.container}
    >
      {/* Left Section: Icon & Category */}
<View style={styles.iconContainer}>
        <MapPin size={20} color={Palette.primary} />
      </View>

      {/* Center Section: Info */}
      <View style={styles.infoContainer}>
        <BebaText category="body2" numberOfLines={1}>
          {destination}
        </BebaText>
        <View style={styles.subInfo}>
          <Clock size={12} color={Palette.textTertiary} style={{ marginRight: 4 }} />
          <BebaText category="body3">
            {time} • {type}
          </BebaText>
        </View>
      </View>

      {/* Right Section: Earnings */}
      <View style={styles.amountContainer}>
        <BebaText category="h3" color={Palette.primary}>
          {amount}
        </BebaText>
        <ArrowRight size={16} color={Palette.textTertiary} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.secondary,
    padding: Spacing.padding,
    borderRadius: 20, // Slightly less than the main screen radius
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)', // Subtle edge highlight
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 166, 62, 0.1)', // Faint green glow
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContainer: {
    flex: 1,
  },
  subInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  amountContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
});

export default TripCard;