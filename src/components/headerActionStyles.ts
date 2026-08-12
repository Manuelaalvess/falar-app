import { StyleSheet } from 'react-native';

import { colors } from '../theme/colors';
import { fonts, fontSizes } from '../theme/typography';

export const HEADER_ACTION_HEIGHT = 42;

export const headerActionStyles = StyleSheet.create({
  button: {
    height: HEADER_ACTION_HEIGHT,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: fonts.headingMedium,
    fontSize: fontSizes.bodySmall,
    lineHeight: 20,
    color: colors.muted,
  },
  sosButton: {
    borderColor: colors.danger,
    backgroundColor: '#FDF0EF',
  },
  sosLabel: {
    color: colors.dangerDark,
  },
  buttonPressed: {
    opacity: 0.88,
  },
});
