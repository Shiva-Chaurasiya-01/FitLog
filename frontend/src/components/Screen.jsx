import { ScrollView, StyleSheet } from 'react-native';

import { colors } from '../theme';

// Scrollable page with the dark background and padding
export default function Screen({ children, style }) {
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, style]}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
});
