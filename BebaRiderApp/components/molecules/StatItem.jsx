import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Palette, Spacing} from "../../constants/theme";
import BebaText from '../atoms/BebaText';

/**
 * @param {string} label - The description (e.g "Distance")
 * @param {string} value - the data (e.g 24.4 kim)
 * @param {string} subVAlue - optional secondary data (e.g "+2.4 today")
 * @param {boolean} highlight- if true, uses the forest green for the value
 * 
 * */


const StatItem = ({label, value, subValue, highlight}) => {
    return (
        <View style={styles.container}>
            <BebaText category="body3" color={Palette.placeholder} style={styles.label }>
                {label.toUpperCase()}
            </BebaText>

            <BebaText category="h3" color={highlight ? Palette.success : Palette.textPrimary} style={styles.value}>
                {value}
            </BebaText>

            {subValue && (
                <BebaText category="body3" color={Palette.placeholder} style={styles.subValue}>
                    {subValue}
                </BebaText>
            )}
        </View>
    )
};

const styles = StyleSheet.create({
  container: {
    flex: 1, // Allows items to distribute evenly in a row
    paddingVertical: Spacing.padding,
    alignItems: 'flex-start',
  },
  label: {
    letterSpacing: 1, // Professional tech-aesthetic
    marginBottom: 4,
  },
  value: {
    marginVertical: 4,
  },
  subValue: {
    marginTop: 2,
  },
});

export default StatItem;