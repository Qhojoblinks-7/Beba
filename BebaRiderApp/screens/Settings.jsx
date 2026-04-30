import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Palette, Spacing } from '../constants/theme';
import { User, Bike, Bell, ShieldCheck, LogOut, ChevronRight } from 'lucide-react-native';

// Beba Components
import BebaText from '../components/atoms/BebaText';

/**
 * Settings Screen: Pilot & Gear Configuration
 */
const Settings = () => {
  const [isNotificationsEnabled, setIsNotificationsEnabled] = React.useState(true);

  // Reusable Setting Row Component
  const SettingRow = ({ icon: Icon, label, value, onPress, isLast = false, toggle = false }) => (
    <TouchableOpacity 
      onPress={onPress} 
      disabled={toggle}
      style={[styles.row, isLast && { borderBottomWidth: 0 }]}
    >
      <View style={styles.iconBox}>
        <Icon size={20} color={Palette.secondary} />
      </View>
      <View style={styles.labelBox}>
        <BebaText category="body2" color={Palette.black}>{label}</BebaText>
        {value && <BebaText category="body3" color={Palette.gray500}>{value}</BebaText>}
      </View>
      {toggle ? (
        <Switch 
          value={isNotificationsEnabled} 
          onValueChange={setIsNotificationsEnabled}
          trackColor={{ false: Palette.gray200, true: Palette.primary }}
        />
      ) : (
        <ChevronRight size={20} color={Palette.gray300} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* 1. Profile Header */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <BebaText category="h2" color={Palette.white}>I</BebaText>
          </View>
          <View style={{ marginLeft: 16 }}>
            <BebaText category="h2" color={Palette.black}>Immanuel</BebaText>
            <BebaText category="body3" color={Palette.gray500}>Level 300 • CS Pilot</BebaText>
          </View>
        </View>

        {/* 2. Pilot Config Group */}
        <BebaText category="body3" color={Palette.gray400} style={styles.sectionTitle}>PILOT CONFIG</BebaText>
        <View style={styles.group}>
          <SettingRow icon={User} label="Personal Details" value="immanuel@student.atu.edu.gh" />
          <SettingRow icon={Bell} label="Push Notifications" toggle />
          <SettingRow icon={ShieldCheck} label="Account Security" isLast />
        </View>

        {/* 3. Gear Config Group */}
        <BebaText category="body3" color={Palette.gray400} style={styles.sectionTitle}>GEAR & EQUIPMENT</BebaText>
        <View style={styles.group}>
          <SettingRow icon={Bike} label="Vehicle Info" value="Mountain Bike • Racer-tuned" />
          <SettingRow icon={ShieldCheck} label="Insurance Status" value="Active till Dec 2026" isLast />
        </View>

        {/* 4. Logout Action */}
        <TouchableOpacity style={styles.logoutBtn}>
          <LogOut size={20} color={Palette.danger} />
          <BebaText category="body2" color={Palette.danger} style={{ marginLeft: 12 }}>
            Log Out Pilot Account
          </BebaText>
        </TouchableOpacity>

        <BebaText category="body3" color={Palette.gray300} center style={{ marginTop: 40 }}>
          Beba Rider App v1.0.4 (Industrial Project)
        </BebaText>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Palette.white },
  scrollContent: { padding: Spacing.padding, paddingBottom: 100 },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 10,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Palette.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    letterSpacing: 1.5,
    marginBottom: 10,
    marginLeft: 4,
  },
  group: {
    backgroundColor: Palette.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Palette.gray200,
    marginBottom: 25,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Palette.gray100,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(23, 78, 79, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelBox: { flex: 1, marginLeft: 12 },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginTop: 10,
  }
});

export default Settings;