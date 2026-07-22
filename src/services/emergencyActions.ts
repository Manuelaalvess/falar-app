import { Linking } from 'react-native';

import { useAppStore } from '../store/useAppStore';
import type { EmergencyContact } from '../types/emergency';
import { toE164BR } from './auth';
import { getDeviceId } from './deviceId';
import { persistEmergencySosAlert } from './emergency';
import { sendPushNotifications } from './expoPush';
import { getCurrentLocationMapsUrl } from './location';
import { getOtherDeviceTokens } from './pushTokens';

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

  notifyOtherDevices(uid, contact, mapsUrl).catch((error: unknown) => {
    console.error('Falha ao notificar outros aparelhos do SOS:', error);
  });

  return { locationOk: mapsUrl !== null };
}

/** Avisa por push os outros aparelhos logados na mesma conta (ex: celular da filha). */
async function notifyOtherDevices(
  uid: string,
  contact: EmergencyContact,
  mapsUrl: string | null,
): Promise<void> {
  const deviceId = await getDeviceId();
  const tokens = await getOtherDeviceTokens(uid, deviceId);
  const body = mapsUrl
    ? `Ligou para ${contact.name}. Localização registrada no app.`
    : `Ligou para ${contact.name}. Sem localização GPS neste acionamento.`;
  await sendPushNotifications(tokens, 'SOS acionado no Falar', body);
}

// Re-export para o sheet (1 toque → SMS manual)
export { buildEmergencySmsBody, buildSmsUrl } from './emergencySms';
