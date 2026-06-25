import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../constants/colors';

export function DiaryLogo() {
  return (
    <View style={styles.container}>
      {/* 装飾ライン上 */}
      <View style={styles.ornamentRow}>
        <View style={styles.line} />
        <View style={styles.diamond} />
        <View style={styles.line} />
      </View>

      {/* メインタイトル */}
      <View style={styles.titleWrap}>
        <Text style={styles.titleJa}>日</Text>
        <View style={styles.titleDivider} />
        <Text style={styles.titleJa}>記</Text>
      </View>

      {/* サブタイトル */}
      <Text style={styles.titleEn}>DIARY</Text>

      {/* 装飾ライン下 */}
      <View style={styles.ornamentRow}>
        <View style={styles.line} />
        <View style={styles.dot} />
        <View style={styles.dot} />
        <View style={styles.dot} />
        <View style={styles.line} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 10,
  },
  ornamentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  line: {
    width: 40,
    height: 1,
    backgroundColor: COLORS.ACCENT,
    opacity: 0.5,
  },
  diamond: {
    width: 6,
    height: 6,
    backgroundColor: COLORS.ACCENT,
    transform: [{ rotate: '45deg' }],
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: COLORS.ACCENT,
    opacity: 0.6,
  },
  titleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  titleJa: {
    fontSize: 48,
    fontWeight: '300',
    color: COLORS.INK,
    letterSpacing: 4,
  },
  titleDivider: {
    width: 1,
    height: 36,
    backgroundColor: COLORS.ACCENT,
    opacity: 0.4,
  },
  titleEn: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.ACCENT,
    letterSpacing: 8,
    marginTop: -4,
  },
});
