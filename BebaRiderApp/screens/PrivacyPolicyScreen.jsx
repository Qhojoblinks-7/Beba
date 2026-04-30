import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, FileText, Shield } from 'lucide-react-native';
import BebaText from '../components/atoms/BebaText';
import { Palette, Spacing } from '../constants/theme';

const PrivacyPolicyScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color={Palette.textPrimary} />
        </TouchableOpacity>
        <BebaText category="h2">Privacy Policy</BebaText>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.iconContainer}>
          <Shield size={48} color={Palette.primary} />
        </View>

        <BebaText category="h2" style={styles.title}>Your Privacy Matters</BebaText>
        <BebaText category="body3" color={Palette.textSecondary} style={styles.lastUpdated}>
          Last updated: April 2026
        </BebaText>

        <View style={styles.section}>
          <BebaText category="h4" style={styles.heading}>Data Collection</BebaText>
          <BebaText category="body4" color={Palette.textSecondary} style={styles.paragraph}>
            We collect information you provide directly, such as your name, phone number,
            delivery addresses, and payment details. This helps us provide and improve
            our delivery services.
          </BebaText>
        </View>

        <View style={styles.section}>
          <BebaText category="h4" style={styles.heading}>Location Data</BebaText>
          <BebaText category="body4" color={Palette.textSecondary} style={styles.paragraph}>
            Your location is used to match you with nearby orders and provide navigation.
            Location tracking is only active when you have an ongoing delivery or are
            searching for orders.
          </BebaText>
        </View>

        <View style={styles.section}>
          <BebaText category="h4" style={styles.heading}>Data Sharing</BebaText>
          <BebaText category="body4" color={Palette.textSecondary} style={styles.paragraph}>
            We share your data with senders to facilitate deliveries, with payment
            processors for transactions, and when required by law. We never sell your
            personal information to third parties.
          </BebaText>
        </View>

        <View style={styles.section}>
          <BebaText category="h4" style={styles.heading}>Your Rights</BebaText>
          <BebaText category="body4" color={Palette.textSecondary} style={styles.paragraph}>
            You can access, update, or delete your personal data at any time through the
            app settings. You may also contact our support team for assistance with
            data-related requests.
          </BebaText>
        </View>

        <View style={styles.section}>
          <BebaText category="h4" style={styles.heading}>Security</BebaText>
          <BebaText category="body4" color={Palette.textSecondary} style={styles.paragraph}>
            We use industry-standard security measures to protect your data, including
            encryption, secure servers, and regular security audits.
          </BebaText>
        </View>

        <TouchableOpacity style={styles.contactButton}>
          <BebaText category="h4" color={Palette.white}>
            Contact Privacy Team
          </BebaText>
        </TouchableOpacity>

        <BebaText category="body4" color={Palette.textSecondary} style={styles.footer}>
          By using Beba, you agree to our Privacy Policy and Terms of Service.
        </BebaText>
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
  iconContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  lastUpdated: {
    textAlign: 'center',
    marginBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  heading: {
    marginBottom: 8,
  },
  paragraph: {
    lineHeight: 22,
  },
  contactButton: {
    backgroundColor: Palette.secondary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  footer: {
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default PrivacyPolicyScreen;
