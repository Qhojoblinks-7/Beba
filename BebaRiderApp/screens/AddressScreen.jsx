import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, MapPin, Plus, Trash2 } from 'lucide-react-native';
import BebaText from '../components/atoms/BebaText';
import { Palette, Spacing } from '../constants/theme';

const AddressScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [addresses, setAddresses] = useState([
    { id: 1, label: 'Home', address: '123 Independence Ave, Accra', isDefault: true },
    { id: 2, label: 'Work', address: '45 University Rd, Legon', isDefault: false },
  ]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddress, setNewAddress] = useState({ label: '', address: '' });

  const handleAddAddress = () => {
    if (!newAddress.label.trim() || !newAddress.address.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    setAddresses([...addresses, { id: Date.now(), ...newAddress, isDefault: false }]);
    setNewAddress({ label: '', address: '' });
    setShowAddForm(false);
  };

  const handleSetDefault = (id) => {
    setAddresses(addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === id
    })));
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Delete Address',
      'Are you sure you want to delete this address?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => {
          setAddresses(addresses.filter(addr => addr.id !== id));
        }}
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color={Palette.textPrimary} />
        </TouchableOpacity>
        <BebaText category="h2">Delivery Addresses</BebaText>
        <TouchableOpacity onPress={() => setShowAddForm(!showAddForm)}>
          <Plus size={24} color={Palette.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {showAddForm && (
          <View style={styles.addForm}>
            <BebaText category="h4" style={styles.formTitle}>Add New Address</BebaText>
            <TextInput
              style={styles.input}
              placeholder="Label (Home, Work, etc.)"
              placeholderTextColor={Palette.gray400}
              value={newAddress.label}
              onChangeText={(text) => setNewAddress({ ...newAddress, label: text })}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Full address"
              placeholderTextColor={Palette.gray400}
              multiline
              value={newAddress.address}
              onChangeText={(text) => setNewAddress({ ...newAddress, address: text })}
            />
            <TouchableOpacity style={styles.saveButton} onPress={handleAddAddress}>
              <BebaText category="h4" color={Palette.white}>Save Address</BebaText>
            </TouchableOpacity>
          </View>
        )}

        {addresses.map((addr) => (
          <View key={addr.id} style={[styles.addressCard, addr.isDefault && styles.defaultCard]}>
            <View style={styles.addressHeader}>
              <View style={styles.iconBox}>
                <MapPin size={20} color={addr.isDefault ? Palette.white : Palette.primary} />
              </View>
              <View style={styles.addressInfo}>
                <View style={styles.labelRow}>
                  <BebaText category="h4">{addr.label}</BebaText>
                  {addr.isDefault && (
                    <BebaText category="body4" color={Palette.primary} style={styles.defaultBadge}>
                      Default
                    </BebaText>
                  )}
                </View>
                <BebaText category="body4" color={Palette.textSecondary}>{addr.address}</BebaText>
              </View>
            </View>
            <View style={styles.addressActions}>
              {!addr.isDefault && (
                <TouchableOpacity onPress={() => handleSetDefault(addr.id)}>
                  <BebaText category="body4" color={Palette.primary}>Set Default</BebaText>
                </TouchableOpacity>
              )}
              {!addr.isDefault && (
                <TouchableOpacity onPress={() => handleDelete(addr.id)}>
                  <Trash2 size={18} color={Palette.danger} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
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
  addForm: {
    backgroundColor: Palette.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  formTitle: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: Palette.gray100,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: Palette.textPrimary,
    fontSize: 16,
    marginBottom: 12,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: Palette.secondary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  addressCard: {
    backgroundColor: Palette.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Palette.gray200,
  },
  defaultCard: {
    borderColor: Palette.primary,
    backgroundColor: 'rgba(0, 166, 62, 0.05)',
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 166, 62, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  addressInfo: {
    flex: 1,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  defaultBadge: {
    marginLeft: 8,
    fontSize: 11,
  },
  addressActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Palette.gray100,
  },
});

export default AddressScreen;
