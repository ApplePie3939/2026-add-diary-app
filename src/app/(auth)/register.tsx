import { useState } from 'react';
import {
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
import { Link } from 'expo-router';

import { useAuth } from '../../store/auth';
import { COLORS } from '../../constants/colors';
import { DiaryLogo } from '../../components/DiaryLogo';

function getErrorMessage(code: string): string {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'このメールアドレスはすでに使用されています';
    case 'auth/invalid-email':
      return 'メールアドレスの形式が正しくありません';
    case 'auth/weak-password':
      return 'パスワードは6文字以上にしてください';
    default:
      return '登録に失敗しました。もう一度お試しください';
  }
}

export default function RegisterScreen() {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = email.trim().length > 0 && password.length >= 6;

  const handleRegister = async () => {
    if (!canSubmit || isSubmitting) return;
    setError(null);
    setIsSubmitting(true);
    try {
      await signUp(email.trim(), password);
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? '';
      setError(getErrorMessage(code));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <DiaryLogo />
            <Text style={styles.subtitle}>新規登録</Text>
          </View>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="メールアドレス"
              placeholderTextColor={COLORS.PLACEHOLDER}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              returnKeyType="next"
            />
            <TextInput
              style={styles.input}
              placeholder="パスワード（6文字以上）"
              placeholderTextColor={COLORS.PLACEHOLDER}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="new-password"
              returnKeyType="done"
              onSubmitEditing={handleRegister}
            />

            {error && <Text style={styles.errorText}>{error}</Text>}

            <Pressable
              style={[styles.button, (!canSubmit || isSubmitting) && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={!canSubmit || isSubmitting}
            >
              <Text style={styles.buttonText}>
                {isSubmitting ? '処理中...' : '登録する'}
              </Text>
            </Pressable>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>すでにアカウントをお持ちの方は</Text>
            <Link href="/(auth)/login" asChild>
              <Pressable>
                <Text style={styles.linkText}>ログイン</Text>
              </Pressable>
            </Link>
          </View>
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
  content: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    flexGrow: 1,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
    gap: 14,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.SUB,
    letterSpacing: 3,
  },
  form: {
    gap: 12,
  },
  input: {
    backgroundColor: COLORS.CARD,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: COLORS.INK,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  errorText: {
    color: '#C0392B',
    fontSize: 13,
    marginTop: 4,
  },
  button: {
    backgroundColor: COLORS.ACCENT,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: COLORS.DISABLED,
  },
  buttonText: {
    color: COLORS.CARD,
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    marginTop: 32,
  },
  footerText: {
    fontSize: 14,
    color: COLORS.SUB,
  },
  linkText: {
    fontSize: 14,
    color: COLORS.ACCENT,
    fontWeight: '600',
  },
});
