import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { Palette, Spacing } from '../../constants/theme';
import BebaText from '../atoms/BebaText';

const { width } = Dimensions.get('window');

const EarningsChart = ({ data = [], onBarPress }) => {
  const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const currentDayLabel = days[new Date().getDay()];

  const [activeBarIndex, setActiveBarIndex] = React.useState(null);

  // We find the max value to keep the bars stretched
  const maxVal = data.length > 0 ? Math.max(...data.map(d => d.y)) : 100;

  const chartData = data.map((item, index) => {
    const isToday = item.x === currentDayLabel;
    const isActive = activeBarIndex === index;
    const isSelected = isActive || isToday;

    return {
      value: item.y,
      label: item.x,
      showGradient: true, 
      frontColor: Palette.primary, 
      gradientColor: '#006D28',    
      
      // We wrap the text in a container with a fixed height and negative margin
      // This forces the library to render it exactly at the bar's tip
      topLabelComponent: () => (
        <View style={styles.stickyLabelWrapper}>
          <BebaText 
            category="body4" 
            style={styles.labelText}
            color={isSelected ? Palette.primary : Palette.gray500}
          >
            {item.y > 0 ? item.y : ''}
          </BebaText>
        </View>
      ),
      labelTextStyle: {
        color: isSelected ? Palette.black : Palette.gray400,
        fontSize: 12,
        fontWeight: isSelected ? '700' : '400'
      },
      onPress: () => {
        setActiveBarIndex(index);
        if (onBarPress) onBarPress(item, index);
      },
    };
  });

  return (
    <View style={styles.container}>
      <View style={styles.chartWrapper}>
        <BarChart
          data={chartData}
          barWidth={50}
          noOfSections={4}
          barBorderRadius={10}
          yAxisThickness={0}
          xAxisThickness={0}
          hideRules
          hideYAxisText
          spacing={20}
          height={180} 
          maxValue={maxVal + 5} // Tight ceiling to keep bars stretched
          width={width}
          isAnimated
          animationDuration={800}
          initialSpacing={0}
          showGradient
          isThreeD={false}
          // This ensures the labels don't drift as the bars get taller
          labelsExtraHeight={0} 
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Palette.white,
    paddingTop: Spacing.padding -30,
    paddingHorizontal: 0,
    marginLeft: 0,
    marginRight: 0,
  },
  chartWrapper: {
    alignItems: 'flex-start',
    marginBottom: Spacing.padding,
    width: width,
    marginLeft: 0,
  },
  stickyLabelWrapper: {
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    // Using a negative marginBottom pulls the label down into the bar's "zone"
    // so it doesn't float away as the value increases
    marginBottom: - 10, 
    width: 40,
  },
  labelText: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  }
});

export default EarningsChart;