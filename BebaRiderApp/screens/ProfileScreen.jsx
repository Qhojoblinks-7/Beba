import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  Lock, Globe, MapPin, Bell, CreditCard, 
  Shield, Edit3, ChevronRight, LogOut 
} from 'lucide-react-native';
import BebaText from '../components/atoms/BebaText';
import { Palette, Spacing } from '../constants/theme';

const { width } = Dimensions.get('window');

  const MenuOption = ({ icon: Icon, label, onPress }) => (
    <TouchableOpacity style={styles.menuOption} onPress={onPress}>
      <View style={styles.iconCircle}>
        <Icon size={20} color={Palette.primary} />
      </View>
      <BebaText category="h4" color={Palette.textPrimary} style={styles.menuLabel}>
        {label}
      </BebaText>
      <ChevronRight size={18} color={Palette.gray400} />
    </TouchableOpacity>
  );

const ProfileScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* 1. Floating Header Card */}
        <View style={[styles.headerCard, { paddingTop: insets.top + 20 }]}>
          <View style={styles.headerTopRow}>
            <BebaText category="h2" color={Palette.white}>My Profile</BebaText>
            <TouchableOpacity style={styles.editButton}>
              <Edit3 size={20} color={Palette.white} />
            </TouchableOpacity>
          </View>

          <View style={styles.riderProfileRow}>
            <View style={styles.avatarContainer}>
              <Image 
                source={{ uri: 'https://i.pravatar.cc/150?u=kofi' }} 
                style={styles.avatar} 
              />
            </View>
            <View style={styles.riderDetails}>
              <BebaText category="h3" color={Palette.white}>Kofi Mensah</BebaText>
              <BebaText category="body4" color="rgba(255,255,255,0.8)">+233 24 722 7492</BebaText>
            </View>
          </View>
        </View>

        {/* 2. Menu Sections */}
        <View style={styles.contentContainer}>
          
          <BebaText category="h4" color={Palette.gray400} style={styles.sectionLabel}>General</BebaText>
          <View style={styles.sectionCard}>
            <MenuOption icon={Lock} label="Change Password" onPress={() => navigation.navigate('ChangePassword')} />
            <MenuOption icon={Globe} label="Language" onPress={() => navigation.navigate('Language')} />
            <MenuOption icon={MapPin} label="Address" onPress={() => navigation.navigate('Address')} />
            <MenuOption icon={Bell} label="Notification" onPress={() => navigation.navigate('Notification')} />
          </View>

          <BebaText category="h4" color={Palette.gray400} style={styles.sectionLabel}>Others</BebaText>
          <View style={styles.sectionCard}>
            <MenuOption icon={CreditCard} label="Payment Method" onPress={() => navigation.navigate('PaymentMethod')} />
            <MenuOption icon={Shield} label="Privacy Policy" onPress={() => navigation.navigate('PrivacyPolicy')} />
            <MenuOption icon={LogOut} label="Log Out" />
          </View>

        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FB' },
  headerCard: {
    backgroundColor: Palette.primary, // Using your Beba Green
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    paddingHorizontal: 25,
    paddingBottom: 40,
    width: '100%',
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  editButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 8,
    borderRadius: 12,
  },
  riderProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  avatarContainer: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
    overflow: 'hidden',
  },
  avatar: { width: '100%', height: '100%' },
  riderDetails: { gap: 2 },
  
  contentContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sectionLabel: {
    marginLeft: 5,
    marginBottom: 12,
    marginTop: 20,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sectionCard: {
    backgroundColor: Palette.white,
    borderRadius: 20,
    paddingVertical: 5,
    // Soft shadow for the card
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,166,62,0.08)', // Faded Beba Green
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuLabel: { flex: 1 },
});

export default ProfileScreen;