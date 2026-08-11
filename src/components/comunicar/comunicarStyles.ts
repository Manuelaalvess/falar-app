import { StyleSheet } from 'react-native';

import {
  CATEGORY_TILE_MIN_HEIGHT,
  ITEM_TILE_MIN_HEIGHT,
  MIN_TOUCH_TARGET,
  SIM_NAO_MIN_HEIGHT,
  TILE_GAP,
} from '../../constants/accessibility';
import { colors } from '../../theme/colors';
import { fonts, fontSizes } from '../../theme/typography';

export const comunicarStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 18,
    flexGrow: 1,
  },
  sectionLabel: {
    fontFamily: fonts.headingBold,
    fontSize: fontSizes.label,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: colors.muted,
    marginBottom: 12,
  },
  simNaoRow: {
    flexDirection: 'row',
    gap: TILE_GAP,
    marginBottom: 18,
  },
  simNaoButton: {
    flex: 1,
    minHeight: SIM_NAO_MIN_HEIGHT,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderWidth: 2,
  },
  simButton: {
    backgroundColor: colors.categories.need.background,
    borderColor: colors.success,
  },
  naoButton: {
    backgroundColor: colors.categories.food.background,
    borderColor: colors.danger,
  },
  simNaoEmoji: {
    fontSize: 40,
  },
  simNaoLabel: {
    fontFamily: fonts.headingBold,
    fontSize: 18,
    color: colors.ink,
  },
  sectionLabelInline: {
    fontFamily: fonts.headingBold,
    fontSize: fontSizes.label,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: colors.muted,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: TILE_GAP,
  },
  categoryTile: {
    width: '47%',
    minHeight: CATEGORY_TILE_MIN_HEIGHT,
    borderRadius: 22,
    padding: 22,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  itemTile: {
    width: '47%',
    minHeight: ITEM_TILE_MIN_HEIGHT,
    borderRadius: 20,
    padding: 14,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  tileEmoji: {
    fontSize: 38,
  },
  tileLabel: {
    fontFamily: fonts.heading,
    fontSize: 19,
    textAlign: 'center',
  },
  itemLabel: {
    fontFamily: fonts.heading,
    fontSize: 18,
    color: colors.ink,
    textAlign: 'center',
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  backButton: {
    width: MIN_TOUCH_TARGET,
    height: MIN_TOUCH_TARGET,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonLabel: {
    fontSize: 22,
    color: colors.ink,
  },
  emptyText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.bodyLarge,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 24,
    paddingVertical: 40,
  },
  confirmOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(38, 42, 46, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmCard: {
    backgroundColor: '#fff',
    borderRadius: 26,
    paddingVertical: 40,
    paddingHorizontal: 30,
    alignItems: 'center',
    gap: 14,
    maxWidth: 320,
  },
  confirmEmoji: {
    fontSize: 64,
  },
  confirmLabel: {
    fontFamily: fonts.headingBold,
    fontSize: 24,
    color: colors.primaryDark,
  },
  tilePressed: {
    opacity: 0.86,
    transform: [{ scale: 0.98 }],
  },
});
