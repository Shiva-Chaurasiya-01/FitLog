import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme';

// A very simple bar chart made with Views.
// data = [{ label: 'Mon', value: 1800 }, ...]
export default function BarChart({ data, height = 140, color = colors.primary }) {
  if (data.length === 0) {
    return <Text style={styles.empty}>No data yet</Text>;
  }

  const max = Math.max(...data.map((item) => item.value), 1);

  return (
    <View style={[styles.chart, { height: height + 40 }]}>
      {data.map((item, index) => (
        <View key={index} style={styles.column}>
          <Text style={styles.value}>{Math.round(item.value * 10) / 10}</Text>
          <View style={[styles.bar, { height: (item.value / max) * height, backgroundColor: color }]} />
          <Text style={styles.label} numberOfLines={1}>
            {item.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  column: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginHorizontal: 3,
  },
  bar: {
    width: '70%',
    maxWidth: 36,
    minHeight: 2,
    borderRadius: 6,
  },
  value: {
    color: colors.textMuted,
    fontSize: 10,
    marginBottom: 4,
  },
  label: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 6,
  },
  empty: {
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: 20,
  },
});
