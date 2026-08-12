import { Pressable, Text, type StyleProp, type ViewStyle } from 'react-native';

import { styles } from './adminStyles';

interface AdminChoiceButtonProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

export function AdminChoiceButton({
  label,
  selected,
  onPress,
  accessibilityLabel,
  style,
}: AdminChoiceButtonProps) {
  return (
    <Pressable
      style={[styles.choiceButton, selected && styles.choiceButtonActive, style]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ selected }}
    >
      <Text
        style={[
          styles.choiceButtonLabel,
          selected && styles.choiceButtonLabelActive,
          styles.choiceButtonLabelCentered,
        ]}
        numberOfLines={2}
        adjustsFontSizeToFit
        minimumFontScale={0.85}
      >
        {label}
      </Text>
    </Pressable>
  );
}
