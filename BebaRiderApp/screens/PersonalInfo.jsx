import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  User, Edit, Phone, Mail, MapPin, Calendar, CheckCircle 
} from 'lucide-react-native';
import BebaText from '../components/atoms/BebaText';
import { Palette, Spacing } from '../constants/theme';

const PersonalInfo = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [firstName, setFirstName] = useState('Kofi');
  const [lastName, setLastName] = useState('Mensah');
  const [phone, setPhone] = useState('+233 24 123 4567');
  const [email, setEmail] = useState('kofi.mensah@email.com');
  const [dateOfBirth, setDateOfBirth] = useState('1995-08-15');
  const [address, setAddress] = useState('123 Liberation Ave, Accra');

  const handleSave = () => {
    // In a real app, this would send data to backend
    Alert.alert(
      'Success', 
      'Personal information updated successfully',
      [{ text: 'OK' }]
    );
    navigation.goBack();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <BebaText category="h1" color={Palette.textPrimary} style={styles.sectionTitle}>
          Personal Information
        </BebaText>

        <View style={styles.formSection}>
          <View style={styles.inputGroup}>
            <BebaText category="body4" color={Palette.textSecondary}>First Name</BebaText>
            <TextInput
              style={styles.input}
              placeholder="Enter first name"
              value={firstName}
              onChangeText={setFirstName}
              autoCapitalize="words"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <BebaText category="body4" color={Palette.textSecondary}>Last Name</BebaText>
            <TextInput
              style={styles.input}
              placeholder="Enter last name"
              value={lastName}
              onChangeText={setLastName}
              autoCapitalize="words"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <BebaText category="body4" color={Palette.textSecondary}>Phone Number</BebaText>
            <TextInput
              style={styles.input}
              placeholder="Enter phone number"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <BebaText category="body4" color={Palette.textSecondary}>Email Address</BebaText>
            <TextInput
              style={styles.input}
              placeholder="Enter email address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <BebaText category="body4" color={Palette.textSecondary}>Date of Birth</BebaText>
            <View style={styles.dateInput}>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                value={dateOfBirth}
                onChangeText={setDateOfBirth}
              />
              <TouchableOpacity style={styles.dateButton} onPress={() => {/* Would open date picker */}}>
                <Calendar size={20} color={Palette.primary} />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <BebaText category="body4" color={Palette.textSecondary}>Address</BebaText>
            <TextInput
              style={styles.input}
              placeholder="Enter full address"
              value={address}
              onChangeText={setAddress}
              multiline
              minHeight={80}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <BebaText category="h4" color={Palette.white}>Save Changes</BebaText>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Palette.background },
  scrollContent: { paddingHorizontal: Spacing.gutter, paddingBottom: 40 },
  sectionTitle: { marginVertical: 20 },
  
  formSection: { marginBottom: 24 },
  inputGroup: { marginBottom: 20 },
  input: {
    backgroundColor: Palette.gray100,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: Palette.textPrimary,
    fontSize: 16
  },
  dateInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  dateButton: {
    padding: 8,
    backgroundColor: Palette.gray100,
    borderRadius: 6
  },
  
  saveButton: {
    backgroundColor: Palette.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 24
  }
});

export default PersonalInfo;