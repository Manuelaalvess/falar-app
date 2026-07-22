import { Pressable, Text, View } from 'react-native';

import { type FontScale } from '../../store/useAppStore';
import { styles } from './adminStyles';

const FONT_SCALE_OPTIONS: { value: FontScale; label: string }[] = [
  { value: 1, label: 'Normal' },
  { value: 1.25, label: 'Grande' },
  { value: 1.5, label: 'Extra grande' },
];

interface AccessibilityBlockProps {
  fontScale: FontScale;
  onChangeFontScale: (scale: FontScale) => void;
  switchScanningEnabled: boolean;
  onChangeSwitchScanning: (enabled: boolean) => void;
}

export function AccessibilityBlock({
  fontScale,
  onChangeFontScale,
  switchScanningEnabled,
  onChangeSwitchScanning,
}: AccessibilityBlockProps) {
  return (
    <View style={styles.block}>
      <Text style={styles.blockTitle}>Tamanho da letra e dos botões</Text>
      <View style={styles.fontScaleRow}>
        {FONT_SCALE_OPTIONS.map((option) => (
          <Pressable
            key={option.value}
            style={[
              styles.fontScaleButton,
              fontScale === option.value && styles.fontScaleButtonActive,
            ]}
            onPress={() => onChangeFontScale(option.value)}
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

      <Text style={styles.switchScanningTitle}>Varredura por botão único</Text>
      <Text style={styles.switchScanningDescription}>
        O app destaca cada categoria/item em sequência automaticamente. Toque no botão grande
        &ldquo;Selecionar&rdquo; na hora certa em vez de tocar diretamente no item.
      </Text>
      <View style={styles.fontScaleRow}>
        <Pressable
          style={[styles.fontScaleButton, !switchScanningEnabled && styles.fontScaleButtonActive]}
          onPress={() => onChangeSwitchScanning(false)}
        >
          <Text
            style={[
              styles.fontScaleButtonLabel,
              !switchScanningEnabled && styles.fontScaleButtonLabelActive,
            ]}
          >
            Desligada
          </Text>
        </Pressable>
        <Pressable
          style={[styles.fontScaleButton, switchScanningEnabled && styles.fontScaleButtonActive]}
          onPress={() => onChangeSwitchScanning(true)}
        >
          <Text
            style={[
              styles.fontScaleButtonLabel,
              switchScanningEnabled && styles.fontScaleButtonLabelActive,
            ]}
          >
            Ligada
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
