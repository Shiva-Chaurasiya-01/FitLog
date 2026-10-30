import { ActivityIndicator, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';

import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import MetricsScreen from '../screens/MetricsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AddFoodScreen from '../screens/nutrition/AddFoodScreen';
import CustomFoodScreen from '../screens/nutrition/CustomFoodScreen';
import NutritionScreen from '../screens/nutrition/NutritionScreen';
import AddWorkoutScreen from '../screens/workouts/AddWorkoutScreen';
import ExerciseProgressScreen from '../screens/workouts/ExerciseProgressScreen';
import WorkoutDetailScreen from '../screens/workouts/WorkoutDetailScreen';
import WorkoutsScreen from '../screens/workouts/WorkoutsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Same dark header style for every screen
const headerStyle = {
  headerStyle: { backgroundColor: colors.background },
  headerTintColor: colors.text,
  headerTitleStyle: { fontWeight: '700' },
  headerShadowVisible: false,
  contentStyle: { backgroundColor: colors.background },
};

const TAB_ICONS = {
  Home: 'home',
  Workouts: 'barbell',
  Nutrition: 'restaurant',
  Body: 'body',
  Profile: 'person',
};

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        ...headerStyle,
        sceneStyle: { backgroundColor: colors.background },
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarIcon: ({ color, size }) => <Ionicons name={TAB_ICONS[route.name]} size={size} color={color} />,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'FitLog' }} />
      <Tab.Screen name="Workouts" component={WorkoutsScreen} />
      <Tab.Screen name="Nutrition" component={NutritionScreen} />
      <Tab.Screen name="Body" component={MetricsScreen} options={{ title: 'Body Metrics', tabBarLabel: 'Body' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();

  // Waiting to check if the user is already logged in
  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center' }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={headerStyle}>
      {user ? (
        <>
          <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
          <Stack.Screen name="AddWorkout" component={AddWorkoutScreen} options={{ title: 'New Workout' }} />
          <Stack.Screen name="WorkoutDetail" component={WorkoutDetailScreen} options={{ title: 'Workout' }} />
          <Stack.Screen name="ExerciseProgress" component={ExerciseProgressScreen} options={{ title: 'Progress' }} />
          <Stack.Screen name="AddFood" component={AddFoodScreen} options={{ title: 'Add Food' }} />
          <Stack.Screen name="CustomFood" component={CustomFoodScreen} options={{ title: 'Custom Food' }} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
        </>
      )}
    </Stack.Navigator>
  );
}
