import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import { StatusBar } from 'expo-status-bar';
import type { ConfirmationResult } from 'firebase/auth';
import { useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useAppFonts } from './src/hooks/useAppFonts';
import { useAuth } from './src/hooks/useAuth';
import { type LoginFormData, LoginScreen } from './src/screens/LoginScreen';
import { VerifyCodeScreen } from './src/screens/VerifyCodeScreen';
import { confirmVerificationCode, sendVerificationCode, signOut } from './src/services/auth';
import { firebaseConfig } from './src/services/firebase';
import { colors } from './src/theme/colors';
import { fonts, fontSizes } from './src/theme/typography';

export default function App() {
  const [fontsLoaded] = useAppFonts();
  const { user, initializing } = useAuth();
  const recaptchaVerifier = useRef<FirebaseRecaptchaVerifierModal>(null);

  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const [pendingName, setPendingName] = useState('');
  const [pendingPhone, setPendingPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleLoginSubmit({ name, phone }: LoginFormData) {
    if (!recaptchaVerifier.current) return;
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const result = await sendVerificationCode(phone, recaptchaVerifier.current);
      setConfirmation(result);
      setPendingName(name);
      setPendingPhone(phone);
    } catch {
      setErrorMessage('Não foi possível enviar o código. Confira o número e tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleConfirmCode(code: string) {
    if (!confirmation) return;
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await confirmVerificationCode(confirmation, code, pendingName);
    } catch {
      setErrorMessage('Código incorreto. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleBackToLogin() {
    setConfirmation(null);
    setErrorMessage(null);
  }

  if (!fontsLoaded || initializing) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      <FirebaseRecaptchaVerifierModal
        ref={recaptchaVerifier}
        firebaseConfig={firebaseConfig}
        title="Verificação de segurança"
        cancelLabel="Cancelar"
        attemptInvisibleVerification
      />
      {user ? (
        <View style={styles.authenticated}>
          <Text style={styles.welcome}>Olá, {user.displayName || 'paciente'} 👋</Text>
          <Text style={styles.welcomeSub} onPress={signOut}>
            Sair
          </Text>
        </View>
      ) : confirmation ? (
        <VerifyCodeScreen
          phone={pendingPhone}
          onConfirm={handleConfirmCode}
          onBack={handleBackToLogin}
          isSubmitting={isSubmitting}
          errorMessage={errorMessage}
        />
      ) : (
        <LoginScreen
          onSubmit={handleLoginSubmit}
          isSubmitting={isSubmitting}
          errorMessage={errorMessage}
        />
      )}
      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  authenticated: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  welcome: {
    fontFamily: fonts.heading,
    fontSize: fontSizes.heading,
    color: colors.primaryDark,
  },
  welcomeSub: {
    fontFamily: fonts.body,
    fontSize: fontSizes.body,
    color: colors.muted,
    textDecorationLine: 'underline',
  },
});
