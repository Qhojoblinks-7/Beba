import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Phone, MessageSquare } from 'lucide-react-native';
import { Palette, Spacing } from '../../constants/theme';
import BebaText from '../atoms/BebaText';

export const CustomerHeader = ({ name, orderId }) => (
  <View style={styles.customerCard}>
    <View style={{ flex: 1 }}>
      <BebaText category="h3">{name}</BebaText>
      <BebaText category="body3" color={Palette.gray500}>{orderId}</BebaText>
    </View>
    <View style={styles.actionIcons}>
      <TouchableOpacity style={styles.iconCircle}><Phone size={20} color={Palette.primary} /></TouchableOpacity>
      <TouchableOpacity style={styles.iconCircle}><MessageSquare size={20} color={Palette.primary} /></TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  customerCard: { flexDirection: 'row', backgroundColor: Palette.white, padding: 16, borderRadius: 20, alignItems: 'center', elevation: 5 },
  actionIcons: { flexDirection: 'row' },
  iconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: Palette.gray100, justifyContent: 'center', alignItems: 'center', marginLeft: 10 }
});