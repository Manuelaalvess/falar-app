import { useEffect, useState } from 'react';

import { seedDefaultContactsIfEmpty, subscribeToContacts } from '../services/emergency';
import { useAppStore } from '../store/useAppStore';

interface EmergencyContactsState {
  loading: boolean;
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
    seedDefaultContactsIfEmpty(uid).catch((error: unknown) => {
      console.error('Falha ao popular contatos padrao:', error);
    });

    const unsubscribe = subscribeToContacts(uid, (list) => {
      setEmergencyContacts(list);
      setLoading(false);
    });

    return unsubscribe;
  }, [uid, setEmergencyContacts]);

  return { loading };
}
