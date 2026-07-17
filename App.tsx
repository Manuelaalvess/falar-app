import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';

import { useAppFonts } from './src/hooks/useAppFonts';
import { LoginScreen } from './src/screens/LoginScreen';
import { colors } from './src/theme/colors';

export default function App() {
  const [fontsLoaded] = useAppFonts();

  if (!fontsLoaded) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      <LoginScreen onSubmit={(data) => console.log('login submit', data)} />
      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
