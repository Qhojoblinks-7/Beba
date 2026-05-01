import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar
} from 'react-native';
import { Palette } from '../constants/theme';
import BebaText from '../components/atoms/BebaText';
import useAuthStore from '../store/useAuthStore';
import { useLogin, useRegister } from '../query/hooks';
import { useNavigation, useRoute } from '@react-navigation/native';

const AuthScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  
  const type = route.params?.type || 'SIGN_IN';
  const isSignIn = type === 'SIGN_IN';

  // Dynamic Theme based on image_d380fd.png
  const theme = {
    bg: isSignIn ? Palette.primary : Palette.white,
    logoBg: isSignIn ? Palette.white : Palette.primary,
    logoText: isSignIn ? Palette.white : Palette.primary,
    cardBg: Palette.white,
    status: isSignIn ? 'light-content' : 'dark-content'
  };

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const { loginSuccess, setLoading, isLoading, setError, clearError } = useAuthStore();
  
  const loginMutation = useLogin();
  const registerMutation = useRegister();

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    clearError();

    try {
      let response;
      if (isSignIn) {
        response = await loginMutation.mutateAsync({ phoneNumber: email, password });
      } else {
        response = await registerMutation.mutateAsync({
          phone_number: email,
          password,
          password_confirm: confirmPassword,
        });
      }
      loginSuccess(response.user, response.access, response.refresh);
    } catch (err) {
      const message = err.response?.data?.detail || err.message || 'Authentication failed';
      Alert.alert('Authentication Failed', message);
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthType = () => {
    navigation.replace('Auth', { type: isSignIn ? 'SIGN_UP' : 'SIGN_IN' });
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.keyboardView, { backgroundColor: theme.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle={theme.status} />
      <ScrollView 
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        {/* Header with Dynamic Logo Colors */}
        <View style={styles.header}>
          <View style={[styles.logoPlaceholder, { backgroundColor: theme.logoBg }]} />
          <BebaText category="h1" color={theme.logoText}>
            Beba
          </BebaText>
        </View>

        {/* Slapping Card UI */}
        <View style={[styles.formCard, { backgroundColor: theme.cardBg }]}>
          <BebaText category="label" style={styles.inputLabel}>Phone Number</BebaText>
          <TextInput
            placeholder="Enter your phone number"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            placeholderTextColor={Palette.gray400}
            keyboardType="phone-pad"
          />

          <BebaText category="label" style={styles.inputLabel}>Password</BebaText>
          <TextInput
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            placeholderTextColor={Palette.gray400}
            secureTextEntry
          />

          {!isSignIn && (
            <>
              <BebaText category="label" style={styles.inputLabel}>Confirm Password</BebaText>
              <TextInput
                placeholder="Confirm your password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                style={styles.input}
                placeholderTextColor={Palette.gray400}
                secureTextEntry
              />
            </>
          )}

          {isSignIn && (
            <TouchableOpacity style={styles.forgotPassword}>
              <BebaText category="body4" color={Palette.gray500}>Forgot Password?</BebaText>
            </TouchableOpacity>
          )}

          <TouchableOpacity 
            style={[styles.mainButton, { backgroundColor: Palette.primary }]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            <BebaText category="h3" color="#FFFFFF">
              {isLoading ? 'Please wait...' : isSignIn ? 'Sign In' : 'Sign Up'}
            </BebaText>
          </TouchableOpacity>

          <View style={styles.footer}>
            <BebaText category="body4" color={Palette.gray500}>
              {isSignIn ? "Don't have an account? " : "Already have an account? "}
            </BebaText>
            <TouchableOpacity onPress={toggleAuthType}>
              <BebaText category="body4" color={Palette.primary} style={{ fontWeight: '700' }}>
                {isSignIn ? 'Sign Up' : 'Sign In'}
              </BebaText>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardView: { flex: 1 },
  container: { flexGrow: 1 },
  header: {
    height: 280, // Taller header as seen in image_d380fd.png
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoPlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 18,
    marginBottom: 12,
  },
  formCard: {
    flex: 1,
    borderTopLeftRadius: 35, // Aggressive rounded corners
    borderTopRightRadius: 35,
    paddingHorizontal: 28,
    paddingTop: 40,
    paddingBottom: 40,
    // Negative margin causes the card to overlap the header
    marginTop: -40, 
  },
  inputLabel: { 
    marginBottom: 8, 
    marginTop: 18,
    fontWeight: '600'
  },
  input: {
    borderWidth: 1,
    borderColor: Palette.border,
    borderRadius: 50,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#FAFAFA'
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: 12,
  },
  mainButton: {
    borderRadius: 15,
    padding: 18,
    alignItems: 'center',
    marginTop: 35,
    shadowColor: Palette.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },
});

export default AuthScreen;