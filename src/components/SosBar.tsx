import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';
import { fonts, fontSizes } from '../theme/typography';

interface SosBarProps {
  onPress: () => void;
}

export function SosBar({ onPress }: SosBarProps) {
  return (
    <Pressable style={styles.container} onPress={onPress}>
      <Text style={styles.emoji}>🆘</Text>
      <View>
        <Text style={styles.title}>Preciso de ajuda</Text>
        <Text style={styles.subtitle}>Toque para ligar para a família</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.danger,
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 18,
  },
  emoji: {
    fontSize: 30,
  },
  title: {
    fontFamily: fonts.headingBold,
    fontSize: 17,
    color: '#fff',
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: fontSizes.bodySmall,
    color: 'rgba(255, 255, 255, 0.9)',
  },
});
