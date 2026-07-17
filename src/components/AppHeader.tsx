import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';
import { fonts, fontSizes } from '../theme/typography';

interface AppHeaderProps {
  rightLabel?: string;
  onRightPress?: () => void;
}

export function AppHeader({ rightLabel, onRightPress }: AppHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <View style={styles.dot} />
        <Text style={styles.title}>Falar</Text>
      </View>
      {rightLabel ? (
        <Pressable style={styles.rightButton} onPress={onRightPress}>
          <Text style={styles.rightLabel}>{rightLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.accent,
  },
  title: {
    fontFamily: fonts.headingBold,
    fontSize: fontSizes.title,
    color: colors.primaryDark,
  },
  rightButton: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  rightLabel: {
    fontFamily: fonts.headingMedium,
    fontSize: fontSizes.bodySmall,
    color: colors.muted,
  },
});
