import { useState } from 'react';
import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getErrorMessage } from '../../api';
import AppButton from '../../components/AppButton';
import AppInput from '../../components/AppInput';
import Screen from '../../components/Screen';
import { useAuth } from '../../context/AuthContext';
import { authStyles as styles } from './LoginScreen';

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!name || !email || !password) {
      setError('Please fill all fields');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await register(name.trim(), email.trim(), password);
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
        <Text style={styles.subtitle}>Create your account</Text>

        <AppInput label="Name" value={name} onChangeText={setName} placeholder="Your name" />
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
          placeholder="At least 6 characters"
          secureTextEntry
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <AppButton title="Sign Up" onPress={handleRegister} loading={loading} />

        <Text style={styles.switchText} onPress={() => navigation.goBack()}>
          Already have an account? <Text style={styles.link}>Log in</Text>
        </Text>
      </Screen>
    </SafeAreaView>
  );
}
