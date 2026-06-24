import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { formatDateKey, isToday } from '../utils/calendar';
import { type DrinkEntry } from '../context/AppContext';
import { Colors } from '../styles/colors';
import { FontSize, FontWeight, Motion, Spacing, Radius, ZIndex } from '../styles/tokens';
import { StickerRenderer } from './stickers/StickerRenderer';
import { resolveSticker, pickStickerSize, hashCode } from '../utils/stickerResolver';

type Props = {
  date: Date;
  isCurrentScope: boolean;
  entries?: DrinkEntry[];
  onPress: (dateStr: string) => void;
  onRemoveDrink?: (dateStr: string, entryId: string) => void;
  compact?: boolean;
};

type Placed = {
  entryId: string;
  drinkId: string;
  label?: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  delay: number;
  size: number;
};

function layoutStickers(entries: DrinkEntry[], size: number, compact: boolean): Placed[] {
  const stackOffset = compact ? 8 : 10;
  const fanAngle = compact ? 9 : 11;
  const maxShow = compact ? 4 : 5;
  const shown = entries.slice(-maxShow).reverse();
  return shown.map((entry, i) => {
    const sign = i % 2 === 0 ? 1 : -1;
    const offsetIdx = Math.ceil((i + 1) / 2);
    const x = sign * offsetIdx * stackOffset;
    const y = -Math.abs(offsetIdx) * (compact ? 2 : 3);
    const rot = sign * offsetIdx * fanAngle + ((hashCode(entry.drinkId + entry.id) % 5) - 2) * 0.6;
    return {
      entryId: entry.id,
      drinkId: entry.drinkId,
      label: entry.label,
      x,
      y,
      rotation: rot,
      scale: 1,
      delay: i * 60,
      size,
    };
  });
}

export default function CalendarCell({
  date,
  isCurrentScope,
  entries = [],
  onPress,
  onRemoveDrink,
  compact = false,
}: Props) {
  const dateStr = useMemo(() => formatDateKey(date), [date]);
  const today = useMemo(() => isToday(date), [date]);
  const [editing, setEditing] = useState(false);
  const stickerSize = pickStickerSize(compact);
  const placed = useMemo(() => layoutStickers(entries, stickerSize, compact), [entries, stickerSize, compact]);

  useEffect(() => {
    if (placed.length === 0) setEditing(false);
  }, [placed.length]);

  const handleEmptyPress = useCallback(() => onPress(dateStr), [onPress, dateStr]);
  const toggleEditing = useCallback(() => {
    if (entries.length === 0) {
      onPress(dateStr);
      return;
    }
    setEditing((e) => !e);
  }, [entries.length, onPress, dateStr]);

  const handleLongPressSticker = useCallback(
    (entryId: string) => {
      if (!onRemoveDrink) return;
      onRemoveDrink(dateStr, entryId);
    },
    [dateStr, onRemoveDrink]
  );

  if (entries.length === 0) {
    return (
      <Pressable onPress={handleEmptyPress} style={styles.cellWrap}>
        <View
          style={[
            styles.cell,
            compact && styles.cellCompact,
            !isCurrentScope && styles.cellDimmed,
            today && styles.cellToday,
          ]}
        >
          <Text style={[styles.date, today && styles.dateToday]}>{date.getDate()}</Text>
        </View>
      </Pressable>
    );
  }

  return (
    <View style={styles.cellWrap}>
      <Pressable onPress={toggleEditing} style={styles.cellSurface}>
        <View
          style={[
            styles.cell,
            compact && styles.cellCompact,
            !isCurrentScope && styles.cellDimmed,
            today && styles.cellToday,
          ]}
        >
          <Text style={[styles.date, today && styles.dateToday]}>{date.getDate()}</Text>
        </View>
      </Pressable>

      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        <View style={styles.stack} pointerEvents="box-none">
          {placed.map((p) => (
            <AnimatedSticker
              key={p.entryId}
              placed={p}
              editable={editing}
              onTap={toggleEditing}
              onLongPress={() => handleLongPressSticker(p.entryId)}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

type AnimatedStickerProps = {
  placed: Placed;
  editable: boolean;
  onTap: () => void;
  onLongPress: () => void;
};

function AnimatedSticker({ placed, editable, onTap, onLongPress }: AnimatedStickerProps) {
  const resolved = useMemo(
    () => resolveSticker(placed.drinkId, placed.entryId, placed.label),
    [placed.drinkId, placed.entryId, placed.label]
  );
  const mounted = useSharedValue(0);

  useEffect(() => {
    mounted.value = withDelay(
      placed.delay,
      withSpring(1, Motion.springBounce)
    );
  }, [placed.delay, mounted]);

  const styleAnim = useAnimatedStyle(() => {
    const s = 0.4 + mounted.value * 0.6;
    return {
      opacity: mounted.value,
      transform: [{ scale: s }],
    };
  });

  return (
    <Animated.View
      style={[
        styles.stickerSlot,
        {
          left: '50%',
          top: '55%',
          marginLeft: -placed.size / 2,
          marginTop: -placed.size / 2,
        },
        styleAnim,
      ]}
      pointerEvents={editable ? 'auto' : 'box-none'}
    >
      <StickerRenderer
        kind={resolved.kind}
        uri={resolved.uri}
        emoji={resolved.emoji}
        brandColor={resolved.brandColor}
        caption={resolved.caption}
        size={placed.size}
        rotation={placed.rotation}
        draggable={editable}
        onTap={onTap}
        onLongPress={onLongPress}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cellWrap: {
    flex: 1,
    margin: 3,
  },
  cellSurface: {
    flex: 1,
  },
  cell: {
    flex: 1,
    backgroundColor: Colors.cellBg,
    borderRadius: Radius.md,
    padding: Spacing.xs,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  cellCompact: {
    minHeight: 46,
  },
  cellDimmed: {
    opacity: 0.35,
  },
  cellToday: {
    borderWidth: 1.5,
    borderColor: Colors.textToday,
    backgroundColor: Colors.bgDark,
  },
  date: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
  dateToday: {
    color: Colors.textToday,
    fontWeight: FontWeight.bold,
  },
  stack: {
    flex: 1,
    position: 'relative',
  },
  stickerSlot: {
    position: 'absolute',
    width: 0,
    height: 0,
    zIndex: ZIndex.sticker,
  },
});
