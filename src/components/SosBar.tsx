import { useRef } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';
import { fonts, fontSizes } from '../theme/typography';

const DOUBLE_TAP_WINDOW_MS = 450;
const SINGLE_TAP_DELAY_MS = DOUBLE_TAP_WINDOW_MS + 50;

interface SosBarProps {
  onSinglePress: () => void;
  onDoublePress: () => void;
  busy?: boolean;
}

export function SosBar({ onSinglePress, onDoublePress, busy = false }: SosBarProps) {
  const lastTapAt = useRef(0);
  const singleTapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function clearSingleTapTimer() {
    if (singleTapTimer.current) {
      clearTimeout(singleTapTimer.current);
      singleTapTimer.current = null;
    }
  }

  function handlePress() {
    if (busy) return;

    const now = Date.now();
    const elapsed = now - lastTapAt.current;

    if (elapsed > 0 && elapsed < DOUBLE_TAP_WINDOW_MS) {
      clearSingleTapTimer();
      lastTapAt.current = 0;
      onDoublePress();
      return;
    }

    lastTapAt.current = now;
    clearSingleTapTimer();
    singleTapTimer.current = setTimeout(() => {
      if (lastTapAt.current === now) {
        onSinglePress();
      }
      singleTapTimer.current = null;
    }, SINGLE_TAP_DELAY_MS);
  }

  return (
    <Pressable
      style={[styles.container, busy && styles.containerBusy]}
      onPress={handlePress}
      disabled={busy}
      accessibilityRole="button"
      accessibilityLabel="Preciso de ajuda. Um toque para escolher contato. Dois toques rápidos para ligar e enviar localização."
    >
      {busy ? (
        <ActivityIndicator color="#fff" size="small" />
      ) : (
        <Text style={styles.emoji}>🆘</Text>
      )}
      <View style={styles.textBlock}>
        <Text style={styles.title}>Preciso de ajuda</Text>
        <Text style={styles.subtitle}>
          2 toques rápidos: liga e manda localização{'\n'}1 toque: escolher quem chamar
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.danger,
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 18,
  },
  containerBusy: {
    opacity: 0.92,
  },
  emoji: {
    fontSize: 30,
    width: 36,
    textAlign: 'center',
  },
  textBlock: {
    flex: 1,
  },
  title: {
    fontFamily: fonts.headingBold,
    fontSize: 17,
    color: '#fff',
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: fontSizes.bodySmall,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
    marginTop: 2,
  },
});
