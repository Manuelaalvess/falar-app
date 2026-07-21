import { Linking, Platform } from 'react-native';

import type { EmergencyContact } from '../types/emergency';
import { toE164BR } from './auth';
import { getCurrentLocationMapsUrl } from './location';

const SMS_OPEN_DELAY_MS = 600;

export function getCallableContacts(contacts: EmergencyContact[]): EmergencyContact[] {
  return contacts.filter((contact) => contact.phone.trim().length > 0);
}

/** Primeiro contato com telefone cadastrado (ordem da lista na Área da família). */
export function getPrimaryEmergencyContact(contacts: EmergencyContact[]): EmergencyContact | null {
  return getCallableContacts(contacts)[0] ?? null;
}

export function buildEmergencySmsBody(mapsUrl: string | null): string {
  if (mapsUrl) {
    return `Preciso de ajuda urgente (Falar). Minha localização: ${mapsUrl}`;
  }
  return 'Preciso de ajuda urgente (Falar). Não foi possível obter a localização agora.';
}

export function buildSmsUrl(phone: string, body: string): string {
  const encodedBody = encodeURIComponent(body);
  const separator = Platform.OS === 'ios' ? '&' : '?';
  return `sms:${toE164BR(phone)}${separator}body=${encodedBody}`;
}

export interface DoubleTapEmergencyResult {
  locationOk: boolean;
}

/**
 * Aciona emergência: liga para o contato e abre SMS com localização (corpo pré-preenchido).
 * No iOS o paciente pode precisar tocar em Enviar na app Mensagens — limitação do sistema.
 */
export async function triggerDoubleTapEmergency(
  contact: EmergencyContact,
): Promise<DoubleTapEmergencyResult> {
  const mapsUrl = await getCurrentLocationMapsUrl().catch(() => null);
  const body = buildEmergencySmsBody(mapsUrl);
  const phone = toE164BR(contact.phone);

  const canCall = await Linking.canOpenURL(`tel:${phone}`);
  if (!canCall) {
    throw new Error('Telefone indisponível para ligação');
  }

  await Linking.openURL(`tel:${phone}`);

  await new Promise((resolve) => setTimeout(resolve, SMS_OPEN_DELAY_MS));

  const smsUrl = buildSmsUrl(contact.phone, body);
  const canSms = await Linking.canOpenURL(smsUrl);
  if (canSms) {
    await Linking.openURL(smsUrl);
  }

  return { locationOk: mapsUrl !== null };
}
