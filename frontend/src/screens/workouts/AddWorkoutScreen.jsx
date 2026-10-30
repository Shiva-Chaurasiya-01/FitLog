import { useEffect, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import api, { getErrorMessage } from '../../api';
import AppButton from '../../components/AppButton';
import AppInput from '../../components/AppInput';
import Card from '../../components/Card';
import Screen from '../../components/Screen';
import { colors } from '../../theme';
import { showMessage, today } from '../../utils';

export default function AddWorkoutScreen({ navigation }) {
  const [name, setName] = useState('');
  const [date, setDate] = useState(today());
  const [notes, setNotes] = useState('');

  // Each item: { exercise: {id, name, muscle_group}, sets: [{ reps: '', weight: '' }] }
  const [items, setItems] = useState([]);

  const [allExercises, setAllExercises] = useState([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/exercises').then((res) => setAllExercises(res.data));
  }, []);

  function addExercise(exercise) {
    setItems([...items, { exercise, sets: [{ reps: '', weight: '' }] }]);
    setPickerOpen(false);
  }

  function removeExercise(index) {
    setItems(items.filter((_, i) => i !== index));
  }

  function addSet(index) {
    const copy = [...items];
    const lastSet = copy[index].sets[copy[index].sets.length - 1];
    // New set starts with the same numbers as the last one
    copy[index] = { ...copy[index], sets: [...copy[index].sets, { ...lastSet }] };
    setItems(copy);
  }

  function removeSet(index, setIndex) {
    const copy = [...items];
    copy[index] = { ...copy[index], sets: copy[index].sets.filter((_, i) => i !== setIndex) };
    setItems(copy);
  }

  function updateSet(index, setIndex, field, value) {
    const copy = [...items];
    const sets = [...copy[index].sets];
    sets[setIndex] = { ...sets[setIndex], [field]: value };
    copy[index] = { ...copy[index], sets };
    setItems(copy);
  }

  async function saveWorkout() {
    if (!name.trim()) {
      showMessage('Missing name', 'Please give your workout a name (e.g. Push Day)');
      return;
    }

    // Turn our screen data into what the backend wants
    const sets = [];
    for (const item of items) {
      for (const set of item.sets) {
        if (!set.reps) continue; // skip empty sets
        sets.push({
          exercise_id: item.exercise.id,
          reps: parseInt(set.reps, 10),
          weight_kg: parseFloat(set.weight) || 0,
        });
      }
    }
    if (sets.length === 0) {
      showMessage('No sets', 'Add at least one exercise with reps');
      return;
    }

    setSaving(true);
    try {
      await api.post('/workouts', { name: name.trim(), date, notes: notes || null, sets });
      navigation.goBack();
    } catch (err) {
      showMessage('Could not save', getErrorMessage(err));
      setSaving(false);
    }
  }

  return (
    <Screen>
      <AppInput label="Workout name" value={name} onChangeText={setName} placeholder="e.g. Push Day" />
      <AppInput label="Date (YYYY-MM-DD)" value={date} onChangeText={setDate} />
      <AppInput label="Notes (optional)" value={notes} onChangeText={setNotes} placeholder="How did it go?" />

      {items.map((item, index) => (
        <Card key={index}>
          <View style={styles.exerciseHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.exerciseName}>{item.exercise.name}</Text>
              <Text style={styles.muscle}>{item.exercise.muscle_group}</Text>
            </View>
            <Pressable onPress={() => removeExercise(index)}>
              <Ionicons name="trash-outline" size={20} color={colors.danger} />
            </Pressable>
          </View>

          <View style={styles.setRow}>
            <Text style={[styles.setHeader, { width: 40 }]}>Set</Text>
            <Text style={[styles.setHeader, { flex: 1 }]}>kg</Text>
            <Text style={[styles.setHeader, { flex: 1 }]}>Reps</Text>
            <View style={{ width: 30 }} />
          </View>

          {item.sets.map((set, setIndex) => (
            <View key={setIndex} style={styles.setRow}>
              <Text style={styles.setNumber}>{setIndex + 1}</Text>
              <TextInput
                style={styles.setInput}
                value={set.weight}
                onChangeText={(value) => updateSet(index, setIndex, 'weight', value)}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={colors.textMuted}
              />
              <TextInput
                style={styles.setInput}
                value={set.reps}
                onChangeText={(value) => updateSet(index, setIndex, 'reps', value)}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={colors.textMuted}
              />
              <Pressable style={{ width: 30, alignItems: 'center' }} onPress={() => removeSet(index, setIndex)}>
                <Ionicons name="close" size={20} color={colors.textMuted} />
              </Pressable>
            </View>
          ))}

          <Pressable onPress={() => addSet(index)}>
            <Text style={styles.addSet}>+ Add set</Text>
          </Pressable>
        </Card>
      ))}

      <AppButton title="+ Add Exercise" variant="outline" onPress={() => setPickerOpen(true)} style={{ marginBottom: 12 }} />
      <AppButton title="Save Workout" onPress={saveWorkout} loading={saving} />

      {/* Exercise picker */}
      <Modal visible={pickerOpen} animationType="none" transparent onRequestClose={() => setPickerOpen(false)}>
        <View style={styles.modalBackground}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose exercise</Text>
              <Pressable onPress={() => setPickerOpen(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </Pressable>
            </View>
            <FlatList
              data={allExercises}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <Pressable style={styles.pickerItem} onPress={() => addExercise(item)}>
                  <Text style={styles.pickerName}>{item.name}</Text>
                  <Text style={styles.muscle}>{item.muscle_group}</Text>
                </Pressable>
              )}
            />
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  exerciseName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  muscle: {
    color: colors.primaryLight,
    fontSize: 13,
    marginTop: 2,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  setHeader: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
  },
  setNumber: {
    width: 40,
    color: colors.text,
    textAlign: 'center',
    fontWeight: '600',
  },
  setInput: {
    flex: 1,
    minWidth: 0,
    height: 40,
    backgroundColor: colors.input,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    textAlign: 'center',
    fontSize: 15,
  },
  addSet: {
    color: colors.primaryLight,
    fontWeight: '600',
    textAlign: 'center',
    paddingTop: 8,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalBox: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '75%',
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  pickerItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pickerName: {
    color: colors.text,
    fontSize: 15,
  },
});
