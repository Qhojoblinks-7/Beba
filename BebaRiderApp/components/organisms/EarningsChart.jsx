import React, { useState, useMemo } from 'react';
import { View, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { Palette } from '../../constants/theme';
import BebaText from '../atoms/BebaText';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const EarningsChart = ({ data = [], onBarPress }) => {
  const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const currentDayLabel = days[new Date().getDay()];
  
  const [activeBarIndex, setActiveBarIndex] = useState(null);

  const chartHeight = 220;
  const maxDataValue = data.length > 0 ? Math.max(...data.map(d => d.y)) : 100;
  const adjustedMaxValue = maxDataValue / 0.7;

  // Define fixed spacing and bar width to force a total width larger than the screen
  const BAR_WIDTH = 55;
  const SPACING = 25;
  const TOTAL_CHART_WIDTH = (BAR_WIDTH + SPACING) * data.length + 40; // + padding

  const chartData = useMemo(() => {
    return data.map((item, index) => {
      const isToday = item.x === currentDayLabel;
      const isActive = activeBarIndex === index || (activeBarIndex === null && isToday);
      
      return {
        value: item.y,
        label: item.x,
        frontColor: isActive ? '#1A4D4D' : '#2f6666', 
        gradientColor: isActive ? '#1A4D4D' : '#ebffff',
        showGradient: true,
        
        topLabelComponent: () => isActive ? (
          <View style={styles.tooltipContainer}>
            <View style={styles.pillLabel}>
              <BebaText category="body4" style={styles.pillText}>
                {item.y}
              </BebaText>
            </View>
            <View style={styles.indicatorDot} />
          </View>
        ) : null,

        onPress: () => {
          setActiveBarIndex(index);
          if (onBarPress) onBarPress(item, index);
        },
      };
    });
  }, [data, activeBarIndex, currentDayLabel]);

  return (
    <View style={styles.container}>
      {/* 
        Wrapping in a horizontal ScrollView allows you to swipe 
        through the days if the total width exceeds the screen.
      */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        <BarChart
          data={chartData}
          barWidth={BAR_WIDTH}
          spacing={SPACING}
          initialSpacing={20}
          height={chartHeight}
          maxValue={adjustedMaxValue}
          width={TOTAL_CHART_WIDTH}
          
          barBorderRadius={20} 
          hideAxesAndRules
          hideYAxisText
          yAxisThickness={0}
          xAxisThickness={0}
          
          isAnimated
          animationDuration={600}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F4F7F7', 
    paddingVertical: 20,
    borderRadius: 20,
  },
  scrollContainer: {
    paddingRight: 40, // Extra space at the end of the scroll
    alignItems: 'center',
  },
  tooltipContainer: {
    alignItems: 'center',
    marginBottom: 6,
    width: 60,
  },
  pillLabel: {
    backgroundColor: Palette.white,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  pillText: {
    color: Palette.black,
    fontSize: 13,
    fontWeight: '800',
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Palette.white,
    borderWidth: 2,
    borderColor: '#1A4D4D',
    marginTop: 2,
  },
});

export default EarningsChart;