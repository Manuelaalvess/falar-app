const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

/** Envia direto para a API de push da Expo — sem servidor/Cloud Functions. */
export async function sendPushNotifications(
  tokens: string[],
  title: string,
  body: string,
): Promise<void> {
  if (tokens.length === 0) return;

  const messages = tokens.map((to) => ({ to, title, body, sound: 'default' as const }));

  await fetch(EXPO_PUSH_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(messages),
  });
}
