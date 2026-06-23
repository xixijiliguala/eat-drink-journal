import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../styles/colors';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function WeekdayBar() {
  return (
    <View style={styles.bar}>
      {DAYS.map((d) => (
        <View key={d} style={styles.cell}>
          <Text style={styles.label}>{d}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row' as const,
    marginBottom: 4,
    paddingHorizontal: 8,
  },
  cell: {
    flex: 1,
    alignItems: 'center' as const,
    paddingVertical: 6,
  },
  label: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '600' as const,
    letterSpacing: 0.5,
  },
});
