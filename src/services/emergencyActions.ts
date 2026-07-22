import { Linking } from 'react-native';

import { useAppStore } from '../store/useAppStore';
import type { EmergencyContact } from '../types/emergency';
import { toE164BR } from './auth';
import { persistEmergencySosAlert } from './emergency';
import { getCurrentLocationMapsUrl } from './location';

export function getCallableContacts(contacts: EmergencyContact[]): EmergencyContact[] {
  return contacts.filter((contact) => contact.phone.trim().length > 0);
}

/** Primeiro contato com telefone cadastrado (ordem da lista na Área da família). */
export function getPrimaryEmergencyContact(contacts: EmergencyContact[]): EmergencyContact | null {
  return getCallableContacts(contacts)[0] ?? null;
}

export interface DoubleTapEmergencyResult {
  locationOk: boolean;
}

/**
 * Duplo toque: grava localização para a família e abre só o discador (tel:).
 * Não abre SMS em sequência — isso tirava o paciente do Falar e do telefone.
 */
export async function triggerDoubleTapEmergency(
  uid: string,
  contact: EmergencyContact,
): Promise<DoubleTapEmergencyResult> {
  const mapsUrl = await getCurrentLocationMapsUrl().catch(() => null);
  const alert = await persistEmergencySosAlert(uid, contact, mapsUrl);
  useAppStore.getState().setLastSosAlert(alert);

  const phone = toE164BR(contact.phone);
  const canCall = await Linking.canOpenURL(`tel:${phone}`);
  if (!canCall) {
    throw new Error('Telefone indisponível para ligação');
  }

  await Linking.openURL(`tel:${phone}`);

  return { locationOk: mapsUrl !== null };
}

// Re-export para o sheet (1 toque → SMS manual)
export { buildEmergencySmsBody, buildSmsUrl } from './emergencySms';
