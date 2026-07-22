import { useEffect, useState } from 'react';

import {
  seedDefaultContactsIfEmpty,
  sosAlertCacheKey,
  subscribeToContacts,
  subscribeToLatestSosAlert,
} from '../services/emergency';
import { readCache, writeCache } from '../services/localCache';
import { useAppStore } from '../store/useAppStore';
import type { EmergencyContact, EmergencySosAlert } from '../types/emergency';

interface EmergencyContactsState {
  loading: boolean;
}

function cacheKeyFor(uid: string): string {
  return `falar:emergencyContacts:${uid}`;
}

export function useEmergencyContacts(uid: string | null): EmergencyContactsState {
  const setEmergencyContacts = useAppStore((state) => state.setEmergencyContacts);
  const setLastSosAlert = useAppStore((state) => state.setLastSosAlert);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setEmergencyContacts([]);
      setLastSosAlert(null);
      setLoading(true);
      return;
    }

    setLoading(true);
    let receivedLiveData = false;
    const cacheKey = cacheKeyFor(uid);

    readCache<EmergencyContact[]>(cacheKey).then((cached) => {
      if (cached && !receivedLiveData) {
        setEmergencyContacts(cached);
        setLoading(false);
      }
    });

    readCache<EmergencySosAlert>(sosAlertCacheKey(uid)).then((cachedAlert) => {
      if (cachedAlert) setLastSosAlert(cachedAlert);
    });

    seedDefaultContactsIfEmpty(uid).catch((error: unknown) => {
      console.error('Falha ao popular contatos padrao:', error);
    });

    const unsubscribeContacts = subscribeToContacts(uid, (list) => {
      receivedLiveData = true;
      setEmergencyContacts(list);
      setLoading(false);
      writeCache(cacheKey, list);
    });

    const unsubscribeSos = subscribeToLatestSosAlert(uid, (alert) => {
      if (alert) {
        setLastSosAlert(alert);
        writeCache(sosAlertCacheKey(uid), alert);
      }
    });

    return () => {
      unsubscribeContacts();
      unsubscribeSos();
    };
  }, [uid, setEmergencyContacts, setLastSosAlert]);

  return { loading };
}
