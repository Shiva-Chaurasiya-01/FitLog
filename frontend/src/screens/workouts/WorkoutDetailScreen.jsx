import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import api, { getErrorMessage } from '../../api';
import AppButton from '../../components/AppButton';
import Card from '../../components/Card';
import Screen from '../../components/Screen';
import { colors } from '../../theme';
import { confirmAction, prettyDate, showMessage } from '../../utils';

export default function WorkoutDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const [workout, setWorkout] = useState(null);

  useEffect(() => {
    api
      .get(`/workouts/${id}`)
      .then((res) => setWorkout(res.data))
      .catch((err) => showMessage('Error', getErrorMessage(err)));
  }, [id]);

  function deleteWorkout() {
    confirmAction('Delete workout?', 'This cannot be undone.', async () => {
      try {
        await api.delete(`/workouts/${id}`);
        navigation.goBack();
      } catch (err) {
        showMessage('Error', getErrorMessage(err));
      }
    });
  }

  if (!workout) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  // Group sets by exercise: { "Bench Press": { exercise, sets: [...] } }
  const groups = {};
  for (const set of workout.sets) {
    if (!groups[set.exercise.id]) {
      groups[set.exercise.id] = { exercise: set.exercise, sets: [] };
    }
    groups[set.exercise.id].sets.push(set);
  }

  const totalVolume = workout.sets.reduce((sum, s) => sum + s.reps * s.weight_kg, 0);

  return (
    <Screen>
      <Text style={styles.title}>{workout.name}</Text>
      <Text style={styles.muted}>{prettyDate(workout.date)}</Text>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{workout.sets.length}</Text>
          <Text style={styles.statLabel}>Sets</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{Math.round(totalVolume)} kg</Text>
          <Text style={styles.statLabel}>Volume</Text>
        </View>
      </View>

      {workout.notes ? (
        <Card>
          <Text style={styles.muted}>{workout.notes}</Text>
        </Card>
      ) : null}

      {Object.values(groups).map((group) => (
        <Card key={group.exercise.id}>
          <Pressable
            style={styles.exerciseHeader}
            onPress={() => navigation.navigate('ExerciseProgress', { exercise: group.exercise })}
          >
            <Text style={styles.exerciseName}>{group.exercise.name}</Text>
            <View style={styles.progressLink}>
              <Text style={styles.linkText}>Progress</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.primaryLight} />
            </View>
          </Pressable>
          {group.sets.map((set, index) => (
            <View key={set.id} style={styles.setRow}>
              <Text style={styles.setNumber}>Set {index + 1}</Text>
              <Text style={styles.setText}>
                {set.weight_kg} kg × {set.reps}
              </Text>
            </View>
          ))}
        </Card>
      ))}

      <AppButton title="Delete Workout" variant="danger" onPress={deleteWorkout} style={{ marginTop: 8 }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '700',
  },
  muted: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 16,
  },
  stat: {
    flex: 1,
    backgroundColor: colors.primarySoft,
    borderRadius: 14,
    padding: 14,
  },
  statValue: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    color: colors.primaryLight,
    fontSize: 13,
    marginTop: 2,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  exerciseName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  progressLink: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkText: {
    color: colors.primaryLight,
    fontSize: 13,
  },
  setRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  setNumber: {
    color: colors.textMuted,
  },
  setText: {
    color: colors.text,
    fontWeight: '600',
  },
});
