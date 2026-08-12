import { subscribeToCategories } from '../services/categories';
import { useAppStore } from '../store/useAppStore';
import { useCachedFirestoreSubscription } from './useCachedFirestoreSubscription';

interface CategoriesState {
  loading: boolean;
}

function categoriesCacheKey(uid: string): string {
  return `falar:categories:${uid}`;
}

export function useCategories(uid: string | null): CategoriesState {
  const setCustomCategories = useAppStore((state) => state.setCustomCategories);

  return useCachedFirestoreSubscription({
    uid,
    cacheKey: categoriesCacheKey,
    subscribe: subscribeToCategories,
    onUpdate: setCustomCategories,
    onClear: () => setCustomCategories([]),
  });
}
