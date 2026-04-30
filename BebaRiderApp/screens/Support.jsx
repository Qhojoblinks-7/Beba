import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  HelpCircle, MessageSquare, Phone, 
  Email, MapPin, CheckCircle 
} from 'lucide-react-native';
import BebaText from '../components/atoms/BebaText';
import { Palette, Spacing } from '../constants/theme';

const SUPPORT_FAQS = [
  {
    id: '1',
    question: 'How do I contact support during a delivery?',
    answer: 'You can reach our 24/7 support team through the in-app chat or by calling +233 302 123 456.',
    category: 'General'
  },
  {
    id: '2',
    question: 'What should I do if I have an accident during a trip?',
    answer: 'First, ensure everyone is safe. Then use the SOS feature in the app to alert your emergency contacts and our safety team.',
    category: 'Safety'
  },
  {
    id: '3',
    question: 'How long does it take to get paid after a delivery?',
    answer: 'Payments are processed daily. You\'ll see earnings in your wallet within 24 hours of completing a delivery.',
    category: 'Payments'
  },
  {
    id: '4',
    question: 'Can I use multiple vehicles for deliveries?',
    answer: 'Yes, you can register multiple vehicles in your profile. Each vehicle needs its own insurance and registration documents.',
    category: 'Vehicle'
  },
  {
    id: '5',
    question: 'What documents do I need to upload for verification?',
    answer: 'You need a valid driver\'s license, vehicle registration, insurance certificate, and roadworthy certificate.',
    category: 'Documents'
  }
];

const Support = ({ navigation }) => {
  const insets = useSafeAreaInsets();

  const handleContactSupport = () => {
    // In a real app, this would open the chat or call support
    navigation.navigate('ChatThread', {
      name: 'Beba Support',
      orderId: 'Support'
    });
  };

  const handleCallSupport = () => {
    // In a real app, this would initiate a call
    alert('Calling Beba Support: +233 302 123 456');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <BebaText category="h1" color={Palette.textPrimary} style={styles.sectionTitle}>
          Help & Support
        </BebaText>

        {/* Quick Help */}
        <View style={styles.quickHelpSection}>
          <BebaText category="h2" color={Palette.textPrimary}>Need Immediate Help?</BebaText>
          <View style={styles.helpButtons}>
            <TouchableOpacity 
              style={styles.buttonPrimary}
              onPress={handleContactSupport}
            >
              <MessageSquare size={20} color={Palette.white} />
              <BebaText category="h4" color={Palette.white}>Chat Support</BebaText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.buttonSecondary}
              onPress={handleCallSupport}
            >
              <Phone size={20} color={Palette.primary} />
              <BebaText category="h4" color={Palette.primary}>Call Support</BebaText>
            </TouchableOpacity>
          </View>
        </View>

        {/* FAQ Section */}
        <BebaText category="h2" color={Palette.textPrimary} style={styles.sectionTitle}>
          Frequently Asked Questions
        </BebaText>
        
        <View style={styles.faqContainer}>
          {SUPPORT_FAQS.map(faq => (
            <View key={faq.id} style={styles.faqCard}>
              <View style={styles.faqHeader}>
                <BebaText category="h4" color={Palette.textPrimary}>
                  {faq.question}
                </BebaText>
                <View style={styles.categoryBadge}>
                  <BebaText category="body4" color={Palette.primary}>
                    {faq.category}
                  </BebaText>
                </View>
              </View>
              <BebaText category="body3" color={Palette.textSecondary}>
                {faq.answer}
              </BebaText>
            </View>
          ))}
        </View>

        {/* Contact Info */}
        <View style={styles.contactSection}>
          <BebaText category="h2" color={Palette.textPrimary}>Contact Information</BebaText>
          
          <View style={styles.contactItem}>
            <Email size={20} color={Palette.primary} />
            <View>
              <BebaText category="h4" color={Palette.textPrimary}>support@beba.com.gh</BebaText>
              <BebaText category="body4" color={Palette.textSecondary}>Email us for non-urgent inquiries</BebaText>
            </View>
          </View>
          
          <View style={styles.contactItem}>
            <MapPin size={20} color={Palette.primary} />
            <View>
              <BebaText category="h4" color={Palette.textPrimary}>Beba Headquarters</BebaText>
              <BebaText category="body4" color={Palette.textSecondary}>Accra, Ghana</BebaText>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Palette.background },
  scrollContent: { paddingHorizontal: Spacing.gutter, paddingBottom: 40 },
  sectionTitle: { marginVertical: 20 },
  
  quickHelpSection: {
    backgroundColor: Palette.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24
  },
  helpButtons: {
    flexDirection: 'row',
    marginTop: 16
  },
  buttonPrimary: {
    backgroundColor: Palette.primary,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginRight: 12
  },
  buttonSecondary: {
    backgroundColor: Palette.transparent,
    borderWidth: 1,
    borderColor: Palette.primary,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center'
  },
  
  faqContainer: { marginBottom: 24 },
  faqCard: {
    backgroundColor: Palette.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  categoryBadge: {
    backgroundColor: Palette.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  
  contactSection: { marginBottom: 24 },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Palette.gray100
  }
});

export default Support;