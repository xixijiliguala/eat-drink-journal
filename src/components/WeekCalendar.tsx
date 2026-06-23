import React, { useRef } from 'react';
import { View, PanResponder, StyleSheet, type GestureResponderEvent, type PanResponderGestureState } from 'react-native';
import CalendarCell from './CalendarCell';
import WeekdayBar from './WeekdayBar';
import { formatDateKey } from '../utils/calendar';
import { type DrinkEntry } from '../context/AppContext';
import { Colors } from '../styles/colors';

interface Props {
  days: Date[];
  checkIns: Record<string, DrinkEntry[]>;
  onPressDate: (dateStr: string) => void;
  onRemoveDrink: (dateStr: string, entryId: string) => void;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
}

const SWIPE_THRESHOLD = 50;

export default function WeekCalendar({
  days,
  checkIns,
  onPressDate,
  onRemoveDrink,
  onSwipeLeft,
  onSwipeRight,
}: Props) {
  const panRef = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_: GestureResponderEvent, gs: PanResponderGestureState) =>
        Math.abs(gs.dx) > 15 && Math.abs(gs.dx) > Math.abs(gs.dy),
      onPanResponderRelease: (_: GestureResponderEvent, gs: PanResponderGestureState) => {
        if (gs.dx > SWIPE_THRESHOLD) onSwipeRight();
        else if (gs.dx < -SWIPE_THRESHOLD) onSwipeLeft();
      },
    })
  ).current;

  return (
    <View style={styles.container} {...panRef.panHandlers}>
      <WeekdayBar />
      <View style={styles.weekRow}>
        {days.map((date, i) => {
          const key = formatDateKey(date);
          return (
            <CalendarCell
              key={i}
              date={date}
              isCurrentScope
              entries={checkIns[key]}
              onPress={onPressDate}
              onRemoveDrink={onRemoveDrink}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 4,
    borderRadius: 16,
    backgroundColor: Colors.bgDark,
    paddingVertical: 8,
  },
  weekRow: {
    flexDirection: 'row' as const,
    alignItems: 'stretch' as const,
    minHeight: 80,
  },
});
