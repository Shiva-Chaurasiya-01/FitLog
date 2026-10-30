import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import api, { getErrorMessage } from '../api';
import AppButton from '../components/AppButton';
import AppInput from '../components/AppInput';
import BarChart from '../components/BarChart';
import Card from '../components/Card';
import Screen from '../components/Screen';
import { colors } from '../theme';
import { confirmAction, prettyDate, showMessage, today } from '../utils';

const EMPTY_FORM = { weight_kg: '', body_fat: '', chest_cm: '', waist_cm: '', arm_cm: '' };

export default function MetricsScreen() {
  const [metrics, setMetrics] = useState([]);
  const [date, setDate] = useState(today());
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  function loadMetrics() {
    api
      .get('/metrics')
      .then((res) => setMetrics(res.data))
      .catch((err) => showMessage('Error', getErrorMessage(err)));
  }

  useFocusEffect(useCallback(loadMetrics, []));

  function update(field, value) {
    setForm({ ...form, [field]: value });
  }

  // Empty text -> null, otherwise a number
  function toNumber(value) {
    return value === '' ? null : parseFloat(value);
  }

  async function saveEntry() {
    if (!form.weight_kg) {
      showMessage('Missing weight', 'Please enter your weight');
      return;
    }
    setSaving(true);
    try {
      await api.post('/metrics', {
        date,
        weight_kg: parseFloat(form.weight_kg),
        body_fat: toNumber(form.body_fat),
        chest_cm: toNumber(form.chest_cm),
        waist_cm: toNumber(form.waist_cm),
        arm_cm: toNumber(form.arm_cm),
      });
      setForm(EMPTY_FORM);
      loadMetrics();
    } catch (err) {
      showMessage('Could not save', getErrorMessage(err));
    }
    setSaving(false);
  }

  function deleteEntry(metric) {
    confirmAction('Delete entry?', `Delete entry from ${prettyDate(metric.date)}?`, async () => {
      await api.delete(`/metrics/${metric.id}`);
      loadMetrics();
    });
  }

  // Last 8 entries for the chart
  const chartData = metrics.slice(-8).map((m) => ({ label: m.date.slice(5), value: m.weight_kg }));

  return (
    <Screen>
      <Card title="Weight trend (kg)">
        <BarChart data={chartData} />
      </Card>

      <Card title="Add entry">
        <AppInput label="Date (YYYY-MM-DD)" value={date} onChangeText={setDate} />
        <View style={styles.row}>
          <AppInput label="Weight (kg)*" value={form.weight_kg} onChangeText={(v) => update('weight_kg', v)} keyboardType="numeric" style={styles.half} />
          <AppInput label="Body fat (%)" value={form.body_fat} onChangeText={(v) => update('body_fat', v)} keyboardType="numeric" style={styles.half} />
        </View>
        <View style={styles.row}>
          <AppInput label="Chest (cm)" value={form.chest_cm} onChangeText={(v) => update('chest_cm', v)} keyboardType="numeric" style={styles.third} />
          <AppInput label="Waist (cm)" value={form.waist_cm} onChangeText={(v) => update('waist_cm', v)} keyboardType="numeric" style={styles.third} />
          <AppInput label="Arm (cm)" value={form.arm_cm} onChangeText={(v) => update('arm_cm', v)} keyboardType="numeric" style={styles.third} />
        </View>
        <AppButton title="Save Entry" onPress={saveEntry} loading={saving} />
      </Card>

      <Card title="History">
        {metrics.length === 0 ? <Text style={styles.muted}>No entries yet</Text> : null}
        {[...metrics].reverse().map((m) => (
          <View key={m.id} style={styles.historyRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.historyWeight}>{m.weight_kg} kg</Text>
              <Text style={styles.muted}>
                {prettyDate(m.date)}
                {m.body_fat ? ` · ${m.body_fat}% fat` : ''}
                {m.waist_cm ? ` · waist ${m.waist_cm}` : ''}
                {m.chest_cm ? ` · chest ${m.chest_cm}` : ''}
                {m.arm_cm ? ` · arm ${m.arm_cm}` : ''}
              </Text>
            </View>
            <Pressable onPress={() => deleteEntry(m)}>
              <Ionicons name="trash-outline" size={18} color={colors.danger} />
            </Pressable>
          </View>
        ))}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
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
  muted: {
    color: colors.textMuted,
    fontSize: 13,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  historyWeight: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
});
