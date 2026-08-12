import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';
import { fonts, fontSizes } from '../theme/typography';
import { headerActionStyles } from './headerActionStyles';

interface AppHeaderProps {
  rightLabel?: string;
  onRightPress?: () => void;
  sosButton?: ReactNode;
}

export function AppHeader({ rightLabel, onRightPress, sosButton }: AppHeaderProps) {
  const showActions = sosButton || rightLabel;

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <View style={styles.dot} />
        <Text style={styles.title}>Falar</Text>
      </View>
      {showActions ? (
        <View style={styles.actionsRow}>
          {sosButton}
          {rightLabel ? (
            <Pressable
              style={({ pressed }) => [
                headerActionStyles.button,
                pressed && headerActionStyles.buttonPressed,
              ]}
              onPress={onRightPress}
              accessibilityRole="button"
              accessibilityLabel="Área da família"
            >
              <Text style={headerActionStyles.label}>{rightLabel}</Text>
            </Pressable>
          ) : null}
        </View>
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
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
