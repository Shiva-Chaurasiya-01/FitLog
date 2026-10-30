import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import api from '../../api';
import BarChart from '../../components/BarChart';
import Card from '../../components/Card';
import Screen from '../../components/Screen';
import { colors } from '../../theme';
import { prettyDate } from '../../utils';

export default function ExerciseProgressScreen({ route }) {
  const { exercise } = route.params;
  const [points, setPoints] = useState([]);

  useEffect(() => {
    api.get(`/exercises/${exercise.id}/progress`).then((res) => setPoints(res.data));
  }, [exercise.id]);

  // Only show the last 8 sessions in the chart
  const recent = points.slice(-8);
  const bestEver = points.reduce((best, p) => Math.max(best, p.best_weight), 0);

  return (
    <Screen>
      <Text style={styles.title}>{exercise.name}</Text>
      <Text style={styles.muted}>{exercise.muscle_group}</Text>

      <View style={styles.prBox}>
        <Text style={styles.prLabel}>Personal best</Text>
        <Text style={styles.prValue}>{bestEver} kg</Text>
      </View>

      <Card title="Best weight per session (kg)">
        <BarChart data={recent.map((p) => ({ label: p.date.slice(5), value: p.best_weight }))} />
      </Card>

      <Card title="History">
        {points.length === 0 ? <Text style={styles.muted}>No history yet</Text> : null}
        {[...points].reverse().map((p) => (
          <View key={p.date} style={styles.row}>
            <Text style={styles.muted}>{prettyDate(p.date)}</Text>
            <Text style={styles.rowValue}>
              {p.best_weight} kg · vol {Math.round(p.volume)}
            </Text>
          </View>
        ))}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '700',
  },
  muted: {
    color: colors.textMuted,
    fontSize: 14,
  },
  prBox: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 16,
    marginVertical: 16,
  },
  prLabel: {
    color: colors.text,
    fontSize: 14,
  },
  prValue: {
    color: colors.text,
    fontSize: 30,
    fontWeight: '800',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowValue: {
    color: colors.text,
    fontWeight: '600',
  },
});
