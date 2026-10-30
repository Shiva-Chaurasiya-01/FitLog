import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import api, { getErrorMessage } from '../../api';
import BarChart from '../../components/BarChart';
import Card from '../../components/Card';
import ProgressBar from '../../components/ProgressBar';
import Screen from '../../components/Screen';
import { colors } from '../../theme';
import { addDays, confirmAction, prettyDate, showMessage, today } from '../../utils';

const MEALS = [
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'snack', label: 'Snacks' },
];

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function NutritionScreen({ navigation }) {
  const [day, setDay] = useState(today());
  const [logs, setLogs] = useState([]);
  const [summary, setSummary] = useState(null);
  const [week, setWeek] = useState([]);

  function loadData() {
    Promise.all([
      api.get('/food-logs', { params: { day } }),
      api.get('/nutrition/summary', { params: { day } }),
      api.get('/nutrition/week'),
    ])
      .then(([logsRes, summaryRes, weekRes]) => {
        setLogs(logsRes.data);
        setSummary(summaryRes.data);
        setWeek(weekRes.data);
      })
      .catch((err) => showMessage('Error', getErrorMessage(err)));
  }

  // Reload when the tab is opened or the day changes
  useFocusEffect(useCallback(loadData, [day]));

  function deleteLog(log) {
    confirmAction('Remove food?', `Remove ${log.food.name} from ${log.meal}?`, async () => {
      await api.delete(`/food-logs/${log.id}`);
      loadData();
    });
  }

  return (
    <Screen>
      {/* Day switcher */}
      <View style={styles.dayRow}>
        <Pressable onPress={() => setDay(addDays(day, -1))} style={styles.arrow}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.dayText}>{day === today() ? 'Today' : prettyDate(day)}</Text>
        <Pressable onPress={() => setDay(addDays(day, 1))} style={styles.arrow}>
          <Ionicons name="chevron-forward" size={22} color={colors.text} />
        </Pressable>
      </View>

      {/* Totals */}
      {summary ? (
        <Card>
          <ProgressBar
            label="Calories"
            value={summary.totals.calories}
            target={summary.targets.calories}
            unit="kcal"
          />
          <ProgressBar label="Protein" value={summary.totals.protein} target={summary.targets.protein} color={colors.protein} />
          <ProgressBar label="Carbs" value={summary.totals.carbs} target={summary.targets.carbs} color={colors.carbs} />
          <ProgressBar label="Fat" value={summary.totals.fat} target={summary.targets.fat} color={colors.fat} />
        </Card>
      ) : null}

      {/* Meals */}
      {MEALS.map((meal) => {
        const mealLogs = logs.filter((log) => log.meal === meal.value);
        const mealCalories = mealLogs.reduce((sum, log) => sum + log.food.calories * log.servings, 0);

        return (
          <Card key={meal.value}>
            <View style={styles.mealHeader}>
              <Text style={styles.mealTitle}>{meal.label}</Text>
              <Text style={styles.mealCalories}>{Math.round(mealCalories)} kcal</Text>
            </View>

            {mealLogs.map((log) => (
              <Pressable key={log.id} style={styles.logRow} onLongPress={() => deleteLog(log)}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.foodName}>{log.food.name}</Text>
                  <Text style={styles.foodInfo}>
                    {log.servings} × {log.food.serving} · P {Math.round(log.food.protein * log.servings)}g · C{' '}
                    {Math.round(log.food.carbs * log.servings)}g · F {Math.round(log.food.fat * log.servings)}g
                  </Text>
                </View>
                <Text style={styles.foodCalories}>{Math.round(log.food.calories * log.servings)}</Text>
                <Pressable onPress={() => deleteLog(log)} style={{ paddingLeft: 10 }}>
                  <Ionicons name="close" size={18} color={colors.textMuted} />
                </Pressable>
              </Pressable>
            ))}

            <Pressable onPress={() => navigation.navigate('AddFood', { meal: meal.value, day })}>
              <Text style={styles.addFood}>+ Add food</Text>
            </Pressable>
          </Card>
        );
      })}

      {/* Weekly chart */}
      <Card title="Last 7 days (kcal)">
        <BarChart
          data={week.map((d) => ({
            label: DAY_NAMES[new Date(d.date + 'T00:00:00').getDay()],
            value: d.calories,
          }))}
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  arrow: {
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 8,
  },
  dayText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  mealTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  mealCalories: {
    color: colors.primaryLight,
    fontWeight: '600',
  },
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  foodName: {
    color: colors.text,
    fontSize: 15,
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
  addFood: {
    color: colors.primaryLight,
    fontWeight: '600',
    paddingTop: 10,
  },
});
