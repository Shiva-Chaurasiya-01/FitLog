import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import api, { getErrorMessage } from '../api';
import AppButton from '../components/AppButton';
import AppInput from '../components/AppInput';
import Card from '../components/Card';
import ChipGroup from '../components/ChipGroup';
import Screen from '../components/Screen';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';
import { showMessage } from '../utils';

const GOALS = [
  { value: 'lose', label: 'Lose weight' },
  { value: 'maintain', label: 'Maintain' },
  { value: 'gain', label: 'Gain muscle' },
];

const ACTIVITY = [
  { value: 'low', label: 'Low' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'high', label: 'High' },
];

// Number -> text for the inputs (empty if not set)
function toText(value) {
  return value === null || value === undefined ? '' : String(value);
}

export default function ProfileScreen() {
  const { user, setUser, logout } = useAuth();
  const [form, setForm] = useState({
    name: user.name,
    age: toText(user.age),
    height_cm: toText(user.height_cm),
    goal: user.goal,
    activity_level: user.activity_level,
    calorie_target: toText(user.calorie_target),
    protein_target: toText(user.protein_target),
    carbs_target: toText(user.carbs_target),
    fat_target: toText(user.fat_target),
  });
  const [saving, setSaving] = useState(false);

  function update(field, value) {
    setForm({ ...form, [field]: value });
  }

  async function saveProfile() {
    setSaving(true);
    try {
      const res = await api.put('/auth/me', {
        name: form.name,
        age: form.age ? parseInt(form.age, 10) : null,
        height_cm: form.height_cm ? parseFloat(form.height_cm) : null,
        goal: form.goal,
        activity_level: form.activity_level,
        calorie_target: parseInt(form.calorie_target, 10) || 2000,
        protein_target: parseInt(form.protein_target, 10) || 0,
        carbs_target: parseInt(form.carbs_target, 10) || 0,
        fat_target: parseInt(form.fat_target, 10) || 0,
      });
      setUser(res.data);
      showMessage('Saved', 'Your profile was updated');
    } catch (err) {
      showMessage('Could not save', getErrorMessage(err));
    }
    setSaving(false);
  }

  return (
    <Screen>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
      </View>

      <Card title="Personal details">
        <AppInput label="Name" value={form.name} onChangeText={(v) => update('name', v)} />
        <View style={styles.row}>
          <AppInput label="Age" value={form.age} onChangeText={(v) => update('age', v)} keyboardType="numeric" style={styles.half} />
          <AppInput label="Height (cm)" value={form.height_cm} onChangeText={(v) => update('height_cm', v)} keyboardType="numeric" style={styles.half} />
        </View>
        <Text style={styles.label}>Goal</Text>
        <ChipGroup options={GOALS} selected={form.goal} onSelect={(v) => update('goal', v)} />
        <Text style={styles.label}>Activity level</Text>
        <ChipGroup options={ACTIVITY} selected={form.activity_level} onSelect={(v) => update('activity_level', v)} />
      </Card>

      <Card title="Daily targets">
        <AppInput label="Calories (kcal)" value={form.calorie_target} onChangeText={(v) => update('calorie_target', v)} keyboardType="numeric" />
        <View style={styles.row}>
          <AppInput label="Protein (g)" value={form.protein_target} onChangeText={(v) => update('protein_target', v)} keyboardType="numeric" style={styles.third} />
          <AppInput label="Carbs (g)" value={form.carbs_target} onChangeText={(v) => update('carbs_target', v)} keyboardType="numeric" style={styles.third} />
          <AppInput label="Fat (g)" value={form.fat_target} onChangeText={(v) => update('fat_target', v)} keyboardType="numeric" style={styles.third} />
        </View>
      </Card>

      <AppButton title="Save Profile" onPress={saveProfile} loading={saving} style={{ marginBottom: 12 }} />
      <AppButton title="Log Out" variant="danger" onPress={logout} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  avatarText: {
    color: colors.text,
    fontSize: 30,
    fontWeight: '800',
  },
  name: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  email: {
    color: colors.textMuted,
    marginTop: 2,
  },
  label: {
    color: colors.textMuted,
    fontSize: 13,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  half: {
    flex: 1,
  },
  third: {
    flex: 1,
  },
});
