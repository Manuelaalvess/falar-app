import { useEffect } from 'react';

import { readCache } from '../services/localCache';
import {
  FONT_SCALE_CACHE_KEY,
  type FontScale,
  LOW_LITERACY_MODE_CACHE_KEY,
  useAppStore,
} from '../store/useAppStore';

export function useAccessibilityPrefsCache(): void {
  const setFontScale = useAppStore((state) => state.setFontScale);
  const setLowLiteracyMode = useAppStore((state) => state.setLowLiteracyMode);

  useEffect(() => {
    readCache<FontScale>(FONT_SCALE_CACHE_KEY).then((cached) => {
      if (cached) setFontScale(cached);
    });
    readCache<boolean>(LOW_LITERACY_MODE_CACHE_KEY).then((cached) => {
      if (cached) setLowLiteracyMode(cached);
    });
  }, [setFontScale, setLowLiteracyMode]);
}
