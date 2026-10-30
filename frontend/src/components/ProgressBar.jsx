import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme';

// Shows "label   value / target unit" with a bar under it
export default function ProgressBar({ label, value, target, unit = 'g', color = colors.primary }) {
  const percent = target > 0 ? Math.min(value / target, 1) * 100 : 0;

  return (
    <View style={styles.wrapper}>
      <View style={styles.row}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>
          {Math.round(value)} / {target} {unit}
        </Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${percent}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: {
    color: colors.text,
    fontSize: 14,
  },
  value: {
    color: colors.textMuted,
    fontSize: 13,
  },
  track: {
    height: 8,
    backgroundColor: colors.input,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: 8,
    borderRadius: 4,
  },
});
