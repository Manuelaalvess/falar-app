import { useRef } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { useAppStore } from '../store/useAppStore';
import { colors } from '../theme/colors';
import { fonts, scaledSize } from '../theme/typography';

const DOUBLE_TAP_WINDOW_MS = 450;
const SINGLE_TAP_DELAY_MS = DOUBLE_TAP_WINDOW_MS + 50;

interface SosBarProps {
  onSinglePress: () => void;
  onDoublePress: () => void;
  busy?: boolean;
}

export function SosBar({ onSinglePress, onDoublePress, busy = false }: SosBarProps) {
  const fontScale = useAppStore((state) => state.fontScale);
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
      accessibilityLabel="Preciso de ajuda. Dois toques rápidos para ligar."
    >
      {busy ? (
        <ActivityIndicator color="#fff" size="large" />
      ) : (
        <Text style={[styles.emoji, { fontSize: scaledSize(44, fontScale) }]}>🆘</Text>
      )}
      <Text style={[styles.title, { fontSize: scaledSize(22, fontScale) }]}>Preciso de ajuda</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.danger,
    borderRadius: 24,
    paddingVertical: 28,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 18,
    minHeight: 96,
    borderWidth: 3,
    borderColor: colors.dangerDark,
  },
  containerBusy: {
    opacity: 0.92,
  },
  emoji: {
    fontSize: 44,
  },
  title: {
    fontFamily: fonts.headingBold,
    fontSize: 22,
    color: '#fff',
  },
});
