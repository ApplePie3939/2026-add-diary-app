import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';

import { useEntries } from '../../../store/entries';
import { COLORS } from '../../../constants/colors';

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const w = WEEKDAYS[date.getDay()];
  return `${y}年${m}月${d}日（${w}）`;
}

export default function EntryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { entries, deleteEntry } = useEntries();

  const entry = entries.find((e) => e.id === id);

  if (!entry) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>日記が見つかりません</Text>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>戻る</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const handleDelete = () => {
    Alert.alert(
      '削除の確認',
      'この日記を削除しますか？この操作は元に戻せません。',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteEntry(entry.id);
              router.replace('/(app)/');
            } catch {
              Alert.alert('エラー', '削除に失敗しました。もう一度お試しください。');
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.backText}>‹ 戻る</Text>
        </Pressable>
        <View style={styles.headerActions}>
          <Pressable
            onPress={() => router.push(`/(app)/${entry.id}/edit`)}
            hitSlop={12}
          >
            <Text style={styles.editText}>編集</Text>
          </Pressable>
          <Pressable onPress={handleDelete} hitSlop={12}>
            <Text style={styles.deleteText}>削除</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleRow}>
          <Text style={styles.icon}>{entry.icon}</Text>
          <Text style={styles.title}>{entry.title}</Text>
        </View>

        <Text style={styles.date}>{formatDate(entry.date)}</Text>

        <View style={styles.divider} />

        <Text style={styles.body}>{entry.body}</Text>

        {entry.imageUrl && (
          <Image
            source={{ uri: entry.imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.PAPER,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backText: {
    fontSize: 17,
    color: COLORS.ACCENT,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 16,
  },
  editText: {
    fontSize: 15,
    color: COLORS.ACCENT,
    fontWeight: '600',
  },
  deleteText: {
    fontSize: 15,
    color: '#C0392B',
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 60,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  icon: {
    fontSize: 28,
  },
  title: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.INK,
    lineHeight: 32,
  },
  date: {
    fontSize: 14,
    color: COLORS.SUB,
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.BORDER,
    marginBottom: 16,
  },
  body: {
    fontSize: 16,
    color: COLORS.INK,
    lineHeight: 26,
    marginBottom: 24,
  },
  image: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    marginTop: 8,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  notFoundText: {
    fontSize: 16,
    color: COLORS.SUB,
  },
  backButton: {
    padding: 12,
  },
  backButtonText: {
    fontSize: 15,
    color: COLORS.ACCENT,
  },
});
