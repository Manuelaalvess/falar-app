import { Component, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';
import { fonts, fontSizes } from '../theme/typography';

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: { componentStack: string }): void {
    console.error('Erro nao tratado na interface:', error, info.componentStack);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false });
  };

  render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <View style={styles.container}>
        <Text style={styles.title}>Algo deu errado</Text>
        <Text style={styles.message}>
          Ocorreu um erro inesperado. Tente novamente ou reabra o app.
        </Text>
        <Pressable style={styles.button} onPress={this.handleRetry}>
          <Text style={styles.buttonLabel}>Tentar de novo</Text>
        </Pressable>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: colors.background,
  },
  title: {
    fontFamily: fonts.headingBold,
    fontSize: fontSizes.heading,
    color: colors.ink,
    marginBottom: 10,
  },
  message: {
    fontFamily: fonts.body,
    fontSize: fontSizes.body,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 28,
  },
  buttonLabel: {
    fontFamily: fonts.headingMedium,
    fontSize: fontSizes.body,
    color: '#fff',
  },
});
