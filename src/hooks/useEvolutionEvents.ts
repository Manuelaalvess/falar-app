import { subscribeToEvents } from '../services/evolution';
import { useAppStore } from '../store/useAppStore';
import { useCachedFirestoreSubscription } from './useCachedFirestoreSubscription';

interface EvolutionEventsState {
  loading: boolean;
}

function eventsCacheKey(uid: string): string {
  return `falar:events:${uid}`;
}

export function useEvolutionEvents(uid: string | null): EvolutionEventsState {
  const setEvents = useAppStore((state) => state.setEvents);

  return useCachedFirestoreSubscription({
    uid,
    cacheKey: eventsCacheKey,
    subscribe: subscribeToEvents,
    onUpdate: setEvents,
    onClear: () => setEvents([]),
  });
}
