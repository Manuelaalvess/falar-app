import { useCallback, useEffect, useState } from 'react';

import { SPEAK_CONFIRM_MS } from '../constants/accessibility';
import { getRecordingUri } from '../services/audioRecordings';
import { logEvent } from '../services/evolution';
import { playSound } from '../services/recording';
import { speak } from '../services/speech';
import type { CommunicationCategory, CommunicationItem } from '../types/communication';
import { tapHaptic } from '../utils/haptics';
import { logError } from '../utils/logError';

export function useSpeakItem(uid: string) {
  const [confirmedItem, setConfirmedItem] = useState<CommunicationItem | null>(null);

  useEffect(() => {
    if (!confirmedItem) return;
    const timeout = setTimeout(() => setConfirmedItem(null), SPEAK_CONFIRM_MS);
    return () => clearTimeout(timeout);
  }, [confirmedItem]);

  const chooseItem = useCallback(
    (item: CommunicationItem, category?: CommunicationCategory) => {
      tapHaptic();
      const recordingUri = getRecordingUri(item.id);
      if (recordingUri) {
        playSound(recordingUri).catch((error: unknown) => {
          logError('Áudio do item', error);
          speak(item.name);
        });
      } else {
        speak(item.name);
      }

      setConfirmedItem(item);

      if (category) {
        logEvent(uid, category.key, category.label, item.name).catch((error: unknown) => {
          logError('Evento de comunicação', error);
        });
      }
    },
    [uid],
  );

  return { confirmedItem, chooseItem };
}
