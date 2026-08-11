import type { RefObject } from 'react';
import { useState } from 'react';

import type { ConfirmationResult } from 'firebase/auth';

import type { RecaptchaVerifierHandle } from '../components/RecaptchaVerifierModal';
import type { LoginFormData } from '../screens/LoginScreen';
import { confirmVerificationCode, sendVerificationCode } from '../services/auth';
import { logError } from '../utils/logError';

export function usePhoneLoginFlow(recaptchaVerifier: RefObject<RecaptchaVerifierHandle | null>) {
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
      logError('Envio do código SMS', error);
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
      logError('Confirmação do código', error);
      setErrorMessage('Código incorreto. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleBackToLogin() {
    setConfirmation(null);
    setErrorMessage(null);
  }

  return {
    confirmation,
    pendingPhone,
    isSubmitting,
    errorMessage,
    handleLoginSubmit,
    handleConfirmCode,
    handleBackToLogin,
  };
}
