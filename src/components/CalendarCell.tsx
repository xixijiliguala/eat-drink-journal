import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { formatDateKey, isToday } from '../utils/calendar';
import { type DrinkEntry } from '../context/AppContext';
import { Colors } from '../styles/colors';
import { FontFamily, FontSize, FontWeight, Motion, Radius, Spacing } from '../styles/tokens';
import { StickerRenderer } from './stickers/StickerRenderer';
import { resolveSticker, pickStickerSize, jitterFromEntry } from '../utils/stickerResolver';

type Props = {
  date: Date;
  isCurrentScope: boolean;
  entries?: DrinkEntry[];
  onPress: (dateStr: string) => void;
  onRemoveDrink?: (dateStr: string, entryId: string) => void;
  compact?: boolean;
  zIndex?: number;
};

export default function CalendarCell({
  date,
  isCurrentScope,
  entries = [],
  onPress,
  compact = false,
  zIndex,
}: Props) {
  const dateStr = useMemo(() => formatDateKey(date), [date]);
  const today = useMemo(() => isToday(date), [date]);
  const stickerSize = pickStickerSize(compact);
  const hasStickers = entries.length > 0;
  const [flippedIds, setFlippedIds] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    if (entries.length === 0 && flippedIds.size > 0) {
      setFlippedIds(new Set());
    }
  }, [entries.length, flippedIds.size]);

  const restoreTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    return () => {
      restoreTimers.current.forEach((t) => clearTimeout(t));
      restoreTimers.current.clear();
    };
  }, []);

  const handleCellPress = useCallback(() => {
    if (entries.length === 0) {
      onPress(dateStr);
      return;
    }
    const firstUnFlipped = entries.find((e) => !flippedIds.has(e.id));
    if (!firstUnFlipped) {
      onPress(dateStr);
      return;
    }
    setFlippedIds((prev) => {
      const next = new Set(prev);
      next.add(firstUnFlipped.id);
      return next;
    });
    const existing = restoreTimers.current.get(firstUnFlipped.id);
    if (existing) clearTimeout(existing);
    const t = setTimeout(() => {
      setFlippedIds((prev) => {
        if (!prev.has(firstUnFlipped.id)) return prev;
        const next = new Set(prev);
        next.delete(firstUnFlipped.id);
        return next;
      });
      restoreTimers.current.delete(firstUnFlipped.id);
    }, 2500);
    restoreTimers.current.set(firstUnFlipped.id, t);
  }, [entries, flippedIds, dateStr, onPress]);

  const handleCellLongPress = useCallback(() => {
    onPress(dateStr);
  }, [dateStr, onPress]);

  return (
    <Pressable
      onPress={handleCellPress}
      onLongPress={handleCellLongPress}
      delayLongPress={380}
      style={[styles.cellWrap, zIndex !== undefined ? { zIndex } : null]}
    >
      <View
        style={[
          styles.cell,
          !isCurrentScope && styles.cellDimmed,
          today && styles.cellToday,
        ]}
      >
        <Text style={[styles.date, today && styles.dateToday]}>{date.getDate()}</Text>

        {hasStickers ? (
          <View style={styles.stickerStage} pointerEvents="box-none">
            {entries
              .slice()
              .reverse()
              .map((entry, i, arr) => {
                const total = arr.length;
                const stackDepth = total - 1 - i;
                const isFlipped = flippedIds.has(entry.id);
                return (
                  <AnimatedStackSticker
                    key={entry.id}
                    entry={entry}
                    stickerSize={stickerSize}
                    isFlipped={isFlipped}
                    stackDepth={stackDepth}
                    total={total}
                  />
                );
              })}
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

type AnimatedStackStickerProps = {
  entry: DrinkEntry;
  stickerSize: number;
  isFlipped: boolean;
  stackDepth: number;
  total: number;
};

function AnimatedStackSticker({
  entry,
  stickerSize,
  isFlipped,
  stackDepth,
  total,
}: AnimatedStackStickerProps) {
  const resolved = useMemo(
    () => resolveSticker(entry.drinkId, entry.id, entry.label, entry.scale, entry.offsetX, entry.offsetY),
    [entry.drinkId, entry.id, entry.label, entry.scale, entry.offsetX, entry.offsetY]
  );
  const jitter = useMemo(() => jitterFromEntry(entry.id), [entry.id]);
  const mounted = useSharedValue(0);
  const flip = useSharedValue(0);

  useEffect(() => {
    mounted.value = withDelay(stackDepth * 50, withSpring(1, Motion.springBounce));
  }, [stackDepth, mounted]);

  useEffect(() => {
    flip.value = withSpring(isFlipped ? 1 : 0, {
      damping: 18,
      stiffness: 75,
      mass: 0.85,
    });
  }, [isFlipped, flip]);

  const styleAnim = useAnimatedStyle(() => {
    const topZ = isFlipped ? 9999 : total - stackDepth;
    const angle = flip.value * 180;
    const flipOpacity = angle < 90 ? 1 - angle / 90 : (angle - 90) / 90;
    return {
      opacity: mounted.value * flipOpacity,
      zIndex: topZ,
      transform: [
        { perspective: 900 },
        { rotateX: `${angle}deg` },
        { rotate: `${jitter.rotation}deg` },
        { scale: mounted.value * (1 - flip.value * 0.12) },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        styles.stickerSlot,
        {
          shadowColor: '#000',
          marginLeft: -20 + jitter.offsetX,
          marginTop: -20 + jitter.offsetY,
        },
        styleAnim,
      ]}
      pointerEvents="none"
    >
      <StickerRenderer
        kind={resolved.kind}
        uri={resolved.uri}
        emoji={resolved.emoji}
        brandColor={resolved.brandColor}
        caption={resolved.caption}
        size={stickerSize}
        rotation={0}
        scale={resolved.scale}
        offsetX={resolved.offsetX}
        offsetY={resolved.offsetY}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cellWrap: {
    flex: 1,
    margin: 3,
  },
  cell: {
    flex: 1,
    backgroundColor: Colors.cellBg,
    borderRadius: Radius.md,
    paddingTop: 3,
    paddingLeft: 5,
    paddingRight: 5,
    minHeight: 50,
    overflow: 'visible',
    justifyContent: 'flex-start',
  },
  cellDimmed: {
    opacity: 0.35,
  },
  cellToday: {
    borderWidth: 1.5,
    borderColor: Colors.textToday,
  },
  date: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    fontFamily: FontFamily.bodySemiBold,
    fontWeight: FontWeight.semibold,
    fontVariant: ['tabular-nums'],
  },
  dateToday: {
    color: Colors.textToday,
    fontWeight: FontWeight.bold,
  },
  stickerStage: {
    position: 'absolute',
    top: 14,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stickerSlot: {
    position: 'absolute',
    width: 0,
    height: 0,
    left: '50%',
    top: '50%',
    marginLeft: -20,
    marginTop: -20,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
});