import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { colors } from '../theme/colors';
import { fonts, fontSizes } from '../theme/typography';

interface VerifyCodeScreenProps {
  phone: string;
  onConfirm: (code: string) => void;
  onBack: () => void;
  isSubmitting?: boolean;
  errorMessage?: string | null;
}

export function VerifyCodeScreen({
  phone,
  onConfirm,
  onBack,
  isSubmitting,
  errorMessage,
}: VerifyCodeScreenProps) {
  const [code, setCode] = useState('');

  const canSubmit = code.trim().length >= 6 && !isSubmitting;

  function handleConfirm() {
    if (!canSubmit) return;
    onConfirm(code.trim());
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.icon}>💬</Text>
      <Text style={styles.title}>Confirme seu número</Text>
      <Text style={styles.subtitle}>Enviamos um código de 6 dígitos por SMS para {phone}.</Text>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="000000"
          placeholderTextColor={colors.muted}
          value={code}
          onChangeText={setCode}
          keyboardType="number-pad"
          maxLength={6}
          textAlign="center"
        />
        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
        <Pressable
          style={[styles.button, !canSubmit && styles.buttonDisabled]}
          onPress={handleConfirm}
          disabled={!canSubmit}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonLabel}>Confirmar</Text>
          )}
        </Pressable>
        <Pressable onPress={onBack} disabled={isSubmitting}>
          <Text style={styles.backLink}>Corrigir número</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  icon: {
    fontSize: 60,
    marginBottom: 16,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: fontSizes.heading,
    color: colors.primaryDark,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: fontSizes.bodySmall,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 320,
    marginBottom: 22,
  },
  form: {
    width: '100%',
    maxWidth: 320,
    gap: 12,
  },
  input: {
    fontFamily: fonts.heading,
    fontSize: 28,
    letterSpacing: 8,
    padding: 16,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.card,
    color: colors.ink,
  },
  error: {
    fontFamily: fonts.body,
    fontSize: fontSizes.bodySmall,
    color: colors.danger,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonLabel: {
    fontFamily: fonts.heading,
    fontSize: 17,
    color: '#fff',
  },
  backLink: {
    fontFamily: fonts.body,
    fontSize: fontSizes.bodySmall,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 4,
    textDecorationLine: 'underline',
  },
});
