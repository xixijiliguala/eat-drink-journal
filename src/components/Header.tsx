import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Sparkles, Users } from 'lucide-react-native';
import { Colors } from '../styles/colors';
import { Motion } from '../styles/tokens';
import PressableBounce from './PressableBounce';

interface Props {
  title: string;
  viewMode: 'month' | 'week';
  onToggleMode: () => void;
  onPrev: () => void;
  onNext: () => void;
  onTarotPress: () => void;
  onFriendsPress: () => void;
  onSettingsPress: () => void;
}

export default function Header({
  title,
  viewMode,
  onToggleMode,
  onPrev,
  onNext,
  onTarotPress,
  onFriendsPress,
  onSettingsPress,
}: Props) {
  const tapCount = useRef(0);
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTitleTap = () => {
    tapCount.current += 1;
    if (tapTimer.current) clearTimeout(tapTimer.current);
    if (tapCount.current >= 4) {
      tapCount.current = 0;
      onSettingsPress();
      return;
    }
    tapTimer.current = setTimeout(() => { tapCount.current = 0; }, 1500);
  };

  return (
    <View style={styles.container}>
      <View style={styles.navRow}>
        <PressableBounce onPress={onPrev} scaleTo={0.85} style={styles.arrowBtn}>
          <Text style={styles.arrow}>{'<'}</Text>
        </PressableBounce>

        <Pressable onPress={handleTitleTap}>
          <Text style={styles.title}>{title}</Text>
        </Pressable>

        <PressableBounce onPress={onNext} scaleTo={0.85} style={styles.arrowBtn}>
          <Text style={styles.arrow}>{'>'}</Text>
        </PressableBounce>
      </View>

      <View style={styles.toggleRow}>
        <PressableBounce onPress={onTarotPress} scaleTo={0.85} style={styles.tarotBtn}>
          <Sparkles size={16} color={Colors.tarotGold} strokeWidth={2.2} />
        </PressableBounce>

        <SegmentedToggle value={viewMode} onChange={onToggleMode} />

        <PressableBounce onPress={onFriendsPress} scaleTo={0.85} style={styles.friendsBtn}>
          <Users size={16} color={Colors.tarotGold} strokeWidth={2.2} />
        </PressableBounce>
      </View>
    </View>
  );
}

type SegmentedProps = {
  value: 'month' | 'week';
  onChange: (v: 'month' | 'week') => void;
};

const TOGGLE_PAD = 4;
const TOGGLE_TAB_PX = 22;
const TOGGLE_TAB_PY = 7;
const TOGGLE_TAB_HEIGHT = 14 + TOGGLE_TAB_PY * 2;

function SegmentedToggle({ value, onChange }: SegmentedProps) {
  const [containerW, setContainerW] = React.useState(0);
  const tabW = (containerW - TOGGLE_PAD * 2) / 2;
  const knobX = useSharedValue(value === 'month' ? 0 : 1);

  useEffect(() => {
    knobX.value = withSpring(value === 'month' ? 0 : 1, Motion.springSnap);
  }, [value, knobX]);

  const knobStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: knobX.value * tabW }],
  }));

  const monthActive = value === 'month';
  const weekActive = value === 'week';

  return (
    <View
      style={styles.toggle}
      onLayout={(e) => setContainerW(e.nativeEvent.layout.width)}
    >
      {tabW > 0 ? <Animated.View style={[styles.knob, { width: tabW }, knobStyle]} /> : null}
      <Pressable
        style={[styles.toggleTab, { width: tabW }]}
        onPress={() => onChange('month')}
        hitSlop={4}
      >
        <Text style={[styles.toggleText, monthActive && styles.toggleTextActive]}>Month</Text>
      </Pressable>
      <Pressable
        style={[styles.toggleTab, { width: tabW }]}
        onPress={() => onChange('week')}
        hitSlop={4}
      >
        <Text style={[styles.toggleText, weekActive && styles.toggleTextActive]}>Week</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center' as const,
    paddingVertical: 16,
    paddingTop: 28,
  },
  navRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 16,
  },
  arrowBtn: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  arrow: {
    color: Colors.textSecondary,
    fontSize: 20,
    fontWeight: '300' as const,
  },
  title: {
    color: Colors.white,
    fontSize: 26,
    fontFamily: 'Caveat',
  },
  toggleRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginTop: 10,
    gap: 10,
  },
  toggle: {
    flexDirection: 'row' as const,
    backgroundColor: Colors.cellBg,
    borderRadius: 20,
    padding: TOGGLE_PAD,
    overflow: 'hidden' as const,
    position: 'relative',
    height: TOGGLE_TAB_HEIGHT + TOGGLE_PAD * 2,
  },
  knob: {
    position: 'absolute',
    top: TOGGLE_PAD,
    left: TOGGLE_PAD,
    height: TOGGLE_TAB_HEIGHT,
    borderRadius: 16,
    backgroundColor: Colors.textMuted,
  },
  toggleTab: {
    paddingHorizontal: TOGGLE_TAB_PX,
    paddingVertical: TOGGLE_TAB_PY,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  toggleText: {
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: '600' as const,
  },
  toggleTextActive: {
    color: Colors.white,
  },
  tarotBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.tarotCardBack,
    borderWidth: 1,
    borderColor: Colors.tarotGold,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  friendsBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.tarotCardBack,
    borderWidth: 1,
    borderColor: Colors.tarotGold,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
});