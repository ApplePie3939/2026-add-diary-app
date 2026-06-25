import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { useEntries } from '../../store/entries';
import { useAuth } from '../../store/auth';
import { EntryCard } from '../../components/EntryCard';
import { COLORS } from '../../constants/colors';
import type { Entry } from '../../types/entry';

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

function formatHeader(date: Date) {
  return `${date.getFullYear()}年 ${date.getMonth() + 1}月`;
}

function formatDay(date: Date) {
  return {
    day: String(date.getDate()).padStart(2, '0'),
    weekday: WEEKDAYS[date.getDay()],
  };
}

export default function HomeScreen() {
  const { entries, hasMore, isLoading, error, loadMore, reload } = useEntries();
  const { signOut } = useAuth();
  const [searchText, setSearchText] = useState('');
  const today = useMemo(() => new Date(), []);
  const { day: todayDay, weekday: todayWeekday } = formatDay(today);

  useEffect(() => {
    reload();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredEntries = useMemo(() => {
    if (!searchText.trim()) return entries;
    const lower = searchText.toLowerCase();
    return entries.filter(
      (e) =>
        e.title.toLowerCase().includes(lower) ||
        e.body.toLowerCase().includes(lower),
    );
  }, [entries, searchText]);

  const handleEntryPress = (entry: Entry) => {
    router.push(`/(app)/${entry.id}`);
  };

  const handleEndReached = () => {
    if (!searchText && hasMore && !isLoading) {
      loadMore();
    }
  };

  const renderFooter = () => {
    if (!isLoading) return null;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={COLORS.ACCENT} />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <FlatList
        data={filteredEntries}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <EntryCard entry={item} onPress={handleEntryPress} />
        )}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.3}
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <View>
                <Text style={styles.headerMonth}>{formatHeader(today)}</Text>
                <Text style={styles.headerTitle}>日記</Text>
              </View>
              <Pressable onPress={signOut} hitSlop={12}>
                <Text style={styles.signOutText}>ログアウト</Text>
              </Pressable>
            </View>

            <Pressable style={styles.todayCard} onPress={() => router.push('/(app)/new')}>
              <View style={styles.todayDateColumn}>
                <Text style={styles.todayWeekday}>{todayWeekday}</Text>
                <Text style={styles.todayDay}>{todayDay}</Text>
              </View>
              <View style={styles.todayBody}>
                <Text style={styles.todayLabel}>今日の記録</Text>
                <Text style={styles.todayPrompt}>
                  タップして、今日のことを書きとめよう。
                </Text>
              </View>
              <Text style={styles.todayChevron}>＋</Text>
            </Pressable>

            <TextInput
              style={styles.searchBar}
              placeholder="タイトル・本文を検索..."
              placeholderTextColor={COLORS.PLACEHOLDER}
              value={searchText}
              onChangeText={setSearchText}
              clearButtonMode="while-editing"
              returnKeyType="search"
            />

            {error && (
              <Text style={styles.errorText}>{error}</Text>
            )}

            {!isLoading && filteredEntries.length === 0 && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {searchText ? '該当する日記が見つかりません' : 'まだ日記がありません'}
                </Text>
              </View>
            )}

            {filteredEntries.length > 0 && (
              <Text style={styles.sectionLabel}>これまでの日記</Text>
            )}
          </View>
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      <Pressable style={styles.fab} onPress={() => router.push('/(app)/new')}>
        <Text style={styles.fabIcon}>✎</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.PAPER,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingTop: 8,
    paddingBottom: 20,
  },
  headerMonth: {
    fontSize: 13,
    color: COLORS.SUB,
    letterSpacing: 2,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.INK,
    marginTop: 4,
    letterSpacing: 4,
  },
  signOutText: {
    fontSize: 13,
    color: COLORS.SUB,
  },
  todayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.CARD,
    borderRadius: 16,
    padding: 18,
    gap: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    marginBottom: 16,
  },
  todayDateColumn: {
    alignItems: 'center',
    width: 44,
  },
  todayWeekday: {
    fontSize: 12,
    color: COLORS.ACCENT,
    fontWeight: '600',
  },
  todayDay: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.INK,
    marginTop: 2,
  },
  todayBody: {
    flex: 1,
  },
  todayLabel: {
    fontSize: 12,
    color: COLORS.SUB,
    letterSpacing: 1,
  },
  todayPrompt: {
    fontSize: 15,
    color: COLORS.INK,
    marginTop: 4,
    lineHeight: 22,
  },
  todayChevron: {
    fontSize: 24,
    color: COLORS.ACCENT,
    fontWeight: '300',
  },
  searchBar: {
    backgroundColor: COLORS.CARD,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.INK,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 12,
    color: COLORS.SUB,
    letterSpacing: 2,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  separator: {
    height: 12,
  },
  loadingFooter: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  errorText: {
    color: '#C0392B',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: COLORS.SUB,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  fabIcon: {
    color: '#FFFFFF',
    fontSize: 24,
    lineHeight: 26,
  },
});
