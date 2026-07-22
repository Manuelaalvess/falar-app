import { useEffect } from 'react';

import { downloadAndSaveRecording, getRecordingUri } from '../services/audioRecordings';
import { useAppStore } from '../store/useAppStore';
import { downloadRecordingUrl } from '../services/voiceStorage';

/** Baixa em segundo plano as gravacoes que existem na nuvem mas nao no dispositivo atual. */
export function useVoiceSync(uid: string | null): void {
  const itemsByCategory = useAppStore((state) => state.itemsByCategory);

  useEffect(() => {
    if (!uid) return;

    const itemIds = Object.values(itemsByCategory)
      .flat()
      .map((item) => item.id);

    itemIds.forEach((itemId) => {
      if (getRecordingUri(itemId)) return;

      downloadRecordingUrl(uid, itemId)
        .then((url) => {
          if (!url) return null;
          return downloadAndSaveRecording(itemId, url);
        })
        .catch((error: unknown) => {
          console.error('Falha ao sincronizar gravacao da nuvem:', error);
        });
    });
  }, [uid, itemsByCategory]);
}
