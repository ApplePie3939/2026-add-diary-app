import { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { useEntries } from '../../store/entries';
import { IconPicker } from '../../components/IconPicker';
import { DatePicker } from '../../components/DatePicker';
import { COLORS } from '../../constants/colors';
import { ICONS } from '../../constants/icons';
import { useImagePicker } from '../../hooks/useImagePicker';

export default function NewEntryScreen() {
  const { addEntry } = useEntries();
  const [icon, setIcon] = useState<string>(ICONS[0]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [date, setDate] = useState(() => new Date());
  const [isSaving, setIsSaving] = useState(false);

  const { imageUri, isUploading, pickImage, uploadImage, clearImage } = useImagePicker();

  const canSave = title.trim().length > 0 && body.trim().length > 0 && !isSaving && !isUploading;

  const handleSave = async () => {
    if (!canSave) return;
    setIsSaving(true);
    try {
      // Generate a temporary ID for storage path; Firestore will assign the real ID
      const tempId = `entry-${Date.now()}`;
      const uploadedUrl = imageUri ? await uploadImage(tempId) : null;

      await addEntry({
        icon,
        title: title.trim(),
        body: body.trim(),
        date,
        imageUrl: uploadedUrl,
      });
      router.back();
    } catch {
      Alert.alert('エラー', '保存に失敗しました。もう一度お試しください。');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.cancel}>キャンセル</Text>
        </Pressable>
        <Text style={styles.headerTitle}>新しい記録</Text>
        <Pressable onPress={handleSave} hitSlop={12} disabled={!canSave}>
          <Text style={[styles.save, !canSave && styles.saveDisabled]}>
            {isSaving ? '保存中...' : '保存'}
          </Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.sectionLabel}>アイコン</Text>
          <IconPicker value={icon} onChange={setIcon} />

          <Text style={[styles.sectionLabel, styles.sectionLabelTop]}>日付</Text>
          <DatePicker value={date} onChange={setDate} />

          <TextInput
            style={styles.titleInput}
            placeholder="タイトル（必須）"
            placeholderTextColor={COLORS.PLACEHOLDER}
            value={title}
            onChangeText={setTitle}
            returnKeyType="next"
          />

          <View style={styles.divider} />

          <TextInput
            style={styles.bodyInput}
            placeholder="今日のこと...（必須）"
            placeholderTextColor={COLORS.PLACEHOLDER}
            value={body}
            onChangeText={setBody}
            multiline
            textAlignVertical="top"
          />

          <View style={styles.divider} />

          <Text style={[styles.sectionLabel, styles.sectionLabelTop]}>画像（任意）</Text>
          {imageUri ? (
            <View style={styles.imageContainer}>
              <Image source={{ uri: imageUri }} style={styles.image} />
              <Pressable style={styles.removeImageButton} onPress={clearImage}>
                <Text style={styles.removeImageText}>画像を削除</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              style={styles.imagePickerButton}
              onPress={pickImage}
              disabled={isUploading}
            >
              <Text style={styles.imagePickerText}>
                {isUploading ? 'アップロード中...' : '＋ 画像を追加'}
              </Text>
            </Pressable>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.PAPER,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.INK,
    letterSpacing: 2,
  },
  cancel: {
    fontSize: 15,
    color: COLORS.SUB,
  },
  save: {
    fontSize: 15,
    color: COLORS.ACCENT,
    fontWeight: '600',
  },
  saveDisabled: {
    color: COLORS.DISABLED,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionLabel: {
    fontSize: 12,
    color: COLORS.SUB,
    letterSpacing: 2,
    marginBottom: 10,
  },
  sectionLabelTop: {
    marginTop: 20,
  },
  titleInput: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.INK,
    paddingVertical: 14,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.BORDER,
    marginVertical: 4,
  },
  bodyInput: {
    fontSize: 15,
    color: COLORS.INK,
    lineHeight: 24,
    minHeight: 200,
    paddingTop: 10,
    paddingBottom: 10,
  },
  imageContainer: {
    gap: 12,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  removeImageButton: {
    alignSelf: 'flex-start',
  },
  removeImageText: {
    fontSize: 14,
    color: '#C0392B',
  },
  imagePickerButton: {
    backgroundColor: COLORS.CARD,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderStyle: 'dashed',
  },
  imagePickerText: {
    fontSize: 15,
    color: COLORS.ACCENT,
  },
});
