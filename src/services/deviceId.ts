import * as Crypto from 'expo-crypto';

import { readCache, writeCache } from './localCache';

const DEVICE_ID_CACHE_KEY = 'falar:deviceId';

export async function getDeviceId(): Promise<string> {
  const cached = await readCache<string>(DEVICE_ID_CACHE_KEY);
  if (cached) return cached;

  const generated = Crypto.randomUUID();
  await writeCache(DEVICE_ID_CACHE_KEY, generated);
  return generated;
}
