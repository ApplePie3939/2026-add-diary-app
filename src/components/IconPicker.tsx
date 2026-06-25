import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { COLORS } from '../constants/colors';
import { ICONS } from '../constants/icons';

type Props = {
  value: string;
  onChange: (icon: string) => void;
};

export function IconPicker({ value, onChange }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {ICONS.map((icon) => {
        const active = icon === value;
        return (
          <Pressable
            key={icon}
            onPress={() => onChange(icon)}
            style={[styles.chip, active && styles.chipActive]}
          >
            <Text style={styles.emoji}>{icon}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

// Invisible placeholder to keep layout consistent
export function IconPickerPlaceholder() {
  return <View style={styles.placeholder} />;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 4,
  },
  chip: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.CARD,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  chipActive: {
    borderColor: COLORS.ACCENT,
    backgroundColor: '#FBEFE3',
  },
  emoji: {
    fontSize: 22,
  },
  placeholder: {
    height: 56,
  },
});
