import React, { useCallback } from 'react';
import { Pressable, type StyleProp, type ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { Motion } from '../styles/tokens';

type Props = {
  onPress?: () => void;
  onLongPress?: () => void;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
  scaleTo?: number;
  disabled?: boolean;
  haptic?: boolean | 'light' | 'medium' | 'heavy' | 'soft';
  pressEffect?: 'bounce' | 'press' | 'none';
};

export default function PressableBounce({
  onPress,
  onLongPress,
  style,
  children,
  scaleTo = 0.94,
  disabled,
  haptic = 'light',
  pressEffect = 'bounce',
}: Props) {
  const scale = useSharedValue(1);
  const pressed = useSharedValue(0);

  const triggerHaptic = useCallback(() => {
    if (!haptic) return;
    if (haptic === 'soft') {
      Haptics.selectionAsync().catch(() => {});
      return;
    }
    const map: Record<string, Haptics.ImpactFeedbackStyle> = {
      light: Haptics.ImpactFeedbackStyle.Light,
      medium: Haptics.ImpactFeedbackStyle.Medium,
      heavy: Haptics.ImpactFeedbackStyle.Heavy,
    };
    const style = typeof haptic === 'string' ? map[haptic] ?? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Light;
    Haptics.impactAsync(style).catch(() => {});
  }, [haptic]);

  const firePress = useCallback(() => {
    triggerHaptic();
    onPress?.();
  }, [triggerHaptic, onPress]);

  const fireLong = useCallback(() => {
    triggerHaptic();
    onLongPress?.();
  }, [triggerHaptic, onLongPress]);

  const pressIn = () => {
    pressed.value = withTiming(1, { duration: Motion.timingFast, easing: Easing.out(Easing.quad) });
    if (pressEffect === 'bounce') {
      scale.value = withSpring(scaleTo, Motion.springBounce);
    } else if (pressEffect === 'press') {
      scale.value = withTiming(scaleTo, { duration: Motion.timingFast });
    }
  };

  const pressOut = () => {
    pressed.value = withTiming(0, { duration: Motion.timingBase, easing: Easing.out(Easing.cubic) });
    if (pressEffect === 'bounce') {
      scale.value = withSequence(
        withSpring(1.04, Motion.springBounce),
        withSpring(1, Motion.springSnap)
      );
    } else {
      scale.value = withSpring(1, Motion.springSnap);
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: 1 - pressed.value * 0.05,
  }));

  return (
    <Animated.View style={[style, animatedStyle]}>
      <Pressable
        onPress={disabled ? undefined : firePress}
        onLongPress={disabled ? undefined : fireLong}
        onPressIn={disabled ? undefined : pressIn}
        onPressOut={disabled ? undefined : pressOut}
        disabled={disabled}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}
