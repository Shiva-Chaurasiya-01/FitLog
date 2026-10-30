import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import api, { getErrorMessage } from '../../api';
import AppButton from '../../components/AppButton';
import AppInput from '../../components/AppInput';
import Screen from '../../components/Screen';
import { showMessage } from '../../utils';

export default function CustomFoodScreen({ navigation }) {
  const [form, setForm] = useState({
    name: '',
    serving: '1 serving',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
  });
  const [saving, setSaving] = useState(false);

  function update(field, value) {
    setForm({ ...form, [field]: value });
  }

  async function saveFood() {
    if (!form.name.trim() || !form.calories) {
      showMessage('Missing info', 'Name and calories are required');
      return;
    }
    setSaving(true);
    try {
      await api.post('/foods', {
        name: form.name.trim(),
        serving: form.serving || '1 serving',
        calories: parseFloat(form.calories) || 0,
        protein: parseFloat(form.protein) || 0,
        carbs: parseFloat(form.carbs) || 0,
        fat: parseFloat(form.fat) || 0,
      });
      navigation.goBack();
    } catch (err) {
      showMessage('Could not save', getErrorMessage(err));
      setSaving(false);
    }
  }

  return (
    <Screen>
      <AppInput label="Food name" value={form.name} onChangeText={(v) => update('name', v)} placeholder="e.g. Mom's Paratha" />
      <AppInput label="Serving size" value={form.serving} onChangeText={(v) => update('serving', v)} placeholder="e.g. 1 piece, 100 g" />
      <AppInput label="Calories (kcal)" value={form.calories} onChangeText={(v) => update('calories', v)} keyboardType="numeric" />

      <View style={styles.row}>
        <AppInput label="Protein (g)" value={form.protein} onChangeText={(v) => update('protein', v)} keyboardType="numeric" style={styles.third} />
        <AppInput label="Carbs (g)" value={form.carbs} onChangeText={(v) => update('carbs', v)} keyboardType="numeric" style={styles.third} />
        <AppInput label="Fat (g)" value={form.fat} onChangeText={(v) => update('fat', v)} keyboardType="numeric" style={styles.third} />
      </View>

      <AppButton title="Save Food" onPress={saveFood} loading={saving} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  third: {
    flex: 1,
  },
});
