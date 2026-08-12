import * as Speech from 'expo-speech';

/** Ritmo mais claro — comum em apps CAA para afasia. */
const SPEECH_RATE = 0.88;
const SPEECH_PITCH = 1;
const SPEECH_LANGUAGE = 'pt-BR';

let preferredVoiceId: string | undefined;
let voiceInitPromise: Promise<void> | null = null;

function isPortugueseBrazil(language: string): boolean {
  const tag = language.toLowerCase().replace('_', '-');
  return tag === 'pt-br' || tag.startsWith('pt-br-') || tag === 'pt';
}

function scoreVoice(voice: Speech.Voice): number {
  let score = 0;
  if (isPortugueseBrazil(voice.language)) score += 100;
  if (voice.quality === Speech.VoiceQuality.Enhanced) score += 50;
  return score;
}

async function ensureVoiceReady(): Promise<void> {
  if (voiceInitPromise) return voiceInitPromise;

  voiceInitPromise = (async () => {
    try {
      let voices = await Speech.getAvailableVoicesAsync();
      if (voices.length === 0) {
        await new Promise((resolve) => setTimeout(resolve, 250));
        voices = await Speech.getAvailableVoicesAsync();
      }

      const bestVoice = voices
        .filter((voice) => isPortugueseBrazil(voice.language))
        .sort((a, b) => scoreVoice(b) - scoreVoice(a))[0];

      preferredVoiceId = bestVoice?.identifier;
    } catch {
      preferredVoiceId = undefined;
    }
  })();

  return voiceInitPromise;
}

export function initSpeechVoice(): void {
  void ensureVoiceReady();
}

export function speak(text: string): void {
  void ensureVoiceReady().then(() => {
    Speech.stop();
    Speech.speak(text, {
      language: SPEECH_LANGUAGE,
      rate: SPEECH_RATE,
      pitch: SPEECH_PITCH,
      ...(preferredVoiceId ? { voice: preferredVoiceId } : {}),
    });
  });
}
