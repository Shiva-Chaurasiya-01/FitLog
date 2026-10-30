import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import api, { getErrorMessage } from '../../api';
import AppButton from '../../components/AppButton';
import { colors } from '../../theme';
import { prettyDate } from '../../utils';

export default function WorkoutsScreen({ navigation }) {
  const [workouts, setWorkouts] = useState([]);
  const [error, setError] = useState('');

  useFocusEffect(
    useCallback(() => {
      api
        .get('/workouts')
        .then((res) => {
          setWorkouts(res.data);
          setError('');
        })
        .catch((err) => setError(getErrorMessage(err)));
    }, [])
  );

  function renderWorkout({ item }) {
    // Count how many different exercises are in this workout
    const exerciseNames = [...new Set(item.sets.map((s) => s.exercise.name))];

    return (
      <Pressable style={styles.card} onPress={() => navigation.navigate('WorkoutDetail', { id: item.id })}>
        <View style={styles.cardTop}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.date}>{prettyDate(item.date)}</Text>
        </View>
        <Text style={styles.info}>
          {exerciseNames.length} {exerciseNames.length === 1 ? 'exercise' : 'exercises'} · {item.sets.length}{' '}
          {item.sets.length === 1 ? 'set' : 'sets'}
        </Text>
        {exerciseNames.length > 0 ? (
          <Text style={styles.exercises} numberOfLines={1}>
            {exerciseNames.join(', ')}
          </Text>
        ) : null}
      </Pressable>
    );
  }

  return (
    <View style={styles.screen}>
      <AppButton title="+ New Workout" onPress={() => navigation.navigate('AddWorkout')} style={styles.newButton} />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <FlatList
        data={workouts}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderWorkout}
        contentContainerStyle={{ paddingBottom: 30 }}
        ListEmptyComponent={<Text style={styles.empty}>No workouts logged yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  newButton: {
    marginBottom: 16,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    padding: 16,
    marginBottom: 12,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  name: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
    flex: 1,
  },
  date: {
    color: colors.textMuted,
    fontSize: 13,
  },
  info: {
    color: colors.primaryLight,
    fontSize: 14,
  },
  exercises: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 4,
  },
  empty: {
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 40,
  },
  error: {
    color: colors.danger,
    marginBottom: 12,
  },
});
