import { useEffect } from 'react';

import {
  seedDefaultContactsIfEmpty,
  sosAlertCacheKey,
  subscribeToContacts,
  subscribeToLatestSosAlert,
} from '../services/emergency';
import { readCache, writeCache } from '../services/localCache';
import { useAppStore } from '../store/useAppStore';
import type { EmergencySosAlert } from '../types/emergency';
import { useCachedFirestoreSubscription } from './useCachedFirestoreSubscription';

interface EmergencyContactsState {
  loading: boolean;
}

function contactsCacheKey(uid: string): string {
  return `falar:emergencyContacts:${uid}`;
}

export function useEmergencyContacts(uid: string | null): EmergencyContactsState {
  const setEmergencyContacts = useAppStore((state) => state.setEmergencyContacts);
  const setLastSosAlert = useAppStore((state) => state.setLastSosAlert);

  const { loading } = useCachedFirestoreSubscription({
    uid,
    cacheKey: contactsCacheKey,
    subscribe: subscribeToContacts,
    onUpdate: setEmergencyContacts,
    onClear: () => setEmergencyContacts([]),
    seed: seedDefaultContactsIfEmpty,
    seedLogContext: 'Contatos padrão',
  });

  useEffect(() => {
    if (!uid) {
      setLastSosAlert(null);
      return;
    }

    readCache<EmergencySosAlert>(sosAlertCacheKey(uid)).then((cachedAlert) => {
      if (cachedAlert) setLastSosAlert(cachedAlert);
    });

    const unsubscribe = subscribeToLatestSosAlert(uid, (alert) => {
      if (!alert) return;
      setLastSosAlert(alert);
      writeCache(sosAlertCacheKey(uid), alert);
    });

    return unsubscribe;
  }, [uid, setLastSosAlert]);

  return { loading };
}
