import { Pressable, Text, View } from 'react-native';

import { SIM_NAO_EMOJI_SIZE } from '../../constants/accessibility';
import type { CommunicationCategory, CommunicationItem } from '../../types/communication';
import type { FontScale } from '../../store/useAppStore';
import { scaledSize } from '../../theme/typography';
import { comunicarStyles as styles } from './comunicarStyles';

const SIM_HAND_EMOJI = '👍';
const NAO_HAND_EMOJI = '👎';

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
        testID="sim-button"
      >
        <Text style={[styles.simNaoEmoji, { fontSize: scaledSize(SIM_NAO_EMOJI_SIZE, fontScale) }]}>
          {SIM_HAND_EMOJI}
        </Text>
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
        testID="nao-button"
      >
        <Text style={[styles.simNaoEmoji, { fontSize: scaledSize(SIM_NAO_EMOJI_SIZE, fontScale) }]}>
          {NAO_HAND_EMOJI}
        </Text>
      </Pressable>
    </View>
  );
}
