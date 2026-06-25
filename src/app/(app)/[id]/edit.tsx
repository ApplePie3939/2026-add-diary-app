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
import { router, useLocalSearchParams } from 'expo-router';

import { useEntries } from '../../../store/entries';
import { IconPicker } from '../../../components/IconPicker';
import { DatePicker } from '../../../components/DatePicker';
import { COLORS } from '../../../constants/colors';
import { useImagePicker } from '../../../hooks/useImagePicker';

export default function EditEntryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { entries, updateEntry } = useEntries();

  const entry = entries.find((e) => e.id === id);

  const [icon, setIcon] = useState(entry?.icon ?? '☀️');
  const [title, setTitle] = useState(entry?.title ?? '');
  const [body, setBody] = useState(entry?.body ?? '');
  const [date, setDate] = useState(entry?.date ?? new Date());
  const [isSaving, setIsSaving] = useState(false);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(entry?.imageUrl ?? null);

  const { imageUri, isUploading, pickImage, uploadImage, clearImage } = useImagePicker();

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

  const canSave = title.trim().length > 0 && body.trim().length > 0 && !isSaving && !isUploading;

  const handleSave = async () => {
    if (!canSave) return;
    setIsSaving(true);
    try {
      let finalImageUrl: string | null = existingImageUrl;

      if (imageUri) {
        // New image selected — upload it
        finalImageUrl = await uploadImage(entry.id);
      }

      await updateEntry(entry.id, {
        icon,
        title: title.trim(),
        body: body.trim(),
        date,
        imageUrl: finalImageUrl,
      });
      router.back();
    } catch {
      Alert.alert('エラー', '保存に失敗しました。もう一度お試しください。');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveImage = () => {
    if (imageUri) {
      clearImage();
    } else {
      setExistingImageUrl(null);
    }
  };

  const currentImage = imageUri ?? existingImageUrl;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.cancel}>キャンセル</Text>
        </Pressable>
        <Text style={styles.headerTitle}>編集</Text>
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
          {currentImage ? (
            <View style={styles.imageContainer}>
              <Image source={{ uri: currentImage }} style={styles.image} />
              <Pressable style={styles.removeImageButton} onPress={handleRemoveImage}>
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
