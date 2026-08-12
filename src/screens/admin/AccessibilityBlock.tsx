import { Text, View } from 'react-native';

import { type FontScale } from '../../store/useAppStore';
import { AdminChoiceButton } from './AdminChoiceButton';
import { styles } from './adminStyles';

const FONT_SCALE_OPTIONS: { value: FontScale; label: string; hint: string }[] = [
  { value: 1, label: 'Normal', hint: 'Tamanho normal' },
  { value: 1.25, label: 'Grande', hint: 'Tamanho grande' },
  { value: 1.5, label: 'Máximo', hint: 'Tamanho máximo' },
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
      <Text style={styles.blockHintTitleFirst}>Tamanho dos botões</Text>
      <View style={styles.choiceRow}>
        {FONT_SCALE_OPTIONS.map((option) => (
          <AdminChoiceButton
            key={option.value}
            label={option.label}
            selected={fontScale === option.value}
            onPress={() => onChangeFontScale(option.value)}
            accessibilityLabel={option.hint}
            style={styles.choiceButtonThird}
          />
        ))}
      </View>

      <Text style={[styles.blockHintTitle, styles.blockSpacingTop]}>Só emoji na Comunicar</Text>
      <Text style={styles.blockHintText}>Esconde textos e mantém Sim/Não fixos no topo.</Text>
      <View style={styles.choiceRow}>
        <AdminChoiceButton
          label="Desligado"
          selected={!lowLiteracyMode}
          onPress={() => onChangeLowLiteracyMode(false)}
          accessibilityLabel="Modo só emoji desligado"
          style={styles.choiceButtonHalf}
        />
        <AdminChoiceButton
          label="Ligado"
          selected={lowLiteracyMode}
          onPress={() => onChangeLowLiteracyMode(true)}
          accessibilityLabel="Modo só emoji ligado"
          style={styles.choiceButtonHalf}
        />
      </View>
    </View>
  );
}
