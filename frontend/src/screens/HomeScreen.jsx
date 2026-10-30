import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import api, { getErrorMessage } from '../api';
import Card from '../components/Card';
import ProgressBar from '../components/ProgressBar';
import Screen from '../components/Screen';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';
import { prettyDate } from '../utils';

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  // Reload every time this tab is opened
  useFocusEffect(
    useCallback(() => {
      api
        .get('/dashboard')
        .then((res) => {
          setData(res.data);
          setError('');
        })
        .catch((err) => setError(getErrorMessage(err)));
    }, [])
  );

  if (!data) {
    return (
      <View style={styles.center}>
        {error ? <Text style={styles.error}>{error}</Text> : <ActivityIndicator color={colors.primary} />}
      </View>
    );
  }

  const { totals, targets } = data.today;
  const caloriesLeft = Math.round(targets.calories - totals.calories);

  return (
    <Screen>
      <Text style={styles.hello}>Hi, {user.name} 👋</Text>
      <Text style={styles.subtitle}>Here is your progress for today</Text>

      {/* Calories */}
      <Card>
        <Text style={styles.cardLabel}>Calories today</Text>
        <View style={styles.caloriesRow}>
          <Text style={styles.bigNumber}>{Math.round(totals.calories)}</Text>
          <Text style={styles.muted}> / {targets.calories} kcal</Text>
        </View>
        <Text style={styles.muted}>
          {caloriesLeft >= 0 ? `${caloriesLeft} kcal left` : `${-caloriesLeft} kcal over target`}
        </Text>
        <View style={{ marginTop: 16 }}>
          <ProgressBar label="Protein" value={totals.protein} target={targets.protein} color={colors.protein} />
          <ProgressBar label="Carbs" value={totals.carbs} target={targets.carbs} color={colors.carbs} />
          <ProgressBar label="Fat" value={totals.fat} target={targets.fat} color={colors.fat} />
        </View>
      </Card>

      {/* Stats */}
      <View style={styles.statsRow}>
        <StatBox label="Workouts this week" value={data.workouts_this_week} />
        <StatBox label="Total workouts" value={data.total_workouts} />
      </View>
      <View style={styles.statsRow}>
        <StatBox label="Current weight" value={data.latest_weight ? `${data.latest_weight} kg` : '-'} />
        <StatBox
          label="Weight change"
          value={
            data.weight_change === null
              ? '-'
              : `${data.weight_change > 0 ? '+' : ''}${data.weight_change} kg`
          }
        />
      </View>

      {/* Last workout */}
      <Card title="Last workout">
        {data.last_workout ? (
          <Pressable
            onPress={() => navigation.navigate('WorkoutDetail', { id: data.last_workout.id })}
          >
            <Text style={styles.workoutName}>{data.last_workout.name}</Text>
            <Text style={styles.muted}>
              {prettyDate(data.last_workout.date)} · {data.last_workout.sets.length} sets
            </Text>
          </Pressable>
        ) : (
          <Text style={styles.muted}>No workouts yet. Go to the Workouts tab to log one!</Text>
        )}
      </Card>
    </Screen>
  );
}

function StatBox({ label, value }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  error: {
    color: colors.danger,
    textAlign: 'center',
  },
  hello: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.textMuted,
    marginTop: 4,
    marginBottom: 18,
  },
  cardLabel: {
    color: colors.textMuted,
    fontSize: 14,
  },
  caloriesRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 4,
  },
  bigNumber: {
    color: colors.primaryLight,
    fontSize: 36,
    fontWeight: '800',
  },
  muted: {
    color: colors.textMuted,
    fontSize: 14,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.primarySoft,
    borderRadius: 16,
    padding: 16,
  },
  statValue: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
  },
  statLabel: {
    color: colors.primaryLight,
    fontSize: 13,
    marginTop: 4,
  },
  workoutName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
});
