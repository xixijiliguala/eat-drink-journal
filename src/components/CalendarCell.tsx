import React, { useMemo, useRef } from 'react';
import {
  View,
  Text,
  Image,
  Alert,
  Animated,
  StyleSheet,
} from 'react-native';
import { formatDateKey, isToday } from '../utils/calendar';
import { type DrinkEntry } from '../context/AppContext';
import { Colors, Shadows } from '../styles/colors';
import PressableBounce from './PressableBounce';
import { getStickerCache } from '../utils/stickerCache';

function hashCode(s: string): number {
  let h = 0; for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0; return h;
}

interface Props {
  date: Date;
  isCurrentScope: boolean;
  entries?: DrinkEntry[];
  onPress: (dateStr: string) => void;
  onRemoveDrink?: (dateStr: string, entryId: string) => void;
  compact?: boolean;
}

export default function CalendarCell({
  date, isCurrentScope, entries = [], onPress, onRemoveDrink, compact = false,
}: Props) {
  const dateStr = useMemo(() => formatDateKey(date), [date]);
  const today = useMemo(() => isToday(date), [date]);
  const expandAnim = useRef(new Animated.Value(0)).current;
  const expanded = useRef(false);

  const handleLongPressStack = () => {
    expanded.current = !expanded.current;
    Animated.spring(expandAnim, {
      toValue: expanded.current ? 1 : 0,
      useNativeDriver: true,
      speed: 20,
      bounciness: 8,
    }).start();
  };

  const handlePressDate = () => {
    if (expanded.current) {
      expanded.current = false;
      Animated.spring(expandAnim, {
        toValue: 0,
        useNativeDriver: true,
        speed: 25,
        bounciness: 6,
      }).start();
    } else {
      onPress(dateStr);
    }
  };

  const handleRemove = (entry: DrinkEntry) => {
    if (!onRemoveDrink) return;
    Alert.alert('移除饮品', '删除这张贴纸?', [
      { text: '取消', style: 'cancel' },
      { text: '删除', style: 'destructive', onPress: () => onRemoveDrink(dateStr, entry.id) },
    ]);
  };

  const s = compact ? 36 : 42;
  const stackOffset = compact ? 7 : 9;
  const expandOffset = compact ? 28 : 38;
  const fanAngle = compact ? 6 : 7;

  if (entries.length === 0) {
    return (
      <View style={{ flex: 1, margin: compact ? 3 : 4 }}>
        <PressableBounce onPress={() => onPress(dateStr)} scaleTo={0.93} style={{ flex: 1 }}>
          <View style={[styles.cell, compact && styles.cellCompact, !isCurrentScope && styles.cellDimmed, today && styles.cellToday]}>
            <Text style={[styles.date, today && styles.dateToday]}>{date.getDate()}</Text>
          </View>
        </PressableBounce>
      </View>
    );
  }

  const displayEntries = [...entries].reverse();

  return (
    <View style={{ flex: 1, margin: compact ? 3 : 4 }}>
      <PressableBounce onPress={handlePressDate} onLongPress={handleLongPressStack} scaleTo={0.93} style={{ flex: 1 }}>
        <View style={[styles.cell, compact && styles.cellCompact, !isCurrentScope && styles.cellDimmed, today && styles.cellToday]}>
          <Text style={[styles.date, today && styles.dateToday]}>{date.getDate()}</Text>
        </View>
      </PressableBounce>

      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        <View style={styles.stackCenter}>
        {displayEntries.map((entry, i) => {
          const b64 = getStickerCache(entry.drinkId);
          const sign = i % 2 === 0 ? 1 : -1;
          const offsetIdx = Math.ceil(i / 2);
          const pos = sign * offsetIdx;
          const rot = pos * fanAngle + ((hashCode(entry.drinkId) % 4) - 2) * 0.8;
          const baseOffset = pos * stackOffset;
          const fanOffset = pos * expandOffset;

          const xOff = expandAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [baseOffset, fanOffset],
          });

          const yOff = expandAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [Math.abs(pos) * 1.5, Math.abs(pos) * 5],
          });

          return (
            <Animated.View
              key={entry.id}
              style={[
                styles.stackItem,
                {
                  zIndex: entries.length - Math.abs(pos),
                  transform: [
                    { translateX: xOff },
                    { translateY: yOff },
                    { rotate: `${rot}deg` },
                  ],
                },
              ]}
            >
              <PressableBounce
                onPress={expanded.current ? () => handleRemove(entry) : handlePressDate}
                scaleTo={0.85}
              >
                <View style={[styles.customSticker, { width: s, height: s }]}>
                  {b64 ? (
                    <Image source={{ uri: b64 }} style={styles.customStickerImg} />
                  ) : (
                    <View style={{ flex: 1, backgroundColor: Colors.cellBg, alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ fontSize: s * 0.4 }}>🖼</Text>
                    </View>
                  )}
                </View>
              </PressableBounce>
            </Animated.View>
          );
        })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cell: {
    flex: 1, backgroundColor: Colors.cellBg, borderRadius: 12,
    padding: 4, minHeight: 48, alignItems: 'center', justifyContent: 'center',
  },
  cellCompact: { minHeight: 46, padding: 4 },
  cellDimmed: { opacity: 0.35 },
  cellToday: { borderWidth: 1.5, borderColor: Colors.textToday, backgroundColor: Colors.bgDark },
  date: { color: Colors.textMuted, fontSize: 11, fontWeight: '600' },
  dateToday: { color: Colors.textToday, fontWeight: 'bold' },
  stackCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stackItem: { position: 'absolute', left: 4 },
  customSticker: {
    borderRadius: 8, overflow: 'hidden',
    ...Shadows.sticker,
  },
  customStickerImg: { width: '100%', height: '100%' },
});
