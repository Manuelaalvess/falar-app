import { Pressable, Text, View } from 'react-native';

import { type FontScale } from '../../store/useAppStore';
import { styles } from './adminStyles';

const FONT_SCALE_OPTIONS: { value: FontScale; label: string; hint: string }[] = [
  { value: 1, label: 'Normal', hint: 'Tamanho padrão' },
  { value: 1.25, label: 'Grande', hint: 'Recomendado para idosos' },
  { value: 1.5, label: 'Extra grande', hint: 'Baixa visão ou tremor nas mãos' },
];

interface AccessibilityBlockProps {
  fontScale: FontScale;
  onChangeFontScale: (scale: FontScale) => void;
  lowLiteracyMode: boolean;
  onChangeLowLiteracyMode: (enabled: boolean) => void;
}

export function AccessibilityBlock({
  fontScale,
  onChangeFontScale,
  lowLiteracyMode,
  onChangeLowLiteracyMode,
}: AccessibilityBlockProps) {
  return (
    <View style={styles.block}>
      <Text style={styles.blockTitle}>Acessibilidade</Text>
      <Text style={styles.blockHintText}>
        Ajustes baseados em diretrizes de CAA (ASHA), WCAG e revisões sobre apps para idosos.
        Detalhes em docs/ACESSIBILIDADE.md.
      </Text>

      <Text style={styles.blockHintTitle}>Tamanho da letra e dos botões</Text>
      <Text style={styles.blockHintText}>
        Aumenta emoji, rótulos e áreas de toque na tela Comunicar. Fonte Atkinson Hyperlegible
        (desenhada para baixa visão).
      </Text>
      <View style={styles.fontScaleRow}>
        {FONT_SCALE_OPTIONS.map((option) => (
          <Pressable
            key={option.value}
            style={[
              styles.fontScaleButton,
              fontScale === option.value && styles.fontScaleButtonActive,
            ]}
            onPress={() => onChangeFontScale(option.value)}
            accessibilityRole="button"
            accessibilityLabel={`Tamanho ${option.label}`}
            accessibilityHint={option.hint}
            accessibilityState={{ selected: fontScale === option.value }}
          >
            <Text
              style={[
                styles.fontScaleButtonLabel,
                fontScale === option.value && styles.fontScaleButtonLabelActive,
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.blockHintTitle}>Modo baixo letramento</Text>
      <Text style={styles.blockHintText}>
        Esconde textos na Comunicar (só emoji) e mantém Sim/Não sempre visíveis no topo — útil
        quando ler na tela é difícil ou gera sobrecarga cognitiva.
      </Text>
      <View style={styles.fontScaleRow}>
        <Pressable
          style={[styles.fontScaleButton, !lowLiteracyMode && styles.fontScaleButtonActive]}
          onPress={() => onChangeLowLiteracyMode(false)}
          accessibilityRole="button"
          accessibilityLabel="Modo baixo letramento desligado"
          accessibilityState={{ selected: !lowLiteracyMode }}
        >
          <Text
            style={[
              styles.fontScaleButtonLabel,
              !lowLiteracyMode && styles.fontScaleButtonLabelActive,
            ]}
          >
            Desligado
          </Text>
        </Pressable>
        <Pressable
          style={[styles.fontScaleButton, lowLiteracyMode && styles.fontScaleButtonActive]}
          onPress={() => onChangeLowLiteracyMode(true)}
          accessibilityRole="button"
          accessibilityLabel="Modo baixo letramento ligado"
          accessibilityState={{ selected: lowLiteracyMode }}
        >
          <Text
            style={[
              styles.fontScaleButtonLabel,
              lowLiteracyMode && styles.fontScaleButtonLabelActive,
            ]}
          >
            Ligado
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
