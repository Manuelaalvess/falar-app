import { useEffect, useState } from 'react';

import { readCache, writeCache } from '../services/localCache';
import { seedDefaultItemsIfEmpty, subscribeToItems } from '../services/items';
import { useAppStore } from '../store/useAppStore';
import type { CommunicationItem } from '../types/communication';

interface ItemsState {
  loading: boolean;
}

function cacheKeyFor(uid: string): string {
  return `falar:items:${uid}`;
}

export function useItems(uid: string | null): ItemsState {
  const setItemsByCategory = useAppStore((state) => state.setItemsByCategory);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setItemsByCategory({});
      setLoading(true);
      return;
    }

    setLoading(true);
    let receivedLiveData = false;
    const cacheKey = cacheKeyFor(uid);

    readCache<Record<string, CommunicationItem[]>>(cacheKey).then((cached) => {
      if (cached && !receivedLiveData) {
        setItemsByCategory(cached);
        setLoading(false);
      }
    });

    seedDefaultItemsIfEmpty(uid).catch((error: unknown) => {
      console.error('Falha ao popular itens padrao:', error);
    });

    const unsubscribe = subscribeToItems(uid, (grouped) => {
      receivedLiveData = true;
      setItemsByCategory(grouped);
      setLoading(false);
      writeCache(cacheKey, grouped);
    });

    return unsubscribe;
  }, [uid, setItemsByCategory]);

  return { loading };
}
