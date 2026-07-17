import { useEffect, useState } from 'react';

import { seedDefaultContactsIfEmpty, subscribeToContacts } from '../services/emergency';
import type { EmergencyContact } from '../types/emergency';

interface EmergencyContactsState {
  contacts: EmergencyContact[];
  loading: boolean;
}

export function useEmergencyContacts(uid: string | null): EmergencyContactsState {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setContacts([]);
      setLoading(true);
      return;
    }

    setLoading(true);
    seedDefaultContactsIfEmpty(uid).catch((error: unknown) => {
      console.error('Falha ao popular contatos padrao:', error);
    });

    const unsubscribe = subscribeToContacts(uid, (list) => {
      setContacts(list);
      setLoading(false);
    });

    return unsubscribe;
  }, [uid]);

  return { contacts, loading };
}
