import { useEffect, useRef, useState } from 'react';

import { readCache, writeCache } from '../services/localCache';
import { logError } from '../utils/logError';

interface UseCachedFirestoreSubscriptionOptions<T> {
  uid: string | null;
  cacheKey: (uid: string) => string;
  subscribe: (uid: string, onUpdate: (data: T) => void) => () => void;
  onUpdate: (data: T) => void;
  onClear: () => void;
  seed?: (uid: string) => Promise<void>;
  seedLogContext?: string;
}

const WRITE_CACHE_DELAY_MS = 400;

export function useCachedFirestoreSubscription<T>({
  uid,
  cacheKey,
  subscribe,
  onUpdate,
  onClear,
  seed,
  seedLogContext,
}: UseCachedFirestoreSubscriptionOptions<T>): { loading: boolean } {
  const [loading, setLoading] = useState(true);
  const onUpdateRef = useRef(onUpdate);
  const onClearRef = useRef(onClear);
  const subscribeRef = useRef(subscribe);
  const seedRef = useRef(seed);

  onUpdateRef.current = onUpdate;
  onClearRef.current = onClear;
  subscribeRef.current = subscribe;
  seedRef.current = seed;

  useEffect(() => {
    if (!uid) {
      onClearRef.current();
      setLoading(true);
      return;
    }

    setLoading(true);
    let receivedLiveData = false;
    let writeCacheTimer: ReturnType<typeof setTimeout> | null = null;
    const key = cacheKey(uid);

    readCache<T>(key).then((cached) => {
      if (cached != null && !receivedLiveData) {
        onUpdateRef.current(cached);
        setLoading(false);
      }
    });

    seedRef.current?.(uid).catch((error: unknown) => {
      logError(seedLogContext ?? 'Seed Firestore', error);
    });

    const unsubscribe = subscribeRef.current(uid, (data) => {
      receivedLiveData = true;
      onUpdateRef.current(data);
      setLoading(false);

      if (writeCacheTimer) clearTimeout(writeCacheTimer);
      writeCacheTimer = setTimeout(() => {
        writeCache(key, data);
      }, WRITE_CACHE_DELAY_MS);
    });

    return () => {
      if (writeCacheTimer) clearTimeout(writeCacheTimer);
      unsubscribe();
    };
  }, [uid, cacheKey, seedLogContext]);

  return { loading };
}
