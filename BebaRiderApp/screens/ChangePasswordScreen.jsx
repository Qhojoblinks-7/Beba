import React, { useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Eye, EyeOff, Lock } from 'lucide-react-native';
import BebaText from '../components/atoms/BebaText';
import { Palette, Spacing } from '../constants/theme';

const ChangePasswordScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [showPass, setShowPass] = useState({ old: false, new: false, confirm: false });
  const [passwords, setPasswords] = useState({ old: '', new: '', confirm: '' });

  const toggleVisibility = (field) => {
    setShowPass(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleUpdatePassword = () => {
    // TODO: Implement password update logic
    console.log('Update password');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color={Palette.textPrimary} />
        </TouchableOpacity>
        <BebaText category="h2">Security</BebaText>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <BebaText category="h3" style={styles.title}>Update Password</BebaText>
        <BebaText category="body4" color={Palette.textSecondary} style={styles.subtitle}>
          Your new password must be at least 8 characters long.
        </BebaText>

        <View style={styles.inputWrapper}>
          <Lock size={20} color={Palette.gray400} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Old Password"
            secureTextEntry={!showPass.old}
            placeholderTextColor={Palette.gray400}
            value={passwords.old}
            onChangeText={(text) => setPasswords(prev => ({ ...prev, old: text }))}
          />
          <TouchableOpacity onPress={() => toggleVisibility('old')}>
            {showPass.old ? (
              <EyeOff size={20} color={Palette.gray400} />
            ) : (
              <Eye size={20} color={Palette.gray400} />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.inputWrapper}>
          <Lock size={20} color={Palette.gray400} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="New Password"
            secureTextEntry={!showPass.new}
            placeholderTextColor={Palette.gray400}
            value={passwords.new}
            onChangeText={(text) => setPasswords(prev => ({ ...prev, new: text }))}
          />
          <TouchableOpacity onPress={() => toggleVisibility('new')}>
            {showPass.new ? (
              <EyeOff size={20} color={Palette.gray400} />
            ) : (
              <Eye size={20} color={Palette.gray400} />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.inputWrapper}>
          <Lock size={20} color={Palette.gray400} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Confirm New Password"
            secureTextEntry={!showPass.confirm}
            placeholderTextColor={Palette.gray400}
            value={passwords.confirm}
            onChangeText={(text) => setPasswords(prev => ({ ...prev, confirm: text }))}
          />
          <TouchableOpacity onPress={() => toggleVisibility('confirm')}>
            {showPass.confirm ? (
              <EyeOff size={20} color={Palette.gray400} />
            ) : (
              <Eye size={20} color={Palette.gray400} />
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleUpdatePassword}>
          <BebaText category="h4" color={Palette.white}>Update Password</BebaText>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
  title: {
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 24,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Palette.gray200,
    paddingHorizontal: 16,
    marginBottom: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 56,
    color: Palette.textPrimary,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: Palette.secondary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
});

export default ChangePasswordScreen;
