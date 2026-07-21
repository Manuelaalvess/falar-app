import { useEffect, useState } from 'react';

import { subscribeToEvents } from '../services/evolution';
import { useAppStore } from '../store/useAppStore';

interface EvolutionEventsState {
  loading: boolean;
}

export function useEvolutionEvents(uid: string | null): EvolutionEventsState {
  const setEvents = useAppStore((state) => state.setEvents);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setEvents([]);
      setLoading(true);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToEvents(uid, (events) => {
      setEvents(events);
      setLoading(false);
    });

    return unsubscribe;
  }, [uid, setEvents]);

  return { loading };
}
