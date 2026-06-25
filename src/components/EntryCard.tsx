import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS } from '../constants/colors';
import type { Entry } from '../types/entry';

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

function formatDay(date: Date) {
  return {
    day: String(date.getDate()).padStart(2, '0'),
    weekday: WEEKDAYS[date.getDay()],
  };
}

type Props = {
  entry: Entry;
  onPress: (entry: Entry) => void;
};

export function EntryCard({ entry, onPress }: Props) {
  const { day, weekday } = formatDay(entry.date);

  return (
    <Pressable style={styles.card} onPress={() => onPress(entry)}>
      <View style={styles.dateColumn}>
        <Text style={styles.weekday}>{weekday}</Text>
        <Text style={styles.day}>{day}</Text>
      </View>
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.icon}>{entry.icon}</Text>
          <Text style={styles.title} numberOfLines={1}>
            {entry.title || '(無題)'}
          </Text>
        </View>
        {entry.body.length > 0 && (
          <Text style={styles.excerpt} numberOfLines={2}>
            {entry.body}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: 16,
    backgroundColor: COLORS.CARD,
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  dateColumn: {
    alignItems: 'center',
    width: 44,
    paddingTop: 2,
  },
  weekday: {
    fontSize: 11,
    color: COLORS.SUB,
  },
  day: {
    fontSize: 22,
    fontWeight: '600',
    color: COLORS.INK,
    marginTop: 2,
  },
  body: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  icon: {
    fontSize: 16,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.INK,
  },
  excerpt: {
    fontSize: 13,
    color: COLORS.SUB,
    marginTop: 6,
    lineHeight: 20,
  },
});
