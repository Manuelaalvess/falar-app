import { StatusBar } from 'expo-status-bar';
import type { ConfirmationResult } from 'firebase/auth';
import { useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppHeader } from './src/components/AppHeader';
import {
  type RecaptchaVerifierHandle,
  RecaptchaVerifierModal,
} from './src/components/RecaptchaVerifierModal';
import { useAppFonts } from './src/hooks/useAppFonts';
import { useAuth } from './src/hooks/useAuth';
import { useItems } from './src/hooks/useItems';
import { AdminScreen } from './src/screens/AdminScreen';
import { ComunicarScreen } from './src/screens/ComunicarScreen';
import { type LoginFormData, LoginScreen } from './src/screens/LoginScreen';
import { VerifyCodeScreen } from './src/screens/VerifyCodeScreen';
import { confirmVerificationCode, sendVerificationCode, signOut } from './src/services/auth';
import { firebaseConfig } from './src/services/firebase';
import { addItem, removeItem } from './src/services/items';
import { colors } from './src/theme/colors';

export default function App() {
  const [fontsLoaded] = useAppFonts();
  const { user, initializing } = useAuth();
  const { itemsByCategory } = useItems(user?.uid ?? null);
  const recaptchaVerifier = useRef<RecaptchaVerifierHandle>(null);

  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const [pendingName, setPendingName] = useState('');
  const [pendingPhone, setPendingPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);

  async function handleLoginSubmit({ name, phone }: LoginFormData) {
    if (!recaptchaVerifier.current) return;
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const result = await sendVerificationCode(phone, recaptchaVerifier.current);
      setConfirmation(result);
      setPendingName(name);
      setPendingPhone(phone);
    } catch (error) {
      console.error('Falha ao enviar codigo de verificacao:', error);
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
    } catch (error) {
      console.error('Falha ao confirmar codigo:', error);
      setErrorMessage('Código incorreto. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleBackToLogin() {
    setConfirmation(null);
    setErrorMessage(null);
  }

  function handleAddItem(category: string, name: string, emoji: string) {
    if (!user) return;
    addItem(user.uid, category, name, emoji).catch((error: unknown) => {
      console.error('Falha ao adicionar item:', error);
    });
  }

  function handleRemoveItem(itemId: string) {
    if (!user) return;
    removeItem(user.uid, itemId).catch((error: unknown) => {
      console.error('Falha ao remover item:', error);
    });
  }

  if (!fontsLoaded || initializing) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      <RecaptchaVerifierModal
        ref={recaptchaVerifier}
        firebaseConfig={firebaseConfig}
        title="Verificação de segurança"
        cancelLabel="Cancelar"
      />
      {user ? (
        showAdmin ? (
          <AdminScreen
            itemsByCategory={itemsByCategory}
            onAddItem={handleAddItem}
            onRemoveItem={handleRemoveItem}
            onClose={() => setShowAdmin(false)}
            onSignOut={signOut}
          />
        ) : (
          <>
            <AppHeader rightLabel="⚙️ Família" onRightPress={() => setShowAdmin(true)} />
            <ComunicarScreen itemsByCategory={itemsByCategory} />
          </>
        )
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
});
