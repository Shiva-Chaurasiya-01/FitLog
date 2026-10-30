import { StyleSheet, Text, TextInput, View } from 'react-native';

import { colors } from '../theme';

export default function AppInput({ label, style, ...props }) {
  return (
    <View style={[styles.wrapper, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput style={styles.input} placeholderTextColor={colors.textMuted} {...props} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 14,
    minWidth: 0,
  },
  label: {
    color: colors.textMuted,
    fontSize: 13,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.input,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    color: colors.text,
    fontSize: 16,
    paddingHorizontal: 14,
    height: 48,
    minWidth: 0,
  },
});
