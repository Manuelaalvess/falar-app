import { Text, View } from 'react-native';

import type { CommunicationItem } from '../../types/communication';
import type { FontScale } from '../../store/useAppStore';
import { comunicarStyles as styles } from './comunicarStyles';

interface ItemConfirmOverlayProps {
  item: CommunicationItem;
  fontScale: FontScale;
}

export function ItemConfirmOverlay({ item, fontScale }: ItemConfirmOverlayProps) {
  return (
    <View style={styles.confirmOverlay} accessibilityViewIsModal importantForAccessibility="yes">
      <View
        style={styles.confirmCard}
        accessibilityRole="alert"
        accessibilityLiveRegion="polite"
        accessibilityLabel={`Falando: ${item.name}`}
      >
        <Text
          style={[styles.confirmEmoji, { fontSize: 64 * fontScale }]}
          accessibilityElementsHidden
        >
          {item.emoji}
        </Text>
        <Text
          style={[styles.confirmLabel, { fontSize: 24 * fontScale }]}
          accessibilityElementsHidden
        >
          {item.name}
        </Text>
      </View>
    </View>
  );
}
