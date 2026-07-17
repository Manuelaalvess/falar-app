import * as Speech from 'expo-speech';

export function speak(text: string): void {
  Speech.stop();
  Speech.speak(text, {
    language: 'pt-BR',
    rate: 0.95,
  });
}
