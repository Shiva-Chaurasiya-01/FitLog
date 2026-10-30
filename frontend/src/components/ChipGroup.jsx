import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme';

// A row of buttons where only one can be selected (like radio buttons)
export default function ChipGroup({ options, selected, onSelect }) {
  return (
    <View style={styles.row}>
      {options.map((option) => {
        const isSelected = option.value === selected;
        return (
          <Pressable
            key={option.value}
            onPress={() => onSelect(option.value)}
            style={[styles.chip, isSelected && styles.chipSelected]}
          >
            <Text style={[styles.text, isSelected && styles.textSelected]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 14,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.input,
    marginRight: 8,
    marginBottom: 8,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  text: {
    color: colors.textMuted,
    fontSize: 14,
  },
  textSelected: {
    color: colors.text,
    fontWeight: '600',
  },
});
