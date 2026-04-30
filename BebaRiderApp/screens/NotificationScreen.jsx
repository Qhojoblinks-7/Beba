import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Bell, Clock, Volume2, Vibrate } from 'lucide-react-native';
import BebaText from '../components/atoms/BebaText';
import { Palette, Spacing } from '../constants/theme';

const NotificationScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [preferences, setPreferences] = useState({
    pushEnabled: true,
    soundEnabled: true,
    vibrateEnabled: true,
    newOrderAlerts: true,
    deliveryUpdates: true,
    promotions: false,
    earnings: true,
    systemUpdates: true,
  });

  const togglePreference = (key) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const NotificationSection = ({ title, items }) => (
    <View style={styles.section}>
      <BebaText category="body3" color={Palette.gray400} style={styles.sectionTitle}>
        {title.toUpperCase()}
      </BebaText>
      <View style={styles.card}>
        {items.map((item, index) => (
          <View
            key={index}
            style={[
              styles.settingRow,
              index < items.length - 1 && styles.borderBottom
            ]}
          >
            <View style={styles.settingLeft}>
              <View style={[styles.iconBox, { backgroundColor: item.bgColor }]}>
                <item.icon size={20} color={Palette.primary} />
              </View>
              <View>
                <BebaText category="h4">{item.label}</BebaText>
                {item.description && (
                  <BebaText category="body4" color={Palette.textSecondary}>
                    {item.description}
                  </BebaText>
                )}
              </View>
            </View>
            <Switch
              value={preferences[item.key]}
              onValueChange={() => togglePreference(item.key)}
              trackColor={{ false: Palette.gray200, true: Palette.primary }}
              thumbColor={Palette.white}
            />
          </View>
        ))}
      </View>
    </View>
  );

  const appSettings = [
    { key: 'pushEnabled', label: 'Push Notifications', description: 'Receive alerts on your device', icon: Bell, bgColor: 'rgba(0, 166, 62, 0.1)' },
    { key: 'soundEnabled', label: 'Notification Sound', description: 'Play sound for notifications', icon: Volume2, bgColor: 'rgba(255, 193, 7, 0.1)' },
    { key: 'vibrateEnabled', label: 'Vibration', description: 'Vibrate on incoming alerts', icon: Vibrate, bgColor: 'rgba(33, 150, 243, 0.1)' },
  ];

  const deliverySettings = [
    { key: 'newOrderAlerts', label: 'New Order Alerts', description: 'Get notified about new deliveries', icon: Bell, bgColor: 'rgba(0, 166, 62, 0.1)' },
    { key: 'deliveryUpdates', label: 'Delivery Updates', description: 'Track your active deliveries', icon: Clock, bgColor: 'rgba(33, 150, 243, 0.1)' },
  ];

  const otherSettings = [
    { key: 'promotions', label: 'Promotions & Offers', description: 'Special deals and discounts', icon: Bell, bgColor: 'rgba(255, 152, 0, 0.1)' },
    { key: 'earnings', label: 'Earnings Alerts', description: 'Daily/weekly earnings summaries', icon: Clock, bgColor: 'rgba(76, 175, 80, 0.1)' },
    { key: 'systemUpdates', label: 'System Updates', description: 'App maintenance and new features', icon: Bell, bgColor: 'rgba(156, 39, 176, 0.1)' },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color={Palette.textPrimary} />
        </TouchableOpacity>
        <BebaText category="h2">Notifications</BebaText>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <BebaText category="body4" color={Palette.textSecondary} style={styles.intro}>
          Customize how and when you receive notifications from Beba.
        </BebaText>

        <NotificationSection title="App Settings" items={appSettings} />
        <NotificationSection title="Delivery Alerts" items={deliverySettings} />
        <NotificationSection title="Other" items={otherSettings} />

        <View style={styles.disclaimer}>
          <BebaText category="body4" color={Palette.textSecondary}>
            Some system notifications cannot be disabled for your safety and account security.
          </BebaText>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.padding,
    paddingVertical: 16,
    backgroundColor: Palette.white,
  },
  content: {
    flex: 1,
    padding: Spacing.padding,
  },
  intro: {
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  card: {
    backgroundColor: Palette.white,
    borderRadius: 16,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: Palette.gray100,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  disclaimer: {
    backgroundColor: Palette.gray100,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
});

export default NotificationScreen;
