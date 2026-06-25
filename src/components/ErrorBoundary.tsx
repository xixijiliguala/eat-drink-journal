import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Colors } from '../styles/colors';
import { FontFamily, FontSize, FontWeight, Spacing, Radius } from '../styles/tokens';

type Props = {
  children?: React.ReactNode;
};

type State = {
  hasError: boolean;
  error?: Error;
};

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    if (__DEV__) {
      console.warn('[ErrorBoundary]', error, info);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.wrap}>
          <Text style={styles.title}>出了一点小问题</Text>
          <Text style={styles.hint}>
            {this.state.error?.message || '应用遇到了一个未预期的错误'}
          </Text>
          <Pressable style={styles.btn} onPress={this.handleReset}>
            <Text style={styles.btnText}>重新打开</Text>
          </Pressable>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: Colors.bg,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: Colors.textPrimary,
    fontSize: FontSize.xxl,
    fontFamily: FontFamily.display,
    fontWeight: FontWeight.semibold,
    marginBottom: Spacing.md,
  },
  hint: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    fontFamily: FontFamily.body,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 20,
  },
  btn: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.tarotCardBack,
    borderWidth: 1,
    borderColor: Colors.tarotGold,
  },
  btnText: {
    color: Colors.tarotGold,
    fontSize: FontSize.md,
    fontFamily: FontFamily.bodySemiBold,
    fontWeight: FontWeight.semibold,
  },
});