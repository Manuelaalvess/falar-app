import { useState } from 'react';
import { Alert } from 'react-native';

import {
  getPrimaryEmergencyContact,
  triggerDoubleTapEmergency,
} from '../services/emergencyActions';
import { speak } from '../services/speech';
import type { EmergencyContact } from '../types/emergency';
import { sosHaptic } from '../utils/haptics';
import { logError } from '../utils/logError';

export function useSosDoublePress(uid: string, emergencyContacts: EmergencyContact[]) {
  const [busy, setBusy] = useState(false);

  async function handleDoublePress() {
    const primary = getPrimaryEmergencyContact(emergencyContacts);
    if (!primary) {
      Alert.alert(
        'Nenhum telefone cadastrado',
        'Peça para a família adicionar um contato com telefone na Área da família (aba Emergência).',
      );
      return;
    }

    setBusy(true);
    try {
      sosHaptic();
      speak('Ligando para ajuda');
      await triggerDoubleTapEmergency(uid, primary);
    } catch (error) {
      logError('SOS duplo toque', error);
      Alert.alert(
        'Não foi possível acionar',
        'Tente de novo ou use 1 toque no botão vermelho para escolher um contato.',
      );
    } finally {
      setBusy(false);
    }
  }

  return { busy, handleDoublePress };
}
