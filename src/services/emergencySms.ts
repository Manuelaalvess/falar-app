import { Platform } from 'react-native';

import { toE164BR } from './auth';

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
