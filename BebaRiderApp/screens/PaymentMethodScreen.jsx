import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, CreditCard, Plus, Check, Trash2 } from 'lucide-react-native';
import BebaText from '../components/atoms/BebaText';
import { Palette, Spacing } from '../constants/theme';

const PaymentMethodScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: 1,
      type: 'Mobile Money',
      details: '+233 24 722 7492 • MTN',
      isDefault: true,
      icon: '📱',
    },
    {
      id: 2,
      type: 'Cash',
      details: 'Pay on delivery',
      isDefault: false,
      icon: '💵',
    },
  ]);
  const [showAddOptions, setShowAddOptions] = useState(false);

  const handleSetDefault = (id) => {
    setPaymentMethods(paymentMethods.map(method => ({
      ...method,
      isDefault: method.id === id
    })));
  };

  const handleRemove = (id) => {
    const method = paymentMethods.find(m => m.id === id);
    Alert.alert(
      'Remove Payment Method',
      `Are you sure you want to remove ${method?.type}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => {
          setPaymentMethods(paymentMethods.filter(m => m.id !== id));
        }}
      ]
    );
  };

  const addNewMethod = (type) => {
    Alert.alert(
      'Add Payment Method',
      `This would open the flow to add ${type} as a payment method.`,
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color={Palette.textPrimary} />
        </TouchableOpacity>
        <BebaText category="h2">Payment Methods</BebaText>
        <TouchableOpacity onPress={() => setShowAddOptions(!showAddOptions)}>
          <Plus size={24} color={Palette.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <BebaText category="body4" color={Palette.textSecondary} style={styles.intro}>
          Manage how you receive payments for completed deliveries.
        </BebaText>

        {paymentMethods.map((method) => (
          <View
            key={method.id}
            style={[styles.paymentCard, method.isDefault && styles.defaultCard]}
          >
            <View style={styles.cardHeader}>
              <View style={styles.methodInfo}>
                <BebaText category="h3" style={styles.icon}>{method.icon}</BebaText>
                <View>
                  <BebaText category="h4">{method.type}</BebaText>
                  <BebaText category="body4" color={Palette.textSecondary}>
                    {method.details}
                  </BebaText>
                </View>
              </View>
              {method.isDefault && (
                <View style={styles.defaultBadge}>
                  <Check size={14} color={Palette.white} />
                  <BebaText category="body4" color={Palette.white} style={styles.badgeText}>
                    Default
                  </BebaText>
                </View>
              )}
            </View>

            <View style={styles.cardActions}>
              {!method.isDefault && (
                <TouchableOpacity onPress={() => handleSetDefault(method.id)}>
                  <BebaText category="body4" color={Palette.primary}>Set Default</BebaText>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={() => handleRemove(method.id)} disabled={method.isDefault}>
                <Trash2
                  size={18}
                  color={method.isDefault ? Palette.gray400 : Palette.danger}
                />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {showAddOptions && (
          <View style={styles.addOptions}>
            <BebaText category="h4" style={styles.addTitle}>Add Payment Method</BebaText>
            <TouchableOpacity
              style={styles.addOption}
              onPress={() => addNewMethod('Mobile Money')}
            >
              <BebaText category="h4">📱 Mobile Money</BebaText>
              <ChevronLeft size={20} color={Palette.gray400} style={{ transform: [{ rotate: '180deg' }] }} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.addOption}
              onPress={() => addNewMethod('Bank Account')}
            >
              <BebaText category="h4">🏦 Bank Account</BebaText>
              <ChevronLeft size={20} color={Palette.gray400} style={{ transform: [{ rotate: '180deg' }] }} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.addOption}
              onPress={() => addNewMethod('Cash')}
            >
              <BebaText category="h4">💵 Cash</BebaText>
              <ChevronLeft size={20} color={Palette.gray400} style={{ transform: [{ rotate: '180deg' }] }} />
            </TouchableOpacity>
          </View>
        )}
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
  paymentCard: {
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  methodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 32,
    marginRight: 12,
  },
  defaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 4,
  },
  badgeText: {
    fontSize: 11,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Palette.gray100,
  },
  addOptions: {
    backgroundColor: Palette.white,
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
  },
  addTitle: {
    marginBottom: 12,
  },
  addOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Palette.gray100,
  },
});

export default PaymentMethodScreen;
