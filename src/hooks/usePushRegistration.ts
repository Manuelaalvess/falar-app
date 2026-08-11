import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';

import { getDeviceId } from '../services/deviceId';
import { registerPushToken } from '../services/pushTokens';
import { logError } from '../utils/logError';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/** Pede permissao de notificacao e registra o token deste aparelho no Firestore. */
export function usePushRegistration(uid: string | null): void {
  useEffect(() => {
    if (!uid) return;
    const currentUid = uid;

    async function register() {
      try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        const finalStatus =
          existingStatus === 'granted'
            ? existingStatus
            : (await Notifications.requestPermissionsAsync()).status;
        if (finalStatus !== 'granted') return;

        const deviceId = await getDeviceId();
        const { data: token } = await Notifications.getExpoPushTokenAsync();
        await registerPushToken(currentUid, deviceId, token);
      } catch (error) {
        logError('Registro push', error);
      }
    }

    void register();
  }, [uid]);
}
