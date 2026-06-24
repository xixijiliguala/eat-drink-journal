import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react-native';
import { Colors } from '../styles/colors';
import { FontSize, FontWeight, Motion, Radius, Spacing } from '../styles/tokens';
import PressableBounce from './PressableBounce';

interface Props {
  title: string;
  viewMode: 'month' | 'week';
  onToggleMode: () => void;
  onPrev: () => void;
  onNext: () => void;
  onTarotPress: () => void;
}

export default function Header({
  title,
  viewMode,
  onToggleMode,
  onPrev,
  onNext,
  onTarotPress,
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.navRow}>
        <PressableBounce onPress={onPrev} haptic="light" pressEffect="press" style={styles.iconBtn}>
          <ChevronLeft size={24} color={Colors.textPrimary} strokeWidth={2.2} />
        </PressableBounce>

        <View style={styles.titleWrap}>
          <Text style={styles.title} numberOfLines={1} adjustsFontSizeToFit>
            {title}
          </Text>
        </View>

        <PressableBounce onPress={onNext} haptic="light" pressEffect="press" style={styles.iconBtn}>
          <ChevronRight size={24} color={Colors.textPrimary} strokeWidth={2.2} />
        </PressableBounce>
      </View>

      <View style={styles.toggleRow}>
        <PressableBounce onPress={onTarotPress} haptic="light" style={styles.tarotBtn}>
          <Sparkles size={16} color={Colors.tarotGold} strokeWidth={2.2} />
        </PressableBounce>

        <SegmentedToggle value={viewMode} onChange={onToggleMode} />
      </View>
    </View>
  );
}

type SegmentedProps = {
  value: 'month' | 'week';
  onChange: (v: 'month' | 'week') => void;
};

function SegmentedToggle({ value, onChange }: SegmentedProps) {
  const knobX = useSharedValue(value === 'month' ? 0 : 1);

  useEffect(() => {
    knobX.value = withSpring(value === 'month' ? 0 : 1, Motion.springSnap);
  }, [value, knobX]);

  const knobStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: knobX.value * 70 }],
  }));

  const monthActive = value === 'month';
  const weekActive = value === 'week';

  return (
    <View style={styles.segmented}>
      <Animated.View style={[styles.knob, knobStyle]} />
      <Pressable
        style={styles.segment}
        onPress={() => onChange('month')}
        hitSlop={6}
      >
        <Text style={[styles.segmentText, monthActive && styles.segmentTextActive]}>Month</Text>
      </Pressable>
      <Pressable
        style={styles.segment}
        onPress={() => onChange('week')}
        hitSlop={6}
      >
        <Text style={[styles.segmentText, weekActive && styles.segmentTextActive]}>Week</Text>
      </Pressable>
    </View>
  );
}

const SEG_WIDTH = 70;
const SEG_HEIGHT = 30;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingTop: Spacing.lg,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  iconBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.lg,
  },
  titleWrap: {
    minWidth: 160,
    alignItems: 'center',
  },
  title: {
    color: Colors.textPrimary,
    fontSize: 26,
    fontFamily: 'Caveat',
    fontWeight: FontWeight.semibold,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
    gap: Spacing.md,
  },
  tarotBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.pill,
    backgroundColor: Colors.tarotCardBack,
    borderWidth: 1,
    borderColor: Colors.tarotGold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmented: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Radius.pill,
    padding: 3,
    width: SEG_WIDTH * 2 + 6,
    height: SEG_HEIGHT + 6,
    position: 'relative',
  },
  knob: {
    position: 'absolute',
    top: 3,
    left: 3,
    width: SEG_WIDTH,
    height: SEG_HEIGHT,
    borderRadius: Radius.pill,
    backgroundColor: Colors.tarotGold,
  },
  segment: {
    width: SEG_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  segmentText: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  segmentTextActive: {
    color: Colors.bgDeep,
  },
});
