import { useEffect, useState } from 'react';

import { seedDefaultContactsIfEmpty, subscribeToContacts } from '../services/emergency';
import { readCache, writeCache } from '../services/localCache';
import { useAppStore } from '../store/useAppStore';
import type { EmergencyContact } from '../types/emergency';

interface EmergencyContactsState {
  loading: boolean;
}

function cacheKeyFor(uid: string): string {
  return `falar:emergencyContacts:${uid}`;
}

export function useEmergencyContacts(uid: string | null): EmergencyContactsState {
  const setEmergencyContacts = useAppStore((state) => state.setEmergencyContacts);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setEmergencyContacts([]);
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

    seedDefaultContactsIfEmpty(uid).catch((error: unknown) => {
      console.error('Falha ao popular contatos padrao:', error);
    });

    const unsubscribe = subscribeToContacts(uid, (list) => {
      receivedLiveData = true;
      setEmergencyContacts(list);
      setLoading(false);
      writeCache(cacheKey, list);
    });

    return unsubscribe;
  }, [uid, setEmergencyContacts]);

  return { loading };
}
