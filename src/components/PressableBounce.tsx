import React, { useRef, useCallback } from 'react';
import {
  Animated,
  Pressable,
  type StyleProp,
  type ViewStyle,
  type GestureResponderEvent,
} from 'react-native';

interface Props {
  onPress?: (e: GestureResponderEvent) => void;
  onLongPress?: (e: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
  scaleTo?: number;
  disabled?: boolean;
}

export default function PressableBounce({
  onPress,
  onLongPress,
  style,
  children,
  scaleTo = 0.80,
  disabled,
}: Props) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const pressIn = useCallback(() => {
    scaleAnim.setValue(1);
    rotateAnim.setValue(0);
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: scaleTo,
        useNativeDriver: true,
        speed: 30,
        bounciness: 18,
      }),
      Animated.spring(rotateAnim, {
        toValue: -0.08,
        useNativeDriver: true,
        speed: 30,
        bounciness: 18,
      }),
    ]).start();
  }, [scaleAnim, rotateAnim, scaleTo]);

  const pressOut = useCallback(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1.15,
        useNativeDriver: true,
        speed: 25,
        bounciness: 20,
      }),
      Animated.spring(rotateAnim, {
        toValue: 0.05,
        useNativeDriver: true,
        speed: 25,
        bounciness: 20,
      }),
    ]).start(() => {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          speed: 45,
          bounciness: 8,
        }),
        Animated.spring(rotateAnim, {
          toValue: 0,
          useNativeDriver: true,
          speed: 45,
          bounciness: 8,
        }),
      ]).start();
    });
  }, [scaleAnim, rotateAnim]);

  const rotateInterp = rotateAnim.interpolate({
    inputRange: [-0.15, 0.15],
    outputRange: ['-8deg', '8deg'],
  });

  return (
    <Animated.View
      style={[
        {
          transform: [
            { scale: scaleAnim },
            { rotate: rotateInterp },
          ],
        },
        style,
      ]}
    >
      <Pressable
        onPress={disabled ? undefined : onPress}
        onLongPress={disabled ? undefined : onLongPress}
        onPressIn={disabled ? undefined : pressIn}
        onPressOut={disabled ? undefined : pressOut}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}
