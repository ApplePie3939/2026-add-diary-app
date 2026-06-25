import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { COLORS } from '../constants/colors';

type Props = {
  value: Date;
  onChange: (date: Date) => void;
};

function toInputString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatDisplay(date: Date): string {
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

function parseInput(text: string): Date | null {
  const match = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10) - 1;
  const day = parseInt(match[3], 10);
  const d = new Date(year, month, day);
  if (
    d.getFullYear() === year &&
    d.getMonth() === month &&
    d.getDate() === day
  ) {
    return d;
  }
  return null;
}

export function DatePicker({ value, onChange }: Props) {
  const [editing, setEditing] = useState(false);
  const [inputText, setInputText] = useState(toInputString(value));
  const [inputError, setInputError] = useState(false);

  const handleBlur = () => {
    const parsed = parseInput(inputText);
    if (parsed) {
      onChange(parsed);
      setInputError(false);
    } else {
      setInputError(true);
      setInputText(toInputString(value));
    }
    setEditing(false);
  };

  if (editing) {
    return (
      <View>
        <TextInput
          style={[styles.input, inputError && styles.inputError]}
          value={inputText}
          onChangeText={setInputText}
          onBlur={handleBlur}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={COLORS.PLACEHOLDER}
          keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'default'}
          autoFocus
          returnKeyType="done"
          onSubmitEditing={handleBlur}
        />
        {inputError && (
          <Text style={styles.errorText}>YYYY-MM-DD 形式で入力してください</Text>
        )}
      </View>
    );
  }

  return (
    <Pressable style={styles.trigger} onPress={() => { setInputText(toInputString(value)); setEditing(true); }}>
      <Text style={styles.triggerText}>{formatDisplay(value)}</Text>
      <Text style={styles.triggerHint}>タップして変更</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.CARD,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  triggerText: {
    fontSize: 16,
    color: COLORS.INK,
  },
  triggerHint: {
    fontSize: 12,
    color: COLORS.SUB,
  },
  input: {
    backgroundColor: COLORS.CARD,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: COLORS.INK,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  inputError: {
    borderColor: '#C0392B',
  },
  errorText: {
    fontSize: 12,
    color: '#C0392B',
    marginTop: 4,
  },
});
