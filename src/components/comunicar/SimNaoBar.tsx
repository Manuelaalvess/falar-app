import { Pressable, Text, View } from 'react-native';

import type { CommunicationCategory, CommunicationItem } from '../../types/communication';
import type { FontScale } from '../../store/useAppStore';
import { scaledSize } from '../../theme/typography';
import { comunicarStyles as styles } from './comunicarStyles';

interface SimNaoBarProps {
  simItem: CommunicationItem;
  naoItem: CommunicationItem;
  category: CommunicationCategory | undefined;
  fontScale: FontScale;
  onChoose: (item: CommunicationItem, category?: CommunicationCategory) => void;
}

export function SimNaoBar({ simItem, naoItem, category, fontScale, onChoose }: SimNaoBarProps) {
  return (
    <View style={styles.simNaoRow}>
      <Pressable
        style={({ pressed }) => [
          styles.simNaoButton,
          styles.simButton,
          pressed && styles.tilePressed,
        ]}
        onPress={() => onChoose(simItem, category)}
        accessibilityRole="button"
        accessibilityLabel="Sim"
        accessibilityHint="Toque para falar sim em voz alta"
      >
        <Text style={[styles.simNaoEmoji, { fontSize: scaledSize(40, fontScale) }]}>
          {simItem.emoji}
        </Text>
        <Text style={[styles.simNaoLabel, { fontSize: scaledSize(18, fontScale) }]}>Sim</Text>
      </Pressable>
      <Pressable
        style={({ pressed }) => [
          styles.simNaoButton,
          styles.naoButton,
          pressed && styles.tilePressed,
        ]}
        onPress={() => onChoose(naoItem, category)}
        accessibilityRole="button"
        accessibilityLabel="Não"
        accessibilityHint="Toque para falar não em voz alta"
      >
        <Text style={[styles.simNaoEmoji, { fontSize: scaledSize(40, fontScale) }]}>
          {naoItem.emoji}
        </Text>
        <Text style={[styles.simNaoLabel, { fontSize: scaledSize(18, fontScale) }]}>Não</Text>
      </Pressable>
    </View>
  );
}
