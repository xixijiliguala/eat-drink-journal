import React, { useCallback, useEffect } from 'react';
import { StyleSheet, type ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { Motion, ZIndex } from '../../styles/tokens';

type DraggableStickerProps = {
  children: React.ReactNode;
  initialX?: number;
  initialY?: number;
  initialScale?: number;
  initialRotation?: number;
  maxScale?: number;
  minScale?: number;
  onTap?: () => void;
  onLongPress?: () => void;
  onPositionChange?: (state: { x: number; y: number; scale: number; rotation: number }) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  zIndexActive?: number;
};

export function DraggableSticker({
  children,
  initialX = 0,
  initialY = 0,
  initialScale = 1,
  initialRotation = 0,
  maxScale = 2.4,
  minScale = 0.5,
  onTap,
  onLongPress,
  onPositionChange,
  onDragStart,
  onDragEnd,
  disabled = false,
  style,
  zIndexActive = ZIndex.sticker + 1,
}: DraggableStickerProps) {
  const translateX = useSharedValue(initialX);
  const translateY = useSharedValue(initialY);
  const scale = useSharedValue(initialScale);
  const rotation = useSharedValue(initialRotation);
  const isActive = useSharedValue(0);
  const baseX = useSharedValue(initialX);
  const baseY = useSharedValue(initialY);
  const baseScale = useSharedValue(initialScale);
  const baseRotation = useSharedValue(initialRotation);

  useEffect(() => {
    translateX.value = withSpring(initialX, Motion.springGentle);
    translateY.value = withSpring(initialY, Motion.springGentle);
    scale.value = withSpring(initialScale, Motion.springGentle);
    rotation.value = withSpring(initialRotation, Motion.springGentle);
    baseX.value = initialX;
    baseY.value = initialY;
    baseScale.value = initialScale;
    baseRotation.value = initialRotation;
  }, [initialX, initialY, initialScale, initialRotation]);

  const reportChange = useCallback(
    (x: number, y: number, s: number, r: number) => {
      onPositionChange?.({ x, y, scale: s, rotation: r });
    },
    [onPositionChange]
  );

  const fireStart = useCallback(() => onDragStart?.(), [onDragStart]);
  const fireEnd = useCallback(() => onDragEnd?.(), [onDragEnd]);
  const fireTap = useCallback(() => onTap?.(), [onTap]);
  const fireLong = useCallback(() => onLongPress?.(), [onLongPress]);

  const pan = Gesture.Pan()
    .enabled(!disabled)
    .minDistance(6)
    .onStart(() => {
      isActive.value = withTiming(1, { duration: Motion.timingFast });
      runOnJS(fireStart)();
    })
    .onUpdate((e) => {
      translateX.value = baseX.value + e.translationX;
      translateY.value = baseY.value + e.translationY;
    })
    .onEnd(() => {
      isActive.value = withTiming(0, { duration: Motion.timingBase, easing: Easing.out(Easing.cubic) });
      baseX.value = translateX.value;
      baseY.value = translateY.value;
      runOnJS(reportChange)(translateX.value, translateY.value, scale.value, rotation.value);
      runOnJS(fireEnd)();
    });

  const pinch = Gesture.Pinch()
    .enabled(!disabled)
    .onUpdate((e) => {
      const next = Math.max(minScale, Math.min(maxScale, baseScale.value * e.scale));
      scale.value = next;
    })
    .onEnd(() => {
      baseScale.value = scale.value;
      runOnJS(reportChange)(translateX.value, translateY.value, scale.value, rotation.value);
    });

  const rotate = Gesture.Rotation()
    .enabled(!disabled)
    .onUpdate((e) => {
      rotation.value = baseRotation.value + e.rotation;
    })
    .onEnd(() => {
      baseRotation.value = rotation.value;
      runOnJS(reportChange)(translateX.value, translateY.value, scale.value, rotation.value);
    });

  const tap = Gesture.Tap()
    .enabled(!disabled && !!onTap)
    .maxDistance(8)
    .onEnd(() => {
      runOnJS(fireTap)();
    });

  const long = Gesture.LongPress()
    .enabled(!disabled && !!onLongPress)
    .minDuration(380)
    .onStart(() => {
      runOnJS(fireLong)();
    });

  const composed = Gesture.Simultaneous(pan, pinch, rotate, Gesture.Exclusive(tap, long));

  const animatedStyle = useAnimatedStyle(() => {
    const lift = isActive.value * 4;
    const scaleBoost = 1 + isActive.value * 0.04;
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value - lift },
        { scale: scale.value * scaleBoost },
        { rotate: `${rotation.value}rad` },
      ],
      zIndex: isActive.value > 0 ? zIndexActive : ZIndex.sticker,
      shadowOpacity: 0.25 + isActive.value * 0.2,
      shadowRadius: 6 + isActive.value * 6,
    };
  });

  return (
    <GestureDetector gesture={composed}>
      <Animated.View style={[styles.base, style, animatedStyle]}>{children}</Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  base: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
  },
});