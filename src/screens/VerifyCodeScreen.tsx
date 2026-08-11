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
import { fonts } from '../theme/typography';
import { authScreenStyles as styles } from './authScreenStyles';

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
          style={localStyles.codeInput}
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

const localStyles = StyleSheet.create({
  codeInput: {
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
});
