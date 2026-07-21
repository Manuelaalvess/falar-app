import { StatusBar } from 'expo-status-bar';
import type { ConfirmationResult } from 'firebase/auth';
import { useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from './src/components/AppHeader';
import {
  type RecaptchaVerifierHandle,
  RecaptchaVerifierModal,
} from './src/components/RecaptchaVerifierModal';
import { useAppFonts } from './src/hooks/useAppFonts';
import { useAuth } from './src/hooks/useAuth';
import { useEmergencyContacts } from './src/hooks/useEmergencyContacts';
import { useEvolutionEvents } from './src/hooks/useEvolutionEvents';
import { useItems } from './src/hooks/useItems';
import { AdminScreen } from './src/screens/AdminScreen';
import { ComunicarScreen } from './src/screens/ComunicarScreen';
import { type LoginFormData, LoginScreen } from './src/screens/LoginScreen';
import { VerifyCodeScreen } from './src/screens/VerifyCodeScreen';
import { confirmVerificationCode, sendVerificationCode, signOut } from './src/services/auth';
import { addContact, removeContact } from './src/services/emergency';
import { firebaseConfig } from './src/services/firebase';
import { addItem, clearItemPhoto, removeItem, setItemPhoto } from './src/services/items';
import { generateLocalId, uploadItemPhoto } from './src/services/storage';
import { useAppStore } from './src/store/useAppStore';
import { colors } from './src/theme/colors';

export default function App() {
  const [fontsLoaded] = useAppFonts();
  const { user, initializing } = useAuth();
  useItems(user?.uid ?? null);
  useEmergencyContacts(user?.uid ?? null);
  useEvolutionEvents(user?.uid ?? null);
  const showAdmin = useAppStore((state) => state.showAdmin);
  const setShowAdmin = useAppStore((state) => state.setShowAdmin);
  const recaptchaVerifier = useRef<RecaptchaVerifierHandle>(null);

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

  async function handleAddItem(category: string, name: string, emoji: string, photoUri?: string) {
    if (!user) return;
    try {
      const photoUrl = photoUri
        ? await uploadItemPhoto(user.uid, generateLocalId(), photoUri)
        : undefined;
      await addItem(user.uid, category, name, emoji, photoUrl);
    } catch (error) {
      console.error('Falha ao adicionar item:', error);
    }
  }

  async function handleRemoveItem(itemId: string) {
    if (!user) return;
    try {
      await removeItem(user.uid, itemId);
    } catch (error) {
      console.error('Falha ao remover item:', error);
    }
  }

  async function handleSetItemPhoto(itemId: string, photoUri: string) {
    if (!user) return;
    try {
      const photoUrl = await uploadItemPhoto(user.uid, itemId, photoUri);
      await setItemPhoto(user.uid, itemId, photoUrl);
    } catch (error) {
      console.error('Falha ao definir foto do item:', error);
    }
  }

  async function handleClearItemPhoto(itemId: string) {
    if (!user) return;
    try {
      await clearItemPhoto(user.uid, itemId);
    } catch (error) {
      console.error('Falha ao remover foto do item:', error);
    }
  }

  async function handleAddContact(name: string, relation: string, phone: string, emoji: string) {
    if (!user) return;
    try {
      await addContact(user.uid, name, relation, phone, emoji);
    } catch (error) {
      console.error('Falha ao adicionar contato:', error);
    }
  }

  async function handleRemoveContact(contactId: string) {
    if (!user) return;
    try {
      await removeContact(user.uid, contactId);
    } catch (error) {
      console.error('Falha ao remover contato:', error);
    }
  }

  if (!fontsLoaded || initializing) {
    return (
      <SafeAreaProvider>
        <View style={styles.container} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <RecaptchaVerifierModal
          ref={recaptchaVerifier}
          firebaseConfig={firebaseConfig}
          title="Verificação de segurança"
          cancelLabel="Cancelar"
        />
        {user ? (
          showAdmin ? (
            <AdminScreen
              patientName={user.displayName ?? 'Paciente'}
              onAddItem={handleAddItem}
              onRemoveItem={handleRemoveItem}
              onSetItemPhoto={handleSetItemPhoto}
              onClearItemPhoto={handleClearItemPhoto}
              onAddContact={handleAddContact}
              onRemoveContact={handleRemoveContact}
              onClose={() => setShowAdmin(false)}
              onSignOut={signOut}
            />
          ) : (
            <>
              <AppHeader rightLabel="⚙️ Família" onRightPress={() => setShowAdmin(true)} />
              <ComunicarScreen uid={user.uid} />
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
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
