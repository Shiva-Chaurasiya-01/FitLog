import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getErrorMessage } from '../../api';
import AppButton from '../../components/AppButton';
import AppInput from '../../components/AppInput';
import Screen from '../../components/Screen';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(getErrorMessage(err));
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <Screen style={styles.content}>
        <Text style={styles.logo}>
          Fit<Text style={styles.logoPurple}>Log</Text>
        </Text>
        <Text style={styles.subtitle}>Track your workouts and nutrition</Text>

        <AppInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <AppInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Your password"
          secureTextEntry
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <AppButton title="Log In" onPress={handleLogin} loading={loading} />

        <Text style={styles.switchText} onPress={() => navigation.navigate('Register')}>
          Don't have an account? <Text style={styles.link}>Sign up</Text>
        </Text>
      </Screen>
    </SafeAreaView>
  );
}

export const authStyles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  logo: {
    color: colors.text,
    fontSize: 42,
    fontWeight: '800',
    textAlign: 'center',
  },
  logoPurple: {
    color: colors.primary,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 15,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 36,
  },
  error: {
    color: colors.danger,
    marginBottom: 12,
  },
  switchText: {
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 20,
  },
  link: {
    color: colors.primaryLight,
    fontWeight: '600',
  },
});

const styles = authStyles;
