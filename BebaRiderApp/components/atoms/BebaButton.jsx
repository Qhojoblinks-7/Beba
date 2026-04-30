import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Palette, Typography, Spacing } from "../../constants/theme";

// Fixed the parameter destructuring and function syntax
const BebaButton = ({
  title,
  onPress,
  loading = false, // fixed typo 'falese'
  secondary = false,
  danger = false,
  style,
}) => {
  
  const getBackgroundColor = () => {
    if (danger) return Palette.danger;
    if (secondary) return Palette.secondary;
    return Palette.primary;
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={loading}
      // Fixed 'stlye' typo to 'style' 
      // Changed 'StyleSheet.button' to 'styles.button'
      style={[
        styles.button,
        { backgroundColor: getBackgroundColor() },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={Palette.white} />
      ) : (
        // Changed 'StyleSheet.buttonText' to 'Typography.body2' (or your style)
        <Text style={Typography.body2}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

// Fixed 'e({ ... })' to 'StyleSheet.create({ ... })'
const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: Spacing.borderRadius,
    justifyContent: 'center',
    alignItems: 'center', // Added this to center the text
    paddingHorizontal: Spacing.padding,
    shadowColor: Palette.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  }
});

export default BebaButton;