import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import api, { getErrorMessage } from '../../api';
import AppButton from '../../components/AppButton';
import AppInput from '../../components/AppInput';
import { colors } from '../../theme';
import { showMessage } from '../../utils';

export default function AddFoodScreen({ route, navigation }) {
  const { meal, day } = route.params;
  const [search, setSearch] = useState('');
  const [foods, setFoods] = useState([]);
  const [selected, setSelected] = useState(null);
  const [servings, setServings] = useState('1');
  const [saving, setSaving] = useState(false);

  // Search again whenever the text changes (also after coming back from "Create food")
  useFocusEffect(
    useCallback(() => {
      api
        .get('/foods', { params: { search } })
        .then((res) => setFoods(res.data))
        .catch((err) => showMessage('Error', getErrorMessage(err)));
    }, [search])
  );

  async function addFood() {
    const amount = parseFloat(servings);
    if (!amount || amount <= 0) {
      showMessage('Invalid servings', 'Enter a number like 1 or 1.5');
      return;
    }
    setSaving(true);
    try {
      await api.post('/food-logs', { food_id: selected.id, date: day, meal, servings: amount });
      navigation.goBack();
    } catch (err) {
      showMessage('Could not add', getErrorMessage(err));
      setSaving(false);
    }
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.mealText}>Adding to {meal}</Text>
      <AppInput value={search} onChangeText={setSearch} placeholder="Search foods (e.g. paneer)" />

      {/* Selected food + servings */}
      {selected ? (
        <View style={styles.selectedBox}>
          <Text style={styles.selectedName}>{selected.name}</Text>
          <Text style={styles.foodInfo}>
            Per {selected.serving}: {selected.calories} kcal · P {selected.protein}g · C {selected.carbs}g · F{' '}
            {selected.fat}g
          </Text>
          <View style={styles.servingsRow}>
            <Text style={styles.servingsLabel}>Servings</Text>
            <TextInput
              style={styles.servingsInput}
              value={servings}
              onChangeText={setServings}
              keyboardType="numeric"
            />
            <Text style={styles.totalCalories}>
              = {Math.round(selected.calories * (parseFloat(servings) || 0))} kcal
            </Text>
          </View>
          <AppButton title="Add" onPress={addFood} loading={saving} />
        </View>
      ) : null}

      <FlatList
        data={foods}
        keyExtractor={(item) => String(item.id)}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <Pressable
            style={[styles.foodRow, selected?.id === item.id && styles.foodRowSelected]}
            onPress={() => {
              setSelected(item);
              setServings('1');
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.foodName}>
                {item.name}
                {item.user_id ? <Text style={styles.customTag}>  custom</Text> : null}
              </Text>
              <Text style={styles.foodInfo}>{item.serving}</Text>
            </View>
            <Text style={styles.foodCalories}>{item.calories} kcal</Text>
          </Pressable>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No foods found</Text>}
        ListFooterComponent={
          <AppButton
            title="+ Create custom food"
            variant="outline"
            onPress={() => navigation.navigate('CustomFood')}
            style={{ marginTop: 16, marginBottom: 30 }}
          />
        }
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
  mealText: {
    color: colors.primaryLight,
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
    marginBottom: 10,
  },
  selectedBox: {
    backgroundColor: colors.primarySoft,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.primary,
    padding: 16,
    marginBottom: 14,
  },
  selectedName: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
  },
  servingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
    gap: 10,
  },
  servingsLabel: {
    color: colors.text,
  },
  servingsInput: {
    width: 70,
    height: 40,
    backgroundColor: colors.input,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    textAlign: 'center',
    fontSize: 15,
  },
  totalCalories: {
    color: colors.primaryLight,
    fontWeight: '700',
  },
  foodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  foodRowSelected: {
    borderColor: colors.primary,
  },
  foodName: {
    color: colors.text,
    fontSize: 15,
  },
  customTag: {
    color: colors.primaryLight,
    fontSize: 12,
  },
  foodInfo: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  foodCalories: {
    color: colors.text,
    fontWeight: '600',
  },
  empty: {
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 20,
  },
});
