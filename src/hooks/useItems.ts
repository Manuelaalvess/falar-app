import { seedDefaultItemsIfEmpty, subscribeToItems } from '../services/items';
import { useAppStore } from '../store/useAppStore';
import { useCachedFirestoreSubscription } from './useCachedFirestoreSubscription';

interface ItemsState {
  loading: boolean;
}

function itemsCacheKey(uid: string): string {
  return `falar:items:${uid}`;
}

export function useItems(uid: string | null): ItemsState {
  const setItemsByCategory = useAppStore((state) => state.setItemsByCategory);

  return useCachedFirestoreSubscription({
    uid,
    cacheKey: itemsCacheKey,
    subscribe: subscribeToItems,
    onUpdate: setItemsByCategory,
    onClear: () => setItemsByCategory({}),
    seed: seedDefaultItemsIfEmpty,
    seedLogContext: 'Itens padrão',
  });
}
