import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { colors } from '../theme';

// variant: "primary" (purple), "outline" or "danger"
export default function AppButton({ title, onPress, variant = 'primary', loading = false, style }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      style={({ pressed }) => [
        styles.button,
        variant === 'primary' && styles.primary,
        variant === 'outline' && styles.outline,
        variant === 'danger' && styles.danger,
        pressed && { opacity: 0.8 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.text} />
      ) : (
        <Text style={[styles.text, variant === 'danger' && { color: colors.danger }]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  outline: {
    borderWidth: 1,
    borderColor: colors.primary,
  },
  danger: {
    borderWidth: 1,
    borderColor: colors.danger,
  },
  text: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});
