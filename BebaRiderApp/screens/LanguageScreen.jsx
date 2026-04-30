import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Check } from 'lucide-react-native';
import BebaText from '../components/atoms/BebaText';
import { Palette, Spacing } from '../constants/theme';

const languages = [
  { id: 'en', label: 'English', sub: 'Default' },
  { id: 'tw', label: 'Twi', sub: 'Akan' },
  { id: 'ga', label: 'Ga', sub: 'Accra Region' },
  { id: 'ha', label: 'Hausa', sub: 'Northern Region' },
  { id: 'ew', label: 'Ewe', sub: 'Volta Region' },
  { id: 'dy', label: 'Dagbani', sub: 'Northern Region' },
];

const LanguageScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState('en');

  const handleSelectLanguage = (langId) => {
    setSelected(langId);
    // TODO: Persist language selection and update app locale
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color={Palette.textPrimary} />
        </TouchableOpacity>
        <BebaText category="h2">Language</BebaText>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <BebaText category="body4" color={Palette.textSecondary} style={styles.intro}>
          Select your preferred language. This will update the app's text throughout.
        </BebaText>

        {languages.map((lang) => (
          <TouchableOpacity
            key={lang.id}
            style={[styles.langCard, selected === lang.id && styles.selectedCard]}
            onPress={() => handleSelectLanguage(lang.id)}
          >
            <View>
              <BebaText category="h4" style={selected === lang.id && styles.selectedText}>
                {lang.label}
              </BebaText>
              <BebaText category="body4" color={Palette.textSecondary}>
                {lang.sub}
              </BebaText>
            </View>
            {selected === lang.id && (
              <View style={styles.checkCircle}>
                <Check size={16} color={Palette.white} />
              </View>
            )}
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={styles.applyButton}
          onPress={() => navigation.goBack()}
        >
          <BebaText category="h4" color={Palette.white}>
            Apply Language
          </BebaText>
        </TouchableOpacity>
      </View>
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
    borderBottomWidth: 1,
    borderBottomColor: Palette.gray200,
  },
  content: {
    flex: 1,
    padding: Spacing.padding,
  },
  intro: {
    marginBottom: 20,
  },
  langCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Palette.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Palette.gray200,
  },
  selectedCard: {
    borderColor: Palette.primary,
    backgroundColor: 'rgba(0, 166, 62, 0.05)',
  },
  selectedText: {
    color: Palette.primary,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Palette.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyButton: {
    backgroundColor: Palette.secondary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
});

export default LanguageScreen;
